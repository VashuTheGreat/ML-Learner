from datacleaner import Model

m = Model("titanic")
m.loadData()
cleaned, encoders = m.dataCleaner(m.data)
m.data = cleaned  # replace with cleaned data

results = m.TrainModel("RandomForestClassifier", "survived")
print(results)
