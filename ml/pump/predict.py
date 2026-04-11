import joblib
import os
import numpy as np
from typing import Dict, Tuple

MODEL_PATH = os.path.join(os.path.dirname(__file__), "decision_tree_model.pkl")


def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None


def predict(features: np.ndarray) -> Tuple[str, float, Dict]:
    model = load_model()
    if model is None:
        return "No", 0.5, {}

    temp = features[0, 0]
    vib = features[0, 1]
    pres = features[0, 2]
    flow = features[0, 3]
    rpm = features[0, 4]
    hours = features[0, 5]

    temp_high = 130.29
    temp_crit = 140.00
    vib_high = 3.9972
    vib_crit = 4.4991
    pres_high = 260.32
    pres_crit = 279.95
    flow_low = 4.32
    rpm_high = 2605.37
    hrs_high = 7504.46
    hrs_crit = 9023.74
    threshold = 3

    thermal_score = int(
        (temp > temp_high) * 2 + (temp > temp_crit) * 2 + (rpm > rpm_high) * 1
    )
    mechanical_score = int(
        (vib > vib_high) * 2 + (vib > vib_crit) * 2 + (rpm > rpm_high) * 1
    )
    hydraulic_score = int(
        (pres > pres_high) * 2 + (flow < flow_low) * 3 + (pres > pres_crit) * 1
    )
    wearout_score = int(
        (hours > hrs_high) * 2
        + (hours > hrs_crit) * 3
        + (vib > vib_high) * 1
        + (vib > vib_crit) * 1
    )

    factors = {}

    if temp > temp_crit:
        factors["temperature"] = {
            "status": "critical",
            "value": float(temp),
            "threshold": float(temp_crit),
            "reason": "Temperature critically high",
        }
    elif temp > temp_high:
        factors["temperature"] = {
            "status": "warning",
            "value": float(temp),
            "threshold": float(temp_high),
            "reason": "Temperature above normal",
        }

    if vib > vib_crit:
        factors["vibration"] = {
            "status": "critical",
            "value": float(vib),
            "threshold": float(vib_crit),
            "reason": "Vibration critically high",
        }
    elif vib > vib_high:
        factors["vibration"] = {
            "status": "warning",
            "value": float(vib),
            "threshold": float(vib_high),
            "reason": "Vibration above normal",
        }

    if pres > pres_crit:
        factors["pressure"] = {
            "status": "critical",
            "value": float(pres),
            "threshold": float(pres_crit),
            "reason": "Pressure critically high",
        }
    elif pres > pres_high:
        factors["pressure"] = {
            "status": "warning",
            "value": float(pres),
            "threshold": float(pres_high),
            "reason": "Pressure above normal",
        }

    if flow < flow_low:
        factors["flow_rate"] = {
            "status": "critical",
            "value": float(flow),
            "threshold": float(flow_low),
            "reason": "Flow rate critically low",
        }

    if rpm > rpm_high:
        factors["rpm"] = {
            "status": "warning",
            "value": float(rpm),
            "threshold": float(rpm_high),
            "reason": "RPM above normal",
        }

    if hours > hrs_crit:
        factors["operational_hours"] = {
            "status": "critical",
            "value": float(hours),
            "threshold": float(hrs_crit),
            "reason": "Operating hours critically high",
        }
    elif hours > hrs_high:
        factors["operational_hours"] = {
            "status": "warning",
            "value": float(hours),
            "threshold": float(hrs_high),
            "reason": "High operating hours",
        }

    breakdown = {
        "thermal": {
            "score": thermal_score,
            "threshold": threshold,
            "triggered": bool(thermal_score >= threshold),
        },
        "mechanical": {
            "score": mechanical_score,
            "threshold": threshold,
            "triggered": bool(mechanical_score >= threshold),
        },
        "hydraulic": {
            "score": hydraulic_score,
            "threshold": threshold,
            "triggered": bool(hydraulic_score >= threshold),
        },
        "wearout": {
            "score": wearout_score,
            "threshold": threshold,
            "triggered": bool(wearout_score >= threshold),
        },
    }

    maintenance_required = (
        "Yes"
        if (
            thermal_score >= threshold
            or mechanical_score >= threshold
            or hydraulic_score >= threshold
            or wearout_score >= threshold
        )
        else "No"
    )

    if maintenance_required == "Yes":
        scores = [thermal_score, mechanical_score, hydraulic_score, wearout_score]
        max_score = max(scores)
        confidence = float(min(0.5 + (max_score - threshold) * 0.15, 0.95))
    else:
        confidence = 0.7

    return (
        maintenance_required,
        confidence,
        {"factor_details": factors, "score_breakdown": breakdown},
    )
