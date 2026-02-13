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
        os.remove(file_path)
    except Exception as e:
        raise MyException(e, sys)