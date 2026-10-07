from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from services.detector import model

from pathlib import Path
import shutil
import uuid
import cv2


# ============================================================
# HELMX FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="HelmX API",
    description="AI-Powered Helmet Detection & Safety Monitoring",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5180",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5180",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads"
RESULT_DIR = BASE_DIR / "results"

UPLOAD_DIR.mkdir(exist_ok=True)
RESULT_DIR.mkdir(exist_ok=True)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "HelmX backend is running",
        "model_loaded": model is not None
    }


# ============================================================
# IMAGE DETECTION
# ============================================================

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Use JPG, JPEG, PNG or WEBP."
        )


    # --------------------------------------------------------
    # Create unique filenames
    # --------------------------------------------------------

    file_id = str(uuid.uuid4())

    input_filename = f"{file_id}_{file.filename}"
    output_filename = f"{file_id}_result.jpg"

    input_path = UPLOAD_DIR / input_filename
    output_path = RESULT_DIR / output_filename


    # --------------------------------------------------------
    # Save uploaded image
    # --------------------------------------------------------

    try:

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Could not save uploaded image: {str(e)}"
        )


    # --------------------------------------------------------
    # Run YOLO detection
    # --------------------------------------------------------

    try:

        results = model.predict(
            source=str(input_path),
            conf=0.25,
            save=False,
            verbose=False
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Model prediction failed: {str(e)}"
        )


    # --------------------------------------------------------
    # Process detection results
    # --------------------------------------------------------

    detections = []

    annotated_image = None


    for result in results:

        # Original image
        annotated_image = result.orig_img.copy()


        for box in result.boxes:

            # Class ID
            class_id = int(box.cls[0])

            # Confidence
            confidence = float(box.conf[0])

            # Class name
            class_name = result.names[class_id]


            # Bounding box coordinates
            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )


            # ------------------------------------------------
            # Draw bounding box
            # ------------------------------------------------

            # Green for helmet
            # Red for no helmet

            if class_name.lower() == "helmet":
                box_color = (0, 200, 0)
            else:
                box_color = (0, 0, 255)


            cv2.rectangle(
                annotated_image,
                (x1, y1),
                (x2, y2),
                box_color,
                3
            )


            # ------------------------------------------------
            # Detection label
            # ------------------------------------------------

            label = f"{class_name} {confidence:.1%}"


            # Get text size
            (text_width, text_height), baseline = cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                2
            )


            # Make sure label stays inside image
            label_y = max(y1 - 10, text_height + 10)


            # Background for label
            cv2.rectangle(
                annotated_image,
                (x1, label_y - text_height - baseline - 5),
                (x1 + text_width + 10, label_y + 5),
                box_color,
                -1
            )


            # Label text
            cv2.putText(
                annotated_image,
                label,
                (x1 + 5, label_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
                cv2.LINE_AA
            )


            # ------------------------------------------------
            # Save detection information
            # ------------------------------------------------

            detections.append({
                "class": class_name,
                "confidence": round(confidence, 4),
                "box": [
                    x1,
                    y1,
                    x2,
                    y2
                ]
            })


    # --------------------------------------------------------
    # Save annotated image
    # --------------------------------------------------------

    if annotated_image is None:

        raise HTTPException(
            status_code=500,
            detail="Could not generate detection result."
        )


    try:

        success = cv2.imwrite(
            str(output_path),
            annotated_image
        )

        if not success:
            raise Exception("OpenCV could not save the result image.")

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Could not save result image: {str(e)}"
        )


    # --------------------------------------------------------
    # Count detection classes
    # --------------------------------------------------------

    helmet_count = sum(
        1
        for detection in detections
        if detection["class"].lower() == "helmet"
    )

    no_helmet_count = sum(
        1
        for detection in detections
        if detection["class"].lower() == "no_helmet"
    )


    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "success": True,

        "filename": file.filename,

        "result_image": f"/results/{output_filename}",

        "detections": detections,

        "count": len(detections),

        "summary": {
            "helmet": helmet_count,
            "no_helmet": no_helmet_count
        }
    }


# ============================================================
# SERVE RESULT IMAGE
# ============================================================

@app.get("/results/{filename}")
def get_result(filename: str):

    file_path = RESULT_DIR / filename


    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Result image not found."
        )


    return FileResponse(
        path=file_path,
        media_type="image/jpeg"
    )