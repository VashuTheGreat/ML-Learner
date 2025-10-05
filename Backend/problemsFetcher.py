import os
import json

file_path = "./prob/problems.json"

def fetchData():
    result=[]
    if os.path.isfile(file_path) and file_path.endswith(".json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    result.append(data)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

    

    return result


if __name__ == "__main__":
     print(fetchData()[0][180])
  
