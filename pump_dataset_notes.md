## Why this file?

All the points regarding dataset will be written here during performing data analysis and planning -

### Given (from dataset description)

1. This dataset contains maintenance records and sensor reading from 20,000 insustrial pumps.
2. It is a classification dataset, the target variable is a Manintenance_Flag column.
3. Feature columns contains sensors (temp, vibration, etc) data and operational parameters (RPM, flow rate, etc).


### Data analysis 

1. Data datatypes is correct.
2. No null values are present.
3. Actual industry pumps are only 5, there are multiple instances of those pump which gathering upto 20,000 records.
4. There are no sentinel values present.
5. Skewness is balanced, no transformation needed there.
6. The dataset is clean, only needs scaling.
7. Every feature correlation with target variable is close to zero. Essentially no linear relationship.
8. The dataset has non-linear relationship but even after applying decision tree, the accuracy is around 50%. Needs feature engineering.


### Planning while learning more about domain

1. Failure can occur in assets by these situations. Needs Domain Knowledge.
    - No failure
    - Hydraulic failure
    - Thermal failure
    - Mechanical failure
    - Wear-out failure

2. The dataset has binary mainenance flag, but we want to know specific failure type. We want to know what kind of failure will it have. This is more useful for planning maintenance. Needs Domain Knowledge.
    - create thresholds for warning and critical situation for every column

3. Create a scoring system for each type of failure, where each feature contributes to scores for failure type with a threshold as a minimum score needed to classify as that failure type.

4. Assign the priority-wise failure type in a new feature 'Failure type'

5. Hmm, I have to create few new features because of - 
    - high temp and high vibration are worse than either alone. A pump running hot while also vibrating intensely tends to have more chances to break. New features should include these interaction effects.
    - also have to make features that is polynomially operated. Why because, the temperature 140 is not twice as bad as 70, it could be four times more bad because heat damage accelerates. So use temperature squaring to address this acceleration.
    - binning will also be used for features like operational hours, it conveys the age of the pump, because older pump will have more chances of failures. Same applies to temperature.

6. There will be many different types of pump, so while removing outliers or making a scoring system, i should use percentiles instead of hardcoding because for eg:- temperature of 170 celcius might exceptable for one type of pump but maybe dangerous for other.

7. 