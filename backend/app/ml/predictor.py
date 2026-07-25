"""Inference wrapper around the trained ANN digit classifier.

The model is loaded once and reused for all requests — never reloaded or
retrained during a request.
"""

import time
from pathlib import Path
from typing import NamedTuple

import numpy as np
from PIL import Image
from tensorflow import keras

from app.core.logging import get_logger
from app.ml.preprocess import preprocess_image_for_inference

logger = get_logger(__name__)


class PredictionResult(NamedTuple):
    """Structured output of a single prediction."""

    prediction: int
    confidence: float
    probabilities: dict[str, float]
    inference_time_ms: float


class DigitPredictor:
    """Loads a trained Keras model and exposes a simple predict() method."""

    def __init__(self, model_path: Path) -> None:
        if not model_path.exists():
            raise FileNotFoundError(
                f"No trained model found at {model_path}. Run `python -m app.ml.train` first."
            )

        logger.info("Loading digit classification model from %s", model_path)
        self._model = keras.models.load_model(model_path)

        # Warm up the graph so the first real request isn't penalized.
        self._model.predict(np.zeros((1, 784), dtype=np.float32), verbose=0)
        logger.info("Model loaded and warmed up.")

    def predict(self, image: Image.Image) -> PredictionResult:
        """Run preprocessing + inference on a PIL image and return the result."""
        features = preprocess_image_for_inference(image)

        start = time.perf_counter()
        raw_probabilities = self._model.predict(features, verbose=0)[0]
        elapsed_ms = (time.perf_counter() - start) * 1000

        predicted_digit = int(np.argmax(raw_probabilities))
        confidence = float(raw_probabilities[predicted_digit])
        probabilities = {str(digit): float(prob) for digit, prob in enumerate(raw_probabilities)}

        return PredictionResult(
            prediction=predicted_digit,
            confidence=confidence,
            probabilities=probabilities,
            inference_time_ms=elapsed_ms,
        )


_predictor: DigitPredictor | None = None


def get_predictor(model_path: Path | None = None) -> DigitPredictor:
    """Return the process-wide singleton predictor, creating it if needed."""
    global _predictor
    if _predictor is None:
        if model_path is None:
            raise RuntimeError("Predictor has not been initialized yet.")
        _predictor = DigitPredictor(model_path)
    return _predictor
