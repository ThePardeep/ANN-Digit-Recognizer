"""Evaluate a saved digit ANN model against the MNIST test set.

Run as a standalone script:

    python -m app.ml.evaluate
"""

import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow import keras

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.ml.train import load_data

logger = get_logger(__name__)


def main() -> None:
    configure_logging()
    settings = get_settings()

    if not settings.model_path.exists():
        raise FileNotFoundError(
            f"No trained model found at {settings.model_path}. Run `python -m app.ml.train` first."
        )

    model = keras.models.load_model(settings.model_path)
    _, (x_test, y_test) = load_data()

    test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
    logger.info("Test accuracy: %.4f | Test loss: %.4f", test_accuracy, test_loss)

    predictions = np.argmax(model.predict(x_test, verbose=0), axis=1)
    logger.info("\n%s", classification_report(y_test, predictions, digits=4))
    logger.info("Confusion matrix:\n%s", confusion_matrix(y_test, predictions))


if __name__ == "__main__":
    main()
