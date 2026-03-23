This is a personal log for myself for future reference of what did i learnt in this project and use those learnings in future project. (Ignore it)

1. Learnt how to make project repository structure for development.
2. Learnt dunder file init.py importance to import a package from another directory.
3. learnt that .gitkeep files are used to preserve the folder structure, that's why some of my folde didn't showed earlier.
4. learnt that using this -> ! allows me to track the files inside gitignore file.
5. Learnt that while making a ipynb file, i shouldn't hard code it, first i make the notebook and then connect the github to it.
6. Learnt that I should take feature engineering more seriously, the dataset was clean but the model prediction accuracy never gone up from 50% even though using multiple classifiers (Logistic Regression, Decision tree, Random Forest). Now I'm learning feature enginnering and labeling.
7. learnt that if for some reason i've to divide a number by zero but don't want to face any errors, i can add **1e-6** to that denominator. For example, if my flow rate becomes zero in a pump but my operation involves pressure / flowrate, adding very small value of **1e-6** will save me. Good thing, i'll remember that.
8. Okay, learnt Stratification, where **stratify=y** in train_test_split() ensures that training and testing set have the same proportion of target value.
9. Learnt that i can also perform operation row-wise by using **.apply()** function. I don't have to make transform function especially for specific column.
10. Partially learnt how to make new features, fried my brain.
11. Okay with **@routers** I can make a cluster of APIs that serve one specific endpoint, and simplify our codebase further. This is something I will be using from upcoming project, need to learn it.
12. Learnt that all the preprocessing steps applied in the notebook should be applied in here too, but obvious. Learnt how to do it. Still needed to learn how to use something called **joblib.dump** for applying the same preprocessing steps to raw input data.
