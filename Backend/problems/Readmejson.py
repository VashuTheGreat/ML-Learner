import json
import os
import re

def markdown_to_json(md_filename, json_filename):
    """
    Converts a Markdown problem statement file into structured JSON
    suitable for a LeetCode-style platform.

    Output JSON format:
    {
        "title": "Batch Iterator for Dataset (Easy) ✔",
        "sections": [
            {
                "title": "Problem Statement",
                "content": "...",
                "code_blocks": [],
                "links": []
            },
            ...
        ]
    }
    """
    try:
        # Get absolute path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        md_path = os.path.join(current_dir, md_filename)
        json_path = os.path.join(current_dir, json_filename)

        if not os.path.exists(md_path):
            print(f"❌ Error: File not found at {md_path}")
            return

        with open(md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        json_data = {
            "title": "",
            "sections": []
        }

        current_section = None
        code_block = None
        in_code_block = False

        for line in lines:
            stripped = line.strip()

            # Title of document (first H1 heading)
            if stripped.startswith("# ") and not json_data["title"]:
                json_data["title"] = stripped[2:].strip()
                continue

            # Section header (H2 or H3)
            if stripped.startswith("## "):
                if current_section:
                    json_data["sections"].append(current_section)
                current_section = {
                    "title": stripped[3:].strip(),
                    "content": "",
                    "code_blocks": [],
                    "links": []
                }
                continue

            if stripped.startswith("### "):
                if current_section:
                    json_data["sections"].append(current_section)
                current_section = {
                    "title": stripped[4:].strip(),
                    "content": "",
                    "code_blocks": [],
                    "links": []
                }
                continue

            # Detect code blocks
            if stripped.startswith("```"):
                if in_code_block:
                    in_code_block = False
                    if code_block and current_section:
                        current_section["code_blocks"].append(code_block)
                    code_block = None
                else:
                    in_code_block = True
                    language = stripped[3:].strip()
                    code_block = {"language": language, "code": ""}
                continue

            if in_code_block:
                if code_block is not None:
                    code_block["code"] += line
                continue

            # Detect markdown links
            links = re.findall(r"\[([^\]]+)\]\(([^\)]+)\)", line)
            if links and current_section:
                for text, url in links:
                    current_section["links"].append({"text": text, "url": url})

            # Add to section content
            if current_section:
                current_section["content"] += line

        # Append last section
        if current_section:
            json_data["sections"].append(current_section)

        # Save JSON
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=4, ensure_ascii=False)

        print(f"✅ Markdown converted to JSON → {json_path}")

    except Exception as e:
        print(f"⚠️ An error occurred: {e}")


# Example usage
if __name__=="__main__":
    markdown_to_json("README.md", "README.json")
