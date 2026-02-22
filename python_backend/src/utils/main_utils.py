from src.exception import MyException
import sys
import os
async def write_file(file_path, content):
    try:
        with open(file_path, "w") as f:
            f.write(content)
    except Exception as e:
        raise MyException(e, sys)

async def read_file(file_path):
    try:
        with open(file_path, "r") as f:
            return f.read()
    except Exception as e:
        raise MyException(e, sys)

async def delete_file(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            import logging
            logging.debug(f"File {file_path} not found, skipping deletion")
    except Exception as e:
        raise MyException(e, sys)


from src.exception import MyException
import logging
import sys
import yaml
import dill
from dataclasses import asdict
import numpy as np
import os

async def read_yaml_file(file_path:str)->dict:
    try:
        with open(file_path,"rb") as f:
            return yaml.safe_load(f)
    except Exception as e:
        raise MyException(e,sys)    



def read_yaml_file_sync(file_path:str)->dict:
    try:
        with open(file_path,"rb") as f:
            return yaml.safe_load(f)
    except Exception as e:
        raise MyException(e,sys) 
    

async def write_yaml_file(file_path:str,content:object,replace:bool=False)->None:
    try:
        if replace:
            if os.path.exists(file_path):
                os.remove(file_path)
        os.makedirs(os.path.dirname(file_path),exist_ok=True)
        if hasattr(content,"__dataclass_fields__"):
            content=asdict(content)
        if hasattr(content,"__dict__"):
            content=content.__dict__    
        with open(file_path,"w") as file:
            yaml.dump(content,file)
    except Exception as e:
        raise MyException(e,sys)                    
    

async def save_object(file_path:str,obj:object)->None:
    logging.info("Entered the save_object method of utils")

    try:
        os.makedirs(os.path.dirname(file_path),exist_ok=True)
        with open(file_path,"wb") as file_obj:
            dill.dump(obj,file_obj)

        logging.info("Exited the save_object method of utils")

    except Exception as e:
        raise MyException(e,sys)         


async def load_numpy_array_data(file_path: str) -> np.array:
    try:
        with open(file_path, 'rb') as file_obj:
            return np.load(file_obj)
    except Exception as e:
        raise MyException(e, sys) from e

async def save_numpy_array_data(file_path: str, array: np.array):
    try:
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)
        with open(file_path, 'wb') as file_obj:
            np.save(file_obj, array)
    except Exception as e:
        raise MyException(e, sys) from e        
    


async def load_object(file_path: str) -> object:
    try:
        with open(file_path, "rb") as file_obj:
            obj = dill.load(file_obj)
        return obj
    except Exception as e:
        raise MyException(e, sys) from e            