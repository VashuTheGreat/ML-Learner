import os
import json

path = "./problems"
folders = ['difficult', 'easy', 'medium']

def fetchData():
    result = {
        "easy": [],
        "medium": [],
        "difficult": []
    }

    for fol in folders:
        folder_path = os.path.join(path, fol)
        if not os.path.exists(folder_path):
            continue

        for qfol in os.listdir(folder_path):
            subpath = os.path.join(folder_path, qfol)
            if os.path.isdir(subpath):
                json_path = os.path.join(subpath, "README.json")

                if os.path.exists(json_path):
                    try:
                        with open(json_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        result[fol].append({
                            "folder": qfol,
                            "data": data
                        })
                    except Exception as e:
                        print(f"⚠️ Error reading {json_path}: {e}")
                else:
                    print(f"❌ JSON not found in {subpath}")

    return result


if __name__ == "__main__":
    json_data = fetchData()
    print("Aluu",json_data["difficult"])
    # print(json.dumps(json_data, indent=2, ensure_ascii=False))
