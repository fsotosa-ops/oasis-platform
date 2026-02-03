# common/logging/__init__.py
"""
Centralized logging configuration for OASIS services.
"""
from common.logging.config import configure_logging, get_logger

__all__ = ["configure_logging", "get_logger"]
