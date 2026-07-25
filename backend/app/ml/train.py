"""Train the ANN digit classifier on MNIST and save it to disk.

Run as a standalone script:

    python -m app.ml.train

This is intentionally separate from the inference path — the API only ever
loads a pre-trained `.keras` file at startup and never retrains.
"""

import tensorflow as tf
from tensorflow import keras

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger

logger = get_logger(__name__)

IMAGE_SIZE = 28
NUM_CLASSES = 10
NUM_PIXELS = IMAGE_SIZE * IMAGE_SIZE


def load_data() -> tuple[tuple, tuple]:
    """Load and normalize the MNIST dataset, flattened to 784-dim vectors."""
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

    x_train = x_train.astype("float32").reshape(-1, NUM_PIXELS) / 255.0
    x_test = x_test.astype("float32").reshape(-1, NUM_PIXELS) / 255.0

    return (x_train, y_train), (x_test, y_test)


def build_model() -> keras.Model:
    """Build the ANN (multi-layer perceptron) architecture.

    Input(784) -> Dense(256, ReLU) -> Dropout -> Dense(128, ReLU) -> Dropout
               -> Dense(64, ReLU) -> Output(10, Softmax)
    """
    model = keras.Sequential(
        [
            keras.layers.Input(shape=(NUM_PIXELS,)),
            keras.layers.Dense(256, activation="relu"),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(128, activation="relu"),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(64, activation="relu"),
            keras.layers.Dense(NUM_CLASSES, activation="softmax"),
        ],
        name="digit_ann",
    )

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train(epochs: int = 20, batch_size: int = 128) -> keras.Model:
    """Train the ANN and return the fitted model."""
    (x_train, y_train), (x_test, y_test) = load_data()

    model = build_model()
    model.summary(print_fn=logger.info)

    early_stopping = keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=3, restore_best_weights=True
    )

    logger.info("Starting training for up to %d epochs...", epochs)
    model.fit(
        x_train,
        y_train,
        validation_split=0.1,
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stopping],
        verbose=2,
    )

    test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
    logger.info("Test accuracy: %.4f | Test loss: %.4f", test_accuracy, test_loss)

    return model


def main() -> None:
    configure_logging()
    tf.random.set_seed(42)

    settings = get_settings()
    model = train()

    settings.model_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(settings.model_path)
    logger.info("Model saved to %s", settings.model_path)


if __name__ == "__main__":
    main()
