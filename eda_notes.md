## What this file?

All the points regarding dataset will be written here during performing data analysis -

## Pump dataset

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


