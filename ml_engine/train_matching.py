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
