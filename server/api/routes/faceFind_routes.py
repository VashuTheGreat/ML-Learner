import fastapi
from fastapi import WebSocket, WebSocketDisconnect
from PIL import Image
import io

from src.pipelines.faceFinder_pipeline import FaceFinderPipeline

router = fastapi.APIRouter(tags=["Face Detection"])

@router.websocket("/findFace")
async def find_face(websocket: WebSocket):
    """
    WebSocket endpoint for real-time face detection during interviews.
    
    Communication Flow:
    1. Client initiates connection to `ws://<host>:<port>/api/v1/face/findFace`
    2. Client streams raw image binary bytes (e.g., JPEG/PNG frames from webcam).
    3. Server processes each frame using the FaceFinderPipeline.
    4. Server sends back a JSON response payload for each processed frame.
    
    Expected JSON response structure:
    ```json
    {
        "face_present": true,
        "multiple_faces": false,
        "is_error": false,
        "error_message": null
    }
    ```
    """
    await websocket.accept()
    pipeline = FaceFinderPipeline()

    try:
        while True:
            data = await websocket.receive_bytes()

            try:
                img = Image.open(io.BytesIO(data)).convert("RGB")
                
                result = await pipeline.initiate(img=img)
                await websocket.send_json(result)

            except WebSocketDisconnect:
                raise
            except Exception as e:
                if "cannot identify image file" in str(e).lower():
                    continue
                
                try:
                    await websocket.send_json({
                        "is_error": True,
                        "error_message": str(e),
                        "data": None
                    })
                except Exception:
                    print(f"Could not send error to client: {e}")

    except WebSocketDisconnect:
        print("Client safely disconnected")

    except Exception as e:
        print("Unexpected error:", e)