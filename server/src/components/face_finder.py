from PIL import Image
import numpy as np
import mediapipe as mp
from utils.asyncHandler import asyncHandler
import logging
import cv2

class FaceFinder:
    def __init__(self):
        self.mpFace = mp.solutions.face_detection
        self.face = self.mpFace.FaceDetection()
        self.mpDraw = mp.solutions.drawing_utils

    @asyncHandler
    async def find(self, img: Image):
        logging.info("Entered in the face finder component")

        try:
            img_array = np.array(img)
            img_rgb = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)

            results = self.face.process(img_rgb)

            if not results.detections:
                return {
                    "is_error": True,
                    "error_message": "Face not found",
                    "face_count": 0,
                    "data": None
                }

            detections = results.detections
            detections = sorted(detections, key=lambda d: d.score[0], reverse=True)

            # Count high-confidence detections
            high_conf = [d for d in detections if d.score[0] > 0.6]
            face_count = len(high_conf) if len(high_conf) > 0 else 1

            if face_count > 1:
                return {
                    "is_error": True,
                    "error_message": f"{face_count} faces detected",
                    "face_count": face_count,
                    "data": None
                }

            detection = detections[0]

            logging.info("Exited from the face finder component")

            return {
                "is_error": False,
                "error_message": None,
                "face_count": 1,
                "data": {
                    "score": float(detection.score[0]),
                    "relative_bounding_box": {
                        "xmin": detection.location_data.relative_bounding_box.xmin,
                        "ymin": detection.location_data.relative_bounding_box.ymin,
                        "width": detection.location_data.relative_bounding_box.width,
                        "height": detection.location_data.relative_bounding_box.height
                    }
                }
            }

        except Exception as e:
            logging.error(f"Error in FaceFinder: {str(e)}")

            return {
                "is_error": True,
                "error_message": str(e),
                "data": None
            }