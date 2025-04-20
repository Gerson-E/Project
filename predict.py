# use: python predict.py <pulse> <spo2> <temp>
# outputs: "stressed" or "not stressed"

import sys
import joblib
import numpy as np

# load the model created in training model.py
model = joblib.load("stress_model.pkl")

# read the pulse, eda, temp from command-line args 
# (should recieve numbers: 85 0.3 36.5, then make a prediction)
pulse = float(sys.argv[1])
eda = float(sys.argv[2])
temp = float(sys.argv[3])

# the format for the prediction
X = np.array([[pulse, eda, temp]])
pred = model.predict(X)[0]

# outputs the classification
print("stressed" if pred == 1 else "not stressed")