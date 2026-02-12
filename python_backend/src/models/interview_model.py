from pydantic import BaseModel
from typing import List, Annotated, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class ChatState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages]
    topic: Optional[str] = None
    time_remaining: int  # in seconds
    questions_generated: bool = False