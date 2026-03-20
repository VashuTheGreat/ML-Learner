from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import json
import logging

class FormToJSONMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_type = request.headers.get("Content-Type", "")
        
        if "application/x-www-form-urlencoded" in content_type:
            try:
                # Read the form data (handles both urlecnoded and multipart)
                form_data = await request.form()
                
                # Check if any files are present
                has_files = any(not isinstance(v, str) for v in form_data.values())
                
                if not has_files:
                    # Convert form to dict
                    json_data = {k: v for k, v in form_data.items()}
                    
                    if json_data:
                        logging.info(f"FormToJSONMiddleware: Converting form data to JSON: {list(json_data.keys())}")
                        
                        body_bytes = json.dumps(json_data).encode()
                        
                        async def receive():
                            return {
                                "type": "http.request",
                                "body": body_bytes,
                                "more_body": False
                            }
                            
                        # Update scope headers to application/json
                        scope = request.scope
                        new_headers = []
                        for k, v in scope["headers"]:
                            if k.lower() == b"content-type":
                                new_headers.append((b"content-type", b"application/json"))
                            elif k.lower() == b"content-length":
                                new_headers.append((b"content-length", str(len(body_bytes)).encode()))
                            else:
                                new_headers.append((k, v))
                                
                        scope["headers"] = new_headers
                        request._receive = receive
                else:
                    logging.info("FormToJSONMiddleware: Form contains files, skipping JSON conversion.")
            except Exception as e:
                logging.error(f"FormToJSONMiddleware error: {e}")
            
        response = await call_next(request)
        return response
