
# Datasets
This project uses two primary datasets for the core FastAPI predictive maintenance (PdM) application:

1. **MetroPT-3 Dataset – Compressor Time-Series (UCI)**
2. **Large Industrial Pump Maintenance Dataset – Pump Fleet Health (Kaggle)**

If you fork this repository and want to extend the app to additional assets (rotating machines, conveyors, etc.), three more datasets are already bundled as **ready‑to‑use extras**.

## Download Datasets - 

1. [Vibration Faults Dataset for Rotating Machines (Kaggle)](https://www.kaggle.com/datasets/sumairaziz/vibration-faults-dataset-for-rotating-machines)
2. [Dataset of Rotating Machine Under Varying Load Conditions for Fault Diagnosis (Mendeley)](https://data.mendeley.com/datasets/ztmf3m7h5x/6)
3. [MetroPT-3 Dataset (UC Irvine)](https://archive.ics.uci.edu/dataset/791/metropt+3+dataset)
4. [Operational Conveyer Fault Dataset (Kaggle)](https://www.kaggle.com/datasets/ziya07/operational-conveyor-fault-dataset)
5. [Large Industrial Pump Maintenance Dataset (Kaggle)](https://www.kaggle.com/datasets/selonamaris/large-industrial-pump-maintenance-dataset?resource=download)


## Datasets Overview

1. Vibration Faults Dataset for Rotating Machines (Kaggle)

    - Source: Kaggle – Vibration Faults Dataset for Rotating Machines  
    - License: CC BY-NC-SA 4.0  
    - Domain: Large industrial induction motors coupled with centrifugal water pumps.  
    - Data type: Vibration signals (time-series) from a tri-axis wireless accelerometer, 1000 Hz, X/Y/Z axes combined into a composite signal.  
    - Size:  
        - 220 MATLAB .mat files (≈ 19.5 MB)  
        - 103 “normal” signals + 117 “faulty” signals, each 5 seconds long (≈ 18.25 minutes total).
    - Labels / classes:  
        - Normal  
        - Faulty (includes bearing and alignment faults).
    - Typical tasks:  
        - Time-series / vibration-based fault detection  
        - Feature engineering from vibration signals  
        - Supervised fault classification (healthy vs faulty)
    - Notes:  
        - Well-documented with a linked Sensors paper.  
        - Good for demonstrating signal processing and rotating-machine diagnostics.

---

2. Dataset of Rotating Machine Under Varying Load Conditions for Fault Diagnosis (Mendeley)

    - Source: Mendeley Data – Vibration, Acoustic, Temperature, and Motor Current Dataset of Rotating - - - Machine Under Varying Load Conditions for Fault Diagnosis  
    - License: CC BY 4.0  
    - Domain: Rotating machine test rig with controlled faults.  
    - Data type: Multivariate time-series from multiple sensors:  
        - Vibration (4 channels, housing A & B, x/y directions)  
        - Acoustic (sound pressure)  
        - Temperature (two housings)  
        - Motor current (three-phase)
    - Size:  
        - Total download ≈ 3.96 GB (separate zip files for vibration, acoustic, current+temp).
    - Conditions / labels:  
        - Normal  
        - Bearing inner race fault  
        - Bearing outer race fault  
        - Shaft misalignment  
        - Rotor unbalance  
        - Each under three load conditions (0 Nm, 2 Nm, 4 Nm).
    - Typical tasks:  
        - Multi-sensor fault diagnosis  
        - Domain adaptation under varying load  
        - Sensor fusion (vibration + acoustic + current + temperature)
    - Notes:  
        - Excellent for research-grade fault diagnosis and comparing different sensor modalities.  
        - Requires handling large .mat / .tdms files.

---

3. MetroPT-3 Dataset (UC Irvine / MetroPT)

    - Source: UCI Machine Learning Repository – MetroPT-3 Dataset; see also the MetroPT Scientific Data paper  
    - License: CC BY 4.0  
    - Domain: Air Production Unit (compressor) on a metro train in Porto, Portugal.  
    - Data type: Multivariate time-series from on-vehicle sensors:  
        - Pressures (TP2, TP3, H1, DV_pressure, Reservoirs)  
        - Motor current  
        - Oil temperature  
        - Electrical signals of air intake valves (COMP, etc.)
    - Size:  
        - ≈ 1.5M data points, 15 features, logged at 1 Hz between February–August 2020.
    - Labels / failure info:  
        - Sensor data is unlabeled, but failure reports (timestamps, severity, type – e.g., air leaks) are provided.
    - Typical tasks:  
        - Predictive maintenance  
        - Online anomaly detection  
        - Remaining useful life (RUL) prediction for compressors
    - Notes:  
        - Real-world railway APU dataset with known failure windows.  
        - Great for demonstrating time-series anomaly detection and RUL-style modeling.

---

4. Operational Conveyor Fault Dataset (Kaggle)

    - Source: Kaggle – Operational Conveyor Fault Dataset  
    - License: CC0: Public Domain  
    - Domain: Industrial conveyor system.  
    - Data type: Tabular snapshot records:  
        - Speed (rpm)  
        - Load (kg)  
        - Temperature (°C)  
        - Vibration (m/s²)  
        - Current (A)
    - Size:  
        1 CSV file, 42.35 kB, 1209 records.
    - Labels / classes:  
        - Six fault types:  
            - Ball Bearing Fault  
            - Central Shaft Fault  
            - Pulley Fault  
            - Drive Motor Fault  
            - Idler Roller Fault  
            - Belt Slippage
    - Typical tasks:  
        - Multiclass fault classification  
        - Anomaly detection  
        - Predictive maintenance for conveyors
    - Notes:  
        - Small, clean, and easy to load.  
        - Good for quick classification demos and teaching.

---

5. Large Industrial Pump Maintenance Dataset (Kaggle)

    - Source: Kaggle – Large Industrial Pump Maintenance Dataset  
    - License: MIT  
    - Domain: Fleet of industrial pumps.  
    - Data type: Tabular per-pump snapshot:  
        - Pump_ID  
        - Temperature  
        - Vibration  
        - Pressure  
        - Flow_Rate  
        - RPM  
        - Operational_Hours  
        - Maintenance_Flag (0/1)
    - Size:  
        - 20,000 rows, 8 columns, CSV (≈ 2.3 MB).
    - Labels / target:  
        - Maintenance_Flag: 1 = pump required maintenance, 0 = no maintenance required.
    - Typical tasks:  
        - Binary classification (needs maintenance / healthy)  
        - Predictive maintenance modeling  
        - Basic fleet health ranking and risk scoring
    - Notes:  
        - Simple tabular structure, ideal for supervised classification and baseline PdM models.


