"""Request schemas for the prediction API."""

from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    """Payload containing a base64-encoded canvas drawing."""

    image: str = Field(
        ...,
        description="Base64-encoded PNG image of the drawn digit, optionally prefixed with a data URL header.",
        min_length=1,
    )

    @field_validator("image")
    @classmethod
    def strip_data_url_header(cls, value: str) -> str:
        """Remove a `data:image/png;base64,` prefix if present."""
        if "," in value and value.strip().startswith("data:"):
            return value.split(",", 1)[1]
        return value
