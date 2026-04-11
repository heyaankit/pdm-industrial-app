import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

df = pd.read_csv("dataset/Large_Industrial_Pump_Maintenance_Dataset.csv")

temp_high = df["Temperature"].quantile(0.8)
temp_crit = df["Temperature"].quantile(0.9)
vib_high = df["Vibration"].quantile(0.8)
vib_crit = df["Vibration"].quantile(0.9)
pres_high = df["Pressure"].quantile(0.8)
pres_crit = df["Pressure"].quantile(0.9)
flow_low = df["Flow_Rate"].quantile(0.2)
rpm_high = df["RPM"].quantile(0.8)
hrs_high = df["Operational_Hours"].quantile(0.75)
hrs_crit = df["Operational_Hours"].quantile(0.9)

thermal_score = (
    (df["Temperature"] > temp_high).astype(int) * 2
    + (df["Temperature"] > temp_crit).astype(int) * 2
    + (df["RPM"] > rpm_high).astype(int) * 1
)

mechanical_score = (
    (df["Vibration"] > vib_high).astype(int) * 2
    + (df["Vibration"] > vib_crit).astype(int) * 2
    + (df["RPM"] > rpm_high).astype(int) * 1
)

hydraulic_score = (
    (df["Pressure"] > pres_high).astype(int) * 2
    + (df["Flow_Rate"] < flow_low).astype(int) * 3
    + (df["Pressure"] > pres_crit).astype(int) * 1
)

wearout_score = (
    (df["Operational_Hours"] > hrs_high).astype(int) * 2
    + (df["Operational_Hours"] > hrs_crit).astype(int) * 3
    + (df["Vibration"] > vib_high).astype(int) * 1
    + (df["Vibration"] > vib_crit).astype(int) * 1
)

threshold = 3

df["mechanical_flag"] = (mechanical_score >= threshold).astype(int)
df["thermal_flag"] = (thermal_score >= threshold).astype(int)
df["hydraulic_flag"] = (hydraulic_score >= threshold).astype(int)
df["wearout_flag"] = (wearout_score >= threshold).astype(int)


def priority_failure(row):
    if row["mechanical_flag"]:
        return 1
    elif row["thermal_flag"]:
        return 1
    elif row["hydraulic_flag"]:
        return 1
    elif row["wearout_flag"]:
        return 1
    else:
        return 0


df["Failure_Type"] = df.apply(priority_failure, axis=1)

df["Temperature_x_Vibration"] = df["Temperature"] * df["Vibration"]
df["Pressure_x_Flow"] = df["Pressure"] * df["Flow_Rate"]
df["RPM_x_Vibration"] = df["RPM"] * df["Vibration"]
df["Temperature_x_RPM"] = df["Temperature"] * df["RPM"]

df["Pressure_flow_ratio"] = df["Pressure"] / (df["Flow_Rate"] + 1e-6)
df["RPM_per_hour"] = df["RPM"] / (df["Operational_Hours"] + 1e-6)
df["Power_proxy"] = (df["Pressure"] * df["Flow_Rate"]) / 1000

df["Log_vibration"] = np.log1p(df["Vibration"])
df["Log_operational_hrs"] = np.log1p(df["Operational_Hours"])

df["Temperature_sq"] = df["Temperature"] ** 2
df["Vibration_sq"] = df["Vibration"] ** 2

df["Hours_bin"] = pd.cut(
    df["Operational_Hours"], bins=[0, 2500, 5000, 7500, 10001], labels=[1, 2, 3, 4]
).astype(int)
df["Temperature_bin"] = pd.cut(
    df["Temperature"], bins=[0, 75, 100, 125, 151], labels=[1, 2, 3, 4]
).astype(int)

feature_cols = [
    "Temperature",
    "Vibration",
    "Pressure",
    "Flow_Rate",
    "RPM",
    "Operational_Hours",
    "Temperature_x_Vibration",
    "Pressure_x_Flow",
    "RPM_x_Vibration",
    "Temperature_x_RPM",
    "Pressure_flow_ratio",
    "RPM_per_hour",
    "Power_proxy",
    "Log_vibration",
    "Log_operational_hrs",
    "Temperature_sq",
    "Vibration_sq",
    "Hours_bin",
    "Temperature_bin",
]

X = df[feature_cols]
y = df["Failure_Type"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = DecisionTreeClassifier(max_depth=10, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Test Accuracy: {accuracy:.3f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

joblib.dump(model, "ml/pump/model.pkl")
print(f"\nModel saved to ml/pump/model.pkl")
