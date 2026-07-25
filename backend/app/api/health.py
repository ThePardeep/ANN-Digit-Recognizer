"""Health-check API route."""

from fastapi import APIRouter

from app.ml.predictor import get_predictor
from app.schemas.response import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Report whether the service and its model are ready to serve requests."""
    try:
        get_predictor()
        model_loaded = True
    except RuntimeError:
        model_loaded = False

    return HealthResponse(status="ok", model_loaded=model_loaded)
