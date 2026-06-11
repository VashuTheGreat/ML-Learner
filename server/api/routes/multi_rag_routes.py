import logging
import os
import uuid
from fastapi import APIRouter, Request, UploadFile, File, BackgroundTasks, HTTPException,Depends
from fastapi.responses import JSONResponse
from langchain_core.messages import HumanMessage

from src.constants import (
    ARTIFACT_DIR,
    TRANSFORMATION_FOLDER_NAME,
    INGESTION_FOLDER_NAME,
    PUBLIC_FOLDER_FILE_PATH,
    DEFAULT_COOKIE_MAX_AGE_SECONDS,
)
from src.graphs.multi_rag_graph_builder import load_conversation as GraphConversationLoader
from api.models.multi_rag_models import ChatRequest
from src.pipelines.multi_rag_graph_runner_pipeline import RunGraphPipeline
from src.pipelines.Vectiorizer_pipeline import VectiorizerPipeline
from api.middlewares.multi_rag_middleware import authenticate_user
from src.entity.config_entity import (
    DataIngestionConfig, 
    ContentEmbedderConfig, 
    DataTransformationConfig, 
    ContentTransformationConfig,
    RetreiverConfig
)
from src.retrievers.create_retreivers import Retreiver
from api.helper.multi_rag_helper import delete_thread


router = APIRouter(tags=['Multi-Rag'])

@router.post(
    "/chat",
    tags=['Chat'],
    summary="Chat with ingested documents",
    description="Sends a chat message to the Multi-RAG LangGraph pipeline, retrieving relevant information from the ingested document vector stores and generating an AI response.",
    responses={
        200: {
            "description": "Chat response generated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Chat completed successfully",
                        "data": {
                            "response": "This is a mocked AI response.",
                            "user": {
                                "thread_id": "pytest-api-test-12345"
                            }
                        }
                    }
                }
            }
        },
        400: {
            "description": "Validation error or missing ingested documents.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "first ingest the data and then chat",
                        "data": None
                    }
                }
            }
        },
        401: {
            "description": "Session unauthorized or not initiated.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "pls initiate",
                        "data": None
                    }
                }
            }
        },
        500: {
            "description": "Internal server error during processing.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Failed to run graph pipeline.",
                        "data": None
                    }
                }
            }
        }
    }
    ,
    dependencies=[Depends(authenticate_user)]
)
async def chat_endpoint(request: Request, chat_request: ChatRequest):
    try:
        user = request.scope.get("user")
        if not user:
            raise HTTPException(status_code=401, detail={"data": None, "message": "pls initiate", "success": False})

        thread_id = user.thread_id
        user_artifact_dir = os.path.join(ARTIFACT_DIR, thread_id)
        if not os.path.exists(user_artifact_dir):
            raise HTTPException(status_code=400, detail={"data": None, "message": "first ingest the data and then chat", "success": False})

        vector_store_base = os.path.join(user_artifact_dir, TRANSFORMATION_FOLDER_NAME)
        if not os.path.exists(vector_store_base):
            raise HTTPException(status_code=400, detail={"data": None, "message": "first ingest the data and then chat", "success": False})

        vector_store_paths = []
        for d in os.listdir(vector_store_base):
            path = os.path.join(vector_store_base, d)
            if os.path.isdir(path):
                vector_store_paths.append(path)

        if not vector_store_paths:
            raise HTTPException(status_code=400, detail={"data": None, "message": "no vector stores found, please ingest data", "success": False})

        initial_state = {
            "messages": [HumanMessage(content=chat_request.message)],
            "vector_store_file_paths": vector_store_paths,
            "queries": [],
            "retreived_results": [],
            "ai_response": ""
        }

        graph_pipeline = RunGraphPipeline()
        graph_result = await graph_pipeline.run_graph(initial_state, config={"configurable": {"thread_id": thread_id}})
        logging.info(f"Graph execution result: {graph_result}")

        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "response": graph_result.get("ai_response", "No response generated"),
                    "user": user.dict()
                },
                "message": "Chat completed successfully",
                "success": True
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error during chat: {e}")
        raise HTTPException(status_code=500, detail={"data": None, "message": str(e), "success": False})

