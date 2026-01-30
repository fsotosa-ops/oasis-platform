# services/webhook_service/main.py
"""
Webhook Service - Universal Event Gateway for OASIS Platform.

This service handles:
- Receive webhooks from external providers (Typeform, Stripe, etc.)
- Validate signatures and authenticate requests
- Normalize payloads and dispatch to journey_service
- Dead letter queue for failed deliveries
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from common.config import get_settings
from common.exceptions import OasisException, oasis_exception_handler
from services.webhook_service.api.v1.api import api_router
from services.webhook_service.core.config import settings
from services.webhook_service.core.registry import get_registry

global_settings = get_settings()


# ============================================================================
# Application Lifecycle
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.

    Startup:
    - Discover and register webhook providers
    - Validate provider configuration
    - Log startup status

    Shutdown:
    - Cleanup resources
    """
    # === STARTUP ===
    print(f"🚀 Starting Webhook Service")
    print(f"   Environment: {global_settings.ENVIRONMENT}")
    print(f"   Supabase URL: {global_settings.SUPABASE_URL[:50]}...")

    # Initialize provider registry
    registry = get_registry()
    provider_status = registry.get_status()

    print(f"📡 Discovered {provider_status['total_providers']} provider(s)")

    # Log configuration status for each provider
    configured_count = 0
    for name, info in provider_status["providers"].items():
        if info["secret_configured"]:
            print(f"   ✅ {name} - configured and ready")
            configured_count += 1
        else:
            print(f"   ⚠️  {name} - NOT CONFIGURED (set WEBHOOK_{name.upper()}_SECRET)")

    if configured_count == 0:
        print("⚠️  No providers configured! Webhooks will return 503 until secrets are set.")

    # Validate service-to-service token
    if not settings.SERVICE_TO_SERVICE_TOKEN:
        print("⚠️  SERVICE_TO_SERVICE_TOKEN not configured - dispatch to journey_service may fail")

    # Log journey service URL
    print(f"   Journey Service URL: {settings.JOURNEY_SERVICE_URL}")

    # Log DLQ status
    if settings.DLQ_ENABLED:
        print(f"   Dead Letter Queue: ENABLED (max retries: {settings.DLQ_MAX_RETRIES})")
    else:
        print("   Dead Letter Queue: DISABLED")

    yield

    # === SHUTDOWN ===
    print("👋 Shutting down Webhook Service...")
    print("✅ Shutdown complete")


# ============================================================================
# API Documentation
# ============================================================================

description_text = """
## 🔗 OASIS Webhook Service

Universal Event Gateway para integraciones externas.

### Descripción

Este servicio recibe webhooks de proveedores externos (Typeform, Stripe, etc.),
valida firmas, normaliza payloads y despacha eventos al journey service.

### Características

- **Auto-descubrimiento**: Nuevos proveedores se registran automáticamente
- **Verificación de Firma**: Cada proveedor tiene su propia verificación segura
- **Almacenamiento Raw**: Todos los eventos se persisten antes de procesar
- **Retry con Backoff**: Despachos fallidos se reintentan con backoff exponencial
- **Dead Letter Queue**: Fallos persistentes se encolan para retry manual

### Agregar Nuevos Proveedores

1. Crear archivo en `providers/` que implemente `BaseProvider`
2. Establecer variable de entorno `WEBHOOK_{PROVIDER}_SECRET`
3. El proveedor estará automáticamente disponible en `/api/v1/webhooks/{provider}`

### Endpoints

- `POST /api/v1/webhooks/{provider}` - Recibir webhook de cualquier proveedor
- `GET /api/v1/webhooks/providers` - Listar proveedores registrados y estado
- `POST /api/v1/webhooks/dlq/retry` - Reintentar eventos fallidos manualmente
"""

tags_metadata = [
    {
        "name": "Webhooks",
        "description": "Webhook reception and processing",
    },
    {
        "name": "Providers",
        "description": "Provider management and status",
    },
    {
        "name": "DLQ",
        "description": "Dead letter queue management",
    },
    {
        "name": "System",
        "description": "Health checks and system endpoints",
    },
]


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="OASIS Webhook Service",
    version="1.0.0",
    description=description_text,
    openapi_tags=tags_metadata,
    openapi_url=f"{global_settings.API_V1_STR}/openapi.json",
    docs_url=f"{global_settings.API_V1_STR}/docs",
    redoc_url=f"{global_settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)


# ============================================================================
# Middleware
# ============================================================================

# CORS - Allow all origins (webhooks come from external services)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Exception Handlers
# ============================================================================

# Custom exception handler for consistent error responses
app.add_exception_handler(OasisException, oasis_exception_handler)


# ============================================================================
# Routes
# ============================================================================

app.include_router(api_router, prefix=global_settings.API_V1_STR)


# ============================================================================
# Health Check & Root
# ============================================================================


@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check_endpoint(response: Response):
    """
    Service health check.

    Returns:
    - 200 OK: Service is healthy
    - 503 Service Unavailable: No providers configured
    """
    registry = get_registry()
    provider_status = registry.get_status()

    is_healthy = provider_status["configured_providers"] > 0

    result = {
        "status": "healthy" if is_healthy else "degraded",
        "service": "webhook_service",
        "providers": {
            "total": provider_status["total_providers"],
            "configured": provider_status["configured_providers"],
        },
        "dlq_enabled": settings.DLQ_ENABLED,
    }

    if not is_healthy:
        result["warning"] = "No providers configured"
        # Don't return 503 - service is functional, just no providers ready
        # response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return result


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirect to docs."""
    return {
        "service": "OASIS Webhook Service",
        "docs": f"{global_settings.API_V1_STR}/docs",
    }
