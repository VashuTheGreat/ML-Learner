from flask import Flask, request, jsonify
from datacleaner import Model
from flask_cors import CORS
from interviewChat import *
import base64
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
    "anagrams": "score"             # regression/classification (depending on usage)
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





def interview_flow(userInput, voice):
    if voice.lower() == "boy":
        voice = "Fritz-PlayAI"  # allowed male voice
    else:
        voice = "Aaliyah-PlayAI"  # allowed female voice

    state = History()
    userInput = userInput.strip()
    if not userInput:
        return {"airesponse": "", "audio_data": ""}

    try:
        state_updated = response(state, llm, userInput)
        last_ai_response = state_updated.hist[-1]["AI"]
        audio_data = speak(last_ai_response, voice=voice)
        if audio_data:
            import base64
            audio_b64 = base64.b64encode(audio_data).decode("utf-8")
            return {"airesponse": last_ai_response, "audio_data": audio_b64}
        return {"airesponse": last_ai_response, "audio_data": ""}
    except Exception as e:
        print(f"❌ Error in interview_flow loop: {e}")
        return {"airesponse": "", "audio_data": ""}

@app.route('/airesponse', methods=['POST'])
def airesponse():
    data = request.get_json()
    print(data)
    airesponse = interview_flow(voice=data.get('voice'), userInput=data.get('userResponse'))

    if not airesponse:
        return jsonify({"error": "No response generated"}), 500

    return jsonify({
        "airesponse": airesponse.get('airesponse', ''),
        "audio_data": airesponse.get("audio_data", "")
    })

if __name__ == "__main__":
    app.run(debug=True)
