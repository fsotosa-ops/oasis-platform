# services/journey_service/main.py
"""
Journey Service - User Experience, Progression & Gamification for OASIS Platform.

This service handles:
- Journey enrollment and progress
- Activity tracking and points
- Gamification (levels, badges, rewards)
- Analytics and reporting
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from common.config import get_settings
from common.database.client import close_db_connections, health_check, verify_connection
from common.exceptions import OasisException, oasis_exception_handler
from common.logging import configure_logging
from common.middleware import AuditMiddleware, RateLimitConfig, setup_rate_limiting
from services.journey_service.api.v1.api import api_router
from services.journey_service.core.config import settings

# Configure logging before anything else
configure_logging("journey_service")

global_settings = get_settings()


# ============================================================================
# Application Lifecycle
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.

    Startup:
    - Verify database connection
    - Log configuration

    Shutdown:
    - Close database connections
    """
    # === STARTUP ===
    print(f"🚀 Starting {settings.PROJECT_NAME}")
    print(f"   Environment: {global_settings.ENVIRONMENT}")
    print(f"   Supabase URL: {global_settings.SUPABASE_URL[:50]}...")

    try:
        await verify_connection()
        print("✅ Database connection verified")
    except Exception as e:
        print(f"⚠️  Database connection warning: {e}")
        # Don't fail startup - allow service to start and retry later

    yield

    # === SHUTDOWN ===
    print("👋 Shutting down...")
    await close_db_connections()
    print("✅ Shutdown complete")


# ============================================================================
# API Documentation
# ============================================================================

description_text = """
## 🎮 OASIS Journey & Gamification Service

Microservicio encargado de la experiencia del usuario, progresión y gamificación.

### Autenticación

Todos los endpoints requieren un JWT válido en el header:
```
Authorization: Bearer <token>
```

### Multi-Tenant Context

Para operaciones específicas de organización, incluir:
```
X-Organization-ID: <uuid>
```

### Endpoints Principales

- **Journeys** - Rutas de experiencia (lectura)
- **Enrollments** - Inscripciones de usuarios
- **Tracking** - Registro de actividades y puntos
- **Gamification** - Niveles, badges y recompensas

### Admin Endpoints

- **Admin Journeys** - CRUD de journeys y steps
- **Admin Gamification** - Configuración de niveles y rewards
- **Admin Analytics** - Reportes y estadísticas
"""

tags_metadata = [
    {
        "name": "Journeys",
        "description": "Journey discovery and progress tracking",
    },
    {
        "name": "Enrollments",
        "description": "User enrollment in journeys",
    },
    {
        "name": "Tracking",
        "description": "Activity tracking and points",
    },
    {
        "name": "Gamification",
        "description": "User stats, levels, and achievements",
    },
    {
        "name": "Admin - Journeys",
        "description": "Journey and step management (admin only)",
    },
    {
        "name": "Admin - Gamification",
        "description": "Levels and rewards configuration (admin only)",
    },
    {
        "name": "Admin - Analytics",
        "description": "Reports and statistics (admin only)",
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
    title=settings.PROJECT_NAME,
    version=settings.VERSION if hasattr(settings, "VERSION") else "1.0.0",
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

# CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit middleware for automatic operation logging
app.add_middleware(AuditMiddleware, service_name="journey_service")


# ============================================================================
# Exception Handlers & Rate Limiting
# ============================================================================

# Custom exception handler for consistent error responses
app.add_exception_handler(OasisException, oasis_exception_handler)

# Rate limiting - disabled in development
is_development = global_settings.ENVIRONMENT in ("development", "local", "dev")

setup_rate_limiting(
    app,
    RateLimitConfig(
        enabled=not is_development,
        default_limit="200/minute",
        write_limit="100/minute",
        read_limit="300/minute",
    ),
)


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
    - 503 Service Unavailable: Database connection issues
    """
    health = await health_check()

    result = {
        "status": "healthy" if health["healthy"] else "unhealthy",
        "service": settings.PROJECT_NAME,
        "database": "connected" if health["healthy"] else "disconnected",
    }

    if not health["healthy"]:
        result["error"] = health.get("error")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return result


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirect to docs."""
    return {
        "service": settings.PROJECT_NAME,
        "docs": f"{global_settings.API_V1_STR}/docs",
    }
