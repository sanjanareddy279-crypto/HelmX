from pathlib import Path
from ultralytics import YOLO

MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "best.pt"

model = YOLO(str(MODEL_PATH))

print(f"HelmX model loaded from: {MODEL_PATH}")


def detect_image(image_path: str):
    results = model.predict(
        source=image_path,
        conf=0.25,
        save=False
    )

    return results