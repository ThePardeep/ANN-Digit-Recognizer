"""Image preprocessing utilities shared by training and inference."""

import base64
import binascii
import io

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError

IMAGE_SIZE = 28


class InvalidImageError(ValueError):
    """Raised when an incoming image cannot be decoded or is unusable."""


def decode_base64_image(base64_str: str) -> Image.Image:
    """Decode a base64 string into a Pillow image.

    Raises:
        InvalidImageError: if the string is not valid base64 or not a valid image.
    """
    try:
        raw_bytes = base64.b64decode(base64_str, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise InvalidImageError("Image data is not valid base64.") from exc

    if not raw_bytes:
        raise InvalidImageError("Image data is empty.")

    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.load()
    except UnidentifiedImageError as exc:
        raise InvalidImageError("Could not identify image format.") from exc

    return image


def _center_on_mass(digit: np.ndarray) -> np.ndarray:
    """Shift a 28x28 digit so its center of mass aligns with the image center.

    This mirrors the standard MNIST preparation procedure and significantly
    improves accuracy on freehand canvas drawings, which are rarely centered.
    """
    moments = cv2.moments(digit)
    total_mass = moments["m00"]
    if total_mass == 0:
        return digit

    center_x = moments["m10"] / total_mass
    center_y = moments["m01"] / total_mass

    shift_x = np.round(IMAGE_SIZE / 2.0 - center_x).astype(int)
    shift_y = np.round(IMAGE_SIZE / 2.0 - center_y).astype(int)

    transform = np.float32([[1, 0, shift_x], [0, 1, shift_y]])
    return cv2.warpAffine(digit, transform, (IMAGE_SIZE, IMAGE_SIZE))


def preprocess_image_for_inference(image: Image.Image) -> np.ndarray:
    """Convert an arbitrary PIL image into a normalized, flattened MNIST-style vector.

    Pipeline: grayscale -> composite onto white background (if alpha present) ->
    crop to the digit's bounding box -> resize to 20x20 preserving aspect ratio ->
    pad to 28x28 -> center on mass -> invert if needed -> normalize -> flatten.

    Returns:
        A (1, 784) float32 array with pixel values in [0, 1].

    Raises:
        InvalidImageError: if the image contains no discernible digit strokes.
    """
    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        background = Image.new("RGBA", image.size, (255, 255, 255, 255))
        image = Image.alpha_composite(background, image.convert("RGBA"))

    grayscale = np.array(image.convert("L"), dtype=np.uint8)

    # Canvas convention: dark strokes on a light background. Flip to the
    # MNIST convention (bright digit on dark background) for the model.
    inverted = 255 - grayscale

    # Drop faint anti-aliasing noise before locating the digit.
    _, thresholded = cv2.threshold(inverted, 30, 255, cv2.THRESH_TOZERO)

    coords = cv2.findNonZero(thresholded)
    if coords is None:
        raise InvalidImageError("No digit strokes detected in the image.")

    x, y, w, h = cv2.boundingRect(coords)
    cropped = thresholded[y : y + h, x : x + w]

    if max(w, h) == 0:
        raise InvalidImageError("No digit strokes detected in the image.")

    scale = 20.0 / max(w, h)
    new_w, new_h = max(1, round(w * scale)), max(1, round(h * scale))
    resized = cv2.resize(cropped, (new_w, new_h), interpolation=cv2.INTER_AREA)

    canvas = np.zeros((IMAGE_SIZE, IMAGE_SIZE), dtype=np.uint8)
    pad_x = (IMAGE_SIZE - new_w) // 2
    pad_y = (IMAGE_SIZE - new_h) // 2
    canvas[pad_y : pad_y + new_h, pad_x : pad_x + new_w] = resized

    centered = _center_on_mass(canvas)

    normalized = centered.astype(np.float32) / 255.0
    return normalized.reshape(1, IMAGE_SIZE * IMAGE_SIZE)