@router.get(
    "/ingest",
    tags=['File'],
    summary="Ingest uploaded files",
    description="Processes and vectorizes all uploaded files for the active user session. Embeds the content and saves the vector stores to enable retrieval during chat.",
    responses={
        200: {
            "description": "Ingestion completed successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Ingestion completed successfully",
                        "data": {
                            "files_processed": 1,
                            "all_docs": [
                                {
                                    "page_content": "Example page content from PDF.",
                                    "metadata": {"source": "report.pdf"}
                                }
                            ]
                        }
                    }
                }
            }
        },
        400: {
            "description": "No files found to ingest.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "No files to ingest",
                        "data": None
                    }
                }
            }
        },
        401: {
            "description": "Session unauthorized or not initiated.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "pls initiate",
                        "data": None
                    }
                }
            }
        },
        404: {
            "description": "No user folder found.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "No files found for this user",
                        "data": None
                    }
                }
            }
        },
        500: {
            "description": "Internal server error during ingestion.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Error during ingestion.",
                        "data": None
                    }
                }
            }
        }
    },

    dependencies=[Depends(authenticate_user)]
)
async def ingest_docs(request: Request):
    try:
        user = request.scope.get("user")
        if not user:
            raise HTTPException(status_code=401, detail={"data": None, "message": "pls initiate", "success": False})
        
        thread_id = user.thread_id
        folder_path = os.path.join(PUBLIC_FOLDER_FILE_PATH, thread_id)
        
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail={"data": None, "message": "No files found for this user", "success": False})

        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        if not files:
            raise HTTPException(status_code=400, detail={"data": None, "message": "No files to ingest", "success": False})

        ingestion_configs = [
            DataIngestionConfig(
                input_file_path=os.path.join(folder_path, file_name),
                save_file_path=f"{ARTIFACT_DIR}/{thread_id}/{INGESTION_FOLDER_NAME}/{file_name}.pdf"
            )
            for file_name in files
        ]

        content_embedder_config = ContentEmbedderConfig(data_ingestion_configs=ingestion_configs)
        
        transformation_configs = [
            DataTransformationConfig(vector_store_path=f"{ARTIFACT_DIR}/{thread_id}/{TRANSFORMATION_FOLDER_NAME}/{file_name}")
            for file_name in files
        ]
        
        content_transformation_config = ContentTransformationConfig(data_transformation_configs=transformation_configs)

        vectorizer_pipeline = VectiorizerPipeline(
            content_embedder_config=content_embedder_config,
            content_transformation_config=content_transformation_config
        )

        result = await vectorizer_pipeline.initiate(thread_id=thread_id)
        logging.info(f"Vectorizer Pipeline Result: {result}")
        vector_store_paths = [art.vector_store_path for art in result.data_transformation_artifacts]

        retreiver_config = RetreiverConfig()
        retreiver = Retreiver(retreiver_config=retreiver_config)
        all_docs = await retreiver.get_all_documents(vector_store_paths)
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "files_processed": len(files),
                    "all_docs": all_docs
                },
                "message": "Ingestion completed successfully",
                "success": True
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error during ingestion: {e}")
        raise HTTPException(status_code=500, detail={"data": None, "message": str(e), "success": False})

@router.get(
    "/conversation",
    tags=['Conversation'],
    summary="Load chat history",
    description="Retrieves the chat history messages associated with the current user's session from the graph checkpointer.",
    responses={
        200: {
            "description": "Conversation messages loaded successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Conversation loaded successfully",
                        "data": {
                            "messages": [
                                {
                                    "type": "human",
                                    "content": "Hello document"
                                },
                                {
                                    "type": "ai",
                                    "content": "Hello, how can I help you?"
                                }
                            ]
                        }
                    }
                }
            }
        },
        401: {
            "description": "Session unauthorized or not initiated.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "pls initiate",
                        "data": None
                    }
                }
            }
        },
        500: {
            "description": "Internal server error loading chat history.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Failed to load conversation.",
                        "data": None
                    }
                }
            }
        }
    },
    dependencies=[Depends(authenticate_user)]
)
async def load_conversation(request: Request):
    try:
        user = request.scope.get("user")
        if not user:
            raise HTTPException(status_code=401, detail={"data": None, "message": "pls initiate", "success": False})
        thread_id = user.thread_id
        messages = await GraphConversationLoader(thread_id)
        return JSONResponse(
            status_code=200,
            content={
                "data": {"messages": messages},
                "message": "Conversation loaded successfully",
                "success": True
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error loading conversation: {e}")
        raise HTTPException(status_code=500, detail={"data": None, "message": "Failed to load conversation.", "success": False})

@router.post(
    "/upload",
    tags=["File"],
    summary="Upload document file",
    description="Uploads a PDF or text document to the user's session folder so it can be indexed and vectorized.",
    responses={
        200: {
            "description": "File uploaded successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "File uploaded successfully",
                        "data": {
                            "filename": "1234-5678-uuid_document.pdf",
                            "thread_id": "pytest-api-test-12345"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Session unauthorized or not initiated.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "pls initiate",
                        "data": None
                    }
                }
            }
        },
        500: {
            "description": "Internal server error during upload.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Failed to upload the file.",
                        "data": None
                    }
                }
            }
        }
    },
    dependencies=[Depends(authenticate_user)]
)
async def upload_file(request: Request, file: UploadFile = File(...)):
    try:
        user = request.scope.get("user")
        if not user:
            raise HTTPException(status_code=401, detail={"data": None, "message": "pls initiate", "success": False})

        thread_id = user.thread_id
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_location = os.path.join(PUBLIC_FOLDER_FILE_PATH, thread_id, unique_filename)

        os.makedirs(os.path.dirname(file_location), exist_ok=True)
        
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logging.info(f"File '{file.filename}' uploaded successfully for thread '{thread_id}'.")
        
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "filename": unique_filename,
                    "thread_id": thread_id
                },
                "message": "File uploaded successfully",
                "success": True
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error occurred while saving the file: {e}")
        raise HTTPException(status_code=500, detail={"data": None, "message": "Failed to upload the file.", "success": False})
    finally:
        await file.close()

@router.get(
    "/initiate/{seconds}",
    tags=["User"],
    summary="Initiate RAG session",
    description="Initiates a secure thread session by generating a session ID, setting a secure http-only cookie, and scheduling background cleanup of the thread artifacts after the given duration.",
    responses={
        200: {
            "description": "RAG session initiated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "initiate successful.",
                        "data": {
                            "thread_id": "pytest-api-test-12345"
                        }
                    }
                }
            }
        }
    }
)
async def initiate(request: Request, seconds: int, background_tasks: BackgroundTasks):
    """Endpoint to handle user initiate. Sets a cookie and schedules data deletion."""
    thread_id = str(uuid.uuid4())
    
    response = JSONResponse(
        status_code=200,
        content={
            "data": {"thread_id": thread_id},
            "message": "initiate successful.",
            "success": True
        }
    )
    response.set_cookie(
        key="thread_id", 
        value=thread_id, 
        httponly=True,
        max_age=DEFAULT_COOKIE_MAX_AGE_SECONDS
    )
    
    background_tasks.add_task(delete_thread, thread_id=thread_id, delay_seconds=seconds)

    return response
