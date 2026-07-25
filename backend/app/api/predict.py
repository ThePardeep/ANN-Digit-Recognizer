"""Prediction API routes."""

from fastapi import APIRouter, HTTPException, status

from app.core.logging import get_logger
from app.ml.predictor import get_predictor
from app.ml.preprocess import InvalidImageError, decode_base64_image
from app.schemas.request import PredictionRequest
from app.schemas.response import PredictionResponse

router = APIRouter(tags=["prediction"])
logger = get_logger(__name__)


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={400: {"description": "Invalid or empty image data."}},
)
def predict_digit(payload: PredictionRequest) -> PredictionResponse:
    """Predict the handwritten digit contained in a base64-encoded image."""
    try:
        image = decode_base64_image(payload.image)
        predictor = get_predictor()
        result = predictor.predict(image)
    except InvalidImageError as exc:
        logger.warning("Rejected prediction request: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    logger.info(
        "Prediction=%d confidence=%.4f inference_ms=%.2f",
        result.prediction,
        result.confidence,
        result.inference_time_ms,
    )

    return PredictionResponse(
        prediction=result.prediction,
        confidence=result.confidence,
        probabilities=result.probabilities,
        inference_time_ms=result.inference_time_ms,
    )
