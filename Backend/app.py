from flask import Flask, request, jsonify
from datacleaner import Model
from flask_cors import CORS
from interviewChat import interview_flow
from problemsFetcher import fetchData
import base64
import subprocess

app = Flask(__name__)
CORS(app)

datasetTargets = {
    "iris": "species",              # classification
    "titanic": "survived",          # classification
    "mpg": "mpg",                   # regression
    "penguins": "species",          # classification
    "diamonds": "price",            # regression
    "car_crashes": "total",         # regression
    "tips": "tip",                  # regression
    "taxis": "fare_amount",         # regression
    "flights": "arr_delay",         # regression (arrival delay)
    "exercise": "id",               # classification (type of exercise, could also use "kind")
    "geyser": "waiting",            # regression (eruption waiting time)
    "fmri": "signal",               # regression
    "healthexp": "Life_Expectancy", # regression
    "seaice": "extent",             # regression
    "planets": "orbital_period",    # regression
    "attention": "score",           # regression
    "anscombe": "y",                # regression
    "dots": "coherence",            # regression
    "brain_networks": "network",    # classification
    "glue": "label",                # classification (text classification)
    "dowjones": "price",            # regression
    "anagrams": "num3",           # regression/classification (depending on usage)
}


@app.route('/model', methods=['POST'])
def model():
    data = request.get_json() 
    m = Model(data['data_name'])
    m.loadData()
    df, _ = m.dataCleaner(m.data)
 
    m.data = df
    output=m.TrainModel(data['model_name'], datasetTargets[data["data_name"]],params=data['params']) 
    return jsonify({
        "result":output
    })






@app.route('/airesponse', methods=['POST'])
def airesponse():
    data = request.get_json()
    print("📩 Received:", data)

    airesponse = interview_flow(
        user_id=data.get("user_id", "default_user"),  # unique user id from frontend
        voice=data.get("voice"),
        userInput=data.get("userResponse")
    )

    return jsonify(airesponse)



@app.route('/problems', methods=['GET'])
def problems():
    print("📩 GET request received at /problems")
    data = fetchData()  
    return jsonify(data)  



@app.route("/run", methods=["POST"])
def run_code():
    data = request.get_json()

    if "code" not in data:
        return jsonify({"error": "No code provided"}), 400

    try:
        # Decode Base64 encoded code
        encoded_code = data["code"]
        user_code = base64.b64decode(encoded_code).decode()

        # Run code inside docker container
        result = subprocess.run(
            ["docker", "run", "--rm", "-i", "python-runner"],
            input=user_code.encode(),
            capture_output=True,
            timeout=10  # timeout increase to handle larger code
        )

        stdout = result.stdout.decode()
        stderr = result.stderr.decode()

        return jsonify({"output": stdout, "error": stderr})

    except base64.binascii.Error:
        return jsonify({"error": "Invalid Base64 encoded code"}), 400
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Execution timed out"}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
if __name__ == "__main__":
    app.run(debug=True)
