from pydantic import BaseModel,Field
from typing import List

class FormFillerOutput(BaseModel):
    value:str=Field(description="This is the value witch must be filled in that field")
class FormFillerModel(BaseModel):
    output:List[FormFillerOutput]
