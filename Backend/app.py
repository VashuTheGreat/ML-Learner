from flask import Flask, request, jsonify
from datacleaner import Model
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

datasetTargets = {
  "iris": "species",
  "titanic": "survived",
  "mpg": "mpg",
  "penguins": "species",
  "diamonds": "price",
  "car_crashes": "total"
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
