import json
import requests
from tqdm import tqdm

def insert_problems():
    url = "http://localhost:3000/api/question/add_questions"
    file_path = "./problems.json"
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from {file_path}.")
        return

    print(f"Starting data insertion to {url}...")
    
    success_count = 0
    error_count = 0

    for element in tqdm(data, desc="Inserting problems"):
        try:
            response = requests.post(url, json=element)
            response.raise_for_status()
            success_count += 1
        except requests.exceptions.RequestException as e:
            print(f"\nError inserting element {element.get('id', 'unknown')}: {e}")
            error_count += 1
            continue
    
    print(f"\nData insertion completed.")
    print(f"Successfully inserted: {success_count}")
    print(f"Errors encountered: {error_count}")

if __name__ == "__main__":
    insert_problems()
