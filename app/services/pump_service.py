# Necessary imports
from app.schemas.pump import PredictionLogCreate
import math 


def build_features(sensor: PredictionLogCreate) -> dict:

    # Base Features
    Temperature = sensor.temperature
    Vibration = sensor.vibration
    Pressure = sensor.pressure
    Flow_rate = sensor.flow_rate
    RPM = sensor.rpm 
    Operational_hours = sensor.operational_hours

    # Interaction Features
    Temperature_x_Vibration = sensor.temperature * sensor.vibration
    Pressure_x_Flow = sensor.pressure * sensor.flow_rate
    RPM_x_Vibration = sensor.rpm * sensor.vibration
    Temperature_x_RPM = sensor.temperature * sensor.rpm

    # Ratio Features
    Pressure_flow_ratio = sensor.pressure / (sensor.flow_rate + 1e-6),        
    RPM_per_hour = sensor.rpm / (sensor.operational_hours + 1e-6),
    Power_proxy = (sensor.pressure * sensor.flow_rate) / 1000,
    
    # Log transform Features
    Log_vibration = math.log1p(Vibration)
    Log_operational_hrs = math.log1p(Operational_hours)

    # Polynomial Features
    Temperature_sq = sensor.temperature**2
    Vibration_sq = sensor.vibration**2

    # Bin Features
    Operation_hrs_bins = [(0, 2500, 1), (2500, 5000, 2), (5000, 7500, 3), (7500, 10001, 4)]
    for low, high, label in Operation_hrs_bins:
        if low < Operational_hours <= high:
            hours_bin = label
            break

    Temperature_bins = [(0, 75, 1), (75, 100, 2), (100, 125, 3), (125, 151, 4)]
    for low, high, labels in Temperature_bins:
        if low < Temperature <= high:
            temp_bin = label
            break

    return {
        
    }