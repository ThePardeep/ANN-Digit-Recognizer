"""Structured logging configuration for the application."""

import logging
import sys

from app.core.config import get_settings


def configure_logging() -> None:
    """Configure root logging with a consistent structured format."""
    settings = get_settings()

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level)
    root_logger.handlers = [handler]

    # Quiet down noisy third-party loggers.
    logging.getLogger("tensorflow").setLevel(logging.ERROR)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a module-scoped logger."""
    return logging.getLogger(name)
