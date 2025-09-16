from datacleaner import Model
m = Model("titanic")   # dataset from seaborn
m.loadData()
df, _ = m.dataCleaner(m.data)
params = {
    "n_estimators": 200,
    "max_depth": 5,
    "random_state": 42
}
m.data = df
output=m.TrainModel("RandomForestClassifier", "survived",params=params)
# print(output)

# Regression Example
# m = Model("mpg")
# m.loadData()
# df, _ = m.dataCleaner(m.data)
# m.data = df
# output=m.TrainModel("LinearRegression", "mpg")
# print(output)



import base64
import os


os.makedirs("upload", exist_ok=True)

for img_base64,i in zip(output['plots'],range(len(output['plots']))):
    with open(f"upload/output{i}.png", "wb") as f:
        f.write(base64.b64decode(img_base64))

print("✅ Image saved in upload/output.png")
