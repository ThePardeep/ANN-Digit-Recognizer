"""Response schemas for the prediction API."""

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    """Result of running the ANN on a submitted digit drawing."""

    prediction: int = Field(..., ge=0, le=9, description="Predicted digit (0-9).")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Softmax probability of the predicted digit."
    )
    probabilities: dict[str, float] = Field(
        ..., description="Softmax probability for each digit class, keyed by digit string."
    )
    inference_time_ms: float = Field(
        ..., ge=0.0, description="Model inference time in milliseconds."
    )


class HealthResponse(BaseModel):
    """Health-check response."""

    status: str = Field(..., description="Overall service status, e.g. 'ok'.")
    model_loaded: bool = Field(..., description="Whether the ANN model is loaded and ready.")


class ErrorResponse(BaseModel):
    """Standardized error payload."""

    detail: str = Field(..., description="Human-readable error message.")
