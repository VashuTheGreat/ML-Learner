import fastapi
from fastapi import WebSocket, WebSocketDisconnect
from PIL import Image
import io

from src.Predictors.pipelines.faceFinder_pipeline import FaceFinderPipeline

router = fastapi.APIRouter()

@router.websocket("/findFace")
async def find_face(websocket: WebSocket):
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