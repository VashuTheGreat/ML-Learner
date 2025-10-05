import requests
import json
import os

# Folder jahan save karna hai
dir_name = "prob"
if not os.path.exists(dir_name):
    os.makedirs(dir_name)

problems_list = []

for i in range(187):
    url = f"https://api.deep-ml.com/fetch-problem?problem_id={i}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            problems_list.append(response.json())
            print(f"✅ Problem {i} fetched successfully")
        else:
            print(f"❌ Problem {i} failed: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error fetching problem {i}: {e}")

# Save as JSON
with open(os.path.join(dir_name, "problems.json"), "w", encoding="utf-8") as f:
    json.dump(problems_list, f, ensure_ascii=False, indent=4)

print(f"💾 Saved {len(problems_list)} problems to {dir_name}/problems.json")
