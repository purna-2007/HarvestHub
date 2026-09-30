<<<<<<< HEAD
import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 1. Load the matching dataset
data_path = 'datasets/worker_geospatial_matching_data.csv'
if not os.path.exists(data_path):
    raise FileNotFoundError(f"❌ Missing dataset! Run generate_showcase_data.py first.")

df = pd.read_csv(data_path)

# 2. Extract numerical features for the model logic
X = df[['Worker_Experience_Years', 'Distance_KM', 'Worker_Historical_Rating', 'Farmer_Historical_Rating', 'Historical_Acceptance_Rate']]
y = df['Is_Successful_Match']

# 3. Split data into training and test buckets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Initialize and fit the Random Forest Classifier
matching_model = RandomForestClassifier(n_estimators=100, random_state=42)
matching_model.fit(X_train, y_train)

# 5. Export trained binary model asset
os.makedirs('models', exist_ok=True)
with open('models/matching_model.pkl', 'wb') as f:
    pickle.dump(matching_model, f)

print("✅ Geospatial Worker Matching Model successfully trained and saved inside ml_engine/models/!")
print(f"🎯 Matching Accuracy Score: {accuracy_score(y_test, matching_model.predict(X_test)) * 100:.2f}%")
=======

import os
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# 1. LOAD MATCHING DATASET
# ============================================================

print("Loading Worker-Farmer Matching dataset...")

df = pd.read_csv(
    "datasets/worker_geospatial_matching_data.csv"
)

print(f"Dataset Shape: {df.shape}")


# ============================================================
# 2. SELECT FEATURES AND TARGET
# ============================================================

X = df[
    [
        'Worker_Experience_Years',
        'Distance_KM',
        'Worker_Historical_Rating',
        'Farmer_Historical_Rating'
    ]
]

y = df['Is_Successful_Match']


# ============================================================
# 3. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ============================================================
# 4. CREATE GRADIENT BOOSTING CLASSIFIER
# ============================================================

gradient_boosting_classifier = GradientBoostingClassifier(
    random_state=42
)


# ============================================================
# 5. TRAIN MODEL
# ============================================================

print("\nTraining Gradient Boosting Classifier...")

gradient_boosting_classifier.fit(
    X_train,
    y_train
)

print("✓ Model training completed")


# ============================================================
# 6. EVALUATE MODEL
# ============================================================

y_pred = gradient_boosting_classifier.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n======================================")
print("       MODEL PERFORMANCE")
print("======================================")

print(f"\nAccuracy: {accuracy:.4f}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred
    )
)

print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ============================================================
# 7. CREATE MODELS DIRECTORY
# ============================================================

os.makedirs(
    "models",
    exist_ok=True
)


# ============================================================
# 8. SAVE MODEL
# ============================================================

model_path = (
    "models/gradient_boosting_classifier.pkl"
)

joblib.dump(
    gradient_boosting_classifier,
    model_path
)

print("\n======================================")
print("       MODEL SAVED SUCCESSFULLY")
print("======================================")

print(
    f"Model Path: {model_path}"
)

print("\n⚠️ This script is for future reproduction.")
print("Do NOT run it now if your existing model is already trained.")

>>>>>>> a9d6c306323eabb686988c9188f0d307025652a9
