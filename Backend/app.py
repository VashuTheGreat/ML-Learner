from flask import Flask, request, jsonify
from datacleaner import Model
from flask_cors import CORS

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

if __name__ == "__main__":
    app.run(debug=True)
