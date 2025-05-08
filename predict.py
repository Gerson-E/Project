import sys
import joblib
import pandas as pd

# load the model and scaler
model = joblib.load("stress_model.pkl")
scaler = joblib.load("scaler.pkl")

# read features from command-line args
features = list(map(float, sys.argv[1:]))  # assumes ordered features

# wrap into a DataFrame
cols = ["EDAR_Mean", "EDAR_Min", "EDAR_Max", "EDAR_Std", "EDAR_Kurtosis", "EDAR_Skew", 
        "Num_PeaksR", "EDAR_Amphitude", "EDAR_Duration", "HRR_Mean", "HRR_Min", "HRR_Max", 
        "HRR_Std", "HRR_RMS", "TEMPR_Mean", "TEMPR_Min", "TEMPR_Max", "TEMPR_Std"]

X = pd.DataFrame([features], columns=cols)
X_scaled = scaler.transform(X)

# predict
pred = model.predict(X_scaled)[0]
print(pred)  # outputs 0, 1, or 2