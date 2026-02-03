# common/logging/config.py
"""
Logging configuration for OASIS services.

Provides environment-aware logging:
- Production/Staging: JSON format for Cloud Run log aggregation
- Development: Human-readable format for local debugging
"""
import logging
import sys

from common.config import settings


def configure_logging(service_name: str, level: str = "INFO") -> None:
    """
    Configure logging for a service.

    Args:
        service_name: Name of the service (e.g., "auth_service")
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    is_production = settings.ENVIRONMENT in ("production", "staging")

    if is_production:
        # JSON format for Cloud Run structured logging
        log_format = (
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            f'"service": "{service_name}", "logger": "%(name)s", "message": "%(message)s"}}'
        )
    else:
        # Human-readable format for development
        log_format = f"%(asctime)s | {service_name} | %(levelname)s | %(name)s | %(message)s"

    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format=log_format,
        stream=sys.stdout,
        force=True,
    )

    # Reduce noise from verbose libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("hpack").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the given name.

    Args:
        name: Logger name, typically __name__ of the calling module

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
