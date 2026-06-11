from pydantic import BaseModel, Field

class ChatInterviewBody(BaseModel):
    """
    Schema for streaming mock interview chat interactions.
    Sent for each turn of user input in the AI interview simulator.
    """
    topic: str = Field(
        ..., 
        description="The technical or behavioral topic of the mock interview.",
        example="Machine Learning Operations (MLOps)"
    )
    companyName: str = Field(
        ..., 
        description="The target company name for the simulated interview.",
        example="Google"
    )
    time_remain: int = Field(
        ..., 
        description="The remaining time for the interview in seconds.",
        example=1800
    )
    user_input: str = Field(
        ..., 
        description="The message or response sent by the user during the chat round.",
        example="I have experience deploying models using Docker, Kubernetes, and FastAPI."
    )
    thread_id: str = Field(
        '1', 
        description="Unique thread identifier to track the chat session state in LangGraph checkpointer.",
        example="session_uuid_99"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "topic": "Machine Learning",
                "companyName": "Google",
                "time_remain": 1800,
                "user_input": "I specialize in deep learning and NLP architectures.",
                "thread_id": "google-ml-12345"
            }
        }