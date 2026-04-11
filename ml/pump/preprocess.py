import numpy as np


def preprocess(features: dict) -> np.ndarray:
    """Convert feature dict to numpy array for model input."""
    # Extract values in the same order as the model expects
    feature_values = [
        features["Temperature"],
        features["Vibration"],
        features["Pressure"],
        features["Flow_Rate"],
        features["RPM"],
        features["Operational_Hours"],
        features["Temperature_x_Vibration"],
        features["Pressure_x_Flow"],
        features["RPM_x_Vibration"],
        features["Temperature_x_RPM"],
        features["Pressure_flow_ratio"],
        features["RPM_per_hour"],
        features["Power_proxy"],
        features["Log_vibration"],
        features["Log_operational_hrs"],
        features["Temperature_sq"],
        features["Vibration_sq"],
        features["Hours_bin"],
        features["Temperature_bin"],
    ]
    return np.array(feature_values).reshape(1, -1)
