from pydantic import BaseModel


class ChatInterviewBody(BaseModel):
    topic: str
    companyName: str
    time_remain: int
    user_input: str
    thread_id: str = '1'

    