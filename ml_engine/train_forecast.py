import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

# 1. Load the generated dataset
data_path = 'datasets/wage_demand_forecast_data.csv'
if not os.path.exists(data_path):
    raise FileNotFoundError(f"❌ Missing dataset! Run generate_showcase_data.py first.")

df = pd.read_csv(data_path)

# 2. Select Features (X) and Targets (y)
# We train two independent targets as requested in your project layouts
X = df[['Historical_Labour_Demanded', 'Historical_Labour_Supplied']]
y_wage = df['Market_Wage_Paid']
y_jobs = df['Total_Jobs_Next_Week']

# 3. Train Model A: Dynamic Wage Calculator
X_train, X_test, y_train_w, y_test_w = train_test_split(X, y_wage, test_size=0.2, random_state=42)
wage_model = LinearRegression()
wage_model.fit(X_train, y_train_w)

# 4. Train Model B: Future Labour Demand Forecaster
X_train_j, X_test_j, y_train_j, y_test_j = train_test_split(X, y_jobs, test_size=0.2, random_state=42)
jobs_model = LinearRegression()
jobs_model.fit(X_train_j, y_train_j)

# 5. Export models into the models folder
os.makedirs('models', exist_ok=True)

with open('models/forecast_wage_model.pkl', 'wb') as f:
    pickle.dump(wage_model, f)

with open('models/forecast_jobs_model.pkl', 'wb') as f:
    pickle.dump(jobs_model, f)

print("✅ Wage and Demand Forecast Models successfully trained and saved inside ml_engine/models/!")
print(f"📈 Wage Model Test Error: Mean Absolute Error = {mean_absolute_error(y_test_w, wage_model.predict(X_test)):.2f} INR")
