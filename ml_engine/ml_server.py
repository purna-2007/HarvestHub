
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import MultiLabelBinarizer


app = Flask(__name__)


# ============================================================
# CUSTOM ENCODER
# Required to load the saved worker matching model
# ============================================================

class MultiLabelSkillsEncoder(BaseEstimator, TransformerMixin):

    def __init__(self):
        self.encoder = MultiLabelBinarizer()

    def fit(self, X, y=None):

        skills = pd.Series(
            np.asarray(X).ravel()
        ).fillna("")

        skill_lists = skills.apply(
            lambda x: [
                skill.strip()
                for skill in str(x).split(",")
                if skill.strip()
            ]
        )

        self.encoder.fit(skill_lists)

        return self

    def transform(self, X):

        skills = pd.Series(
            np.asarray(X).ravel()
        ).fillna("")

        skill_lists = skills.apply(
            lambda x: [
                skill.strip()
                for skill in str(x).split(",")
                if skill.strip()
            ]
        )

        return self.encoder.transform(skill_lists)

    def get_feature_names_out(self, input_features=None):

        return np.array([
            f"Worker_Skill_{skill}"
            for skill in self.encoder.classes_
        ])


# ============================================================
# LOAD TRAINED MODELS
# ============================================================

wage_model = joblib.load(
    "models/market_wage_model.pkl"
)

jobs_model = joblib.load(
    "models/labour_demand_model.pkl"
)

matching_model = joblib.load(
    "models/gradient_boosting_classifier.pkl"
)

print("✓ Market Wage model loaded")
print("✓ Labour Demand model loaded")
print("✓ Worker Matching model loaded")


# ============================================================
# ROUTE 1 — MARKET WAGE
# ============================================================

@app.route('/predict_wage', methods=['POST'])
def predict_wage():

    data = request.get_json()

    sample_input = pd.DataFrame({
        'Date': [
            pd.Timestamp(data['date']).toordinal()
        ],

        'Mandi_Season': [
            data['mandi_season']
        ],

        'Region_ID / District': [
            data['district']
        ],

        'Crop_Type': [
            data['crop_type']
        ],

        'Weather_Condition': [
            data['weather_condition']
        ],

        'Historical_Labour_Demanded': [
            data['historical_labour_demanded']
        ],

        'Historical_Labour_Supplied': [
            data['historical_labour_supplied']
        ]
    })

    predicted_wage = wage_model.predict(
        sample_input
    )[0]

    return jsonify({
        'predicted_market_wage': round(
            float(predicted_wage),
            2
        )
    })


# ============================================================
# ROUTE 2 — LABOUR DEMAND
# ============================================================

@app.route('/predict_jobs', methods=['POST'])
def predict_jobs():

    data = request.get_json()

    sample_input = pd.DataFrame({
        'Date': [
            pd.Timestamp(data['date']).toordinal()
        ],

        'Mandi_Season': [
            data['mandi_season']
        ],

        'Region_ID / District': [
            data['district']
        ],

        'Crop_Type': [
            data['crop_type']
        ],

        'Weather_Condition': [
            data['weather_condition']
        ],

        'Historical_Labour_Demanded': [
            data['historical_labour_demanded']
        ],

        'Historical_Labour_Supplied': [
            data['historical_labour_supplied']
        ]
    })

    predicted_jobs = jobs_model.predict(
        sample_input
    )[0]

    return jsonify({
        'predicted_jobs_next_week': round(
            float(predicted_jobs)
        )
    })


# ============================================================
# ROUTE 3 — WORKER MATCHING
# ============================================================

@app.route('/predict_match', methods=['POST'])
def predict_match():

    data = request.get_json()

    sample_input = pd.DataFrame({
        'Worker_Experience_Years': [
            data['worker_experience_years']
        ],

        'Distance_KM': [
            data['distance_km']
        ],

        'Worker_Historical_Rating': [
            data['worker_historical_rating']
        ],

        'Farmer_Historical_Rating': [
            data['farmer_historical_rating']
        ],

        'Historical_Acceptance_Rate': [
            data['historical_acceptance_rate']
        ],

        'Job_Required_Skill': [
            data['job_required_skill']
        ],

        'Worker_Primary_Skills': [
            data['worker_primary_skills']
        ]
    })

    prediction = matching_model.predict(
        sample_input
    )[0]

    probability = matching_model.predict_proba(
        sample_input
    )[0]

    return jsonify({
        'prediction': int(prediction),
        'match_status': (
            'Successful Match'
            if prediction == 1
            else 'Unsuccessful Match'
        ),
        'match_probability': round(
            float(probability[1]) * 100,
            2
        ),
        'unsuccessful_probability': round(
            float(probability[0]) * 100,
            2
        )
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route('/health', methods=['GET'])
def health():

    return jsonify({
        'status': 'ML server is running',
        'models': [
            'market_wage_model',
            'labour_demand_model',
            'gradient_boosting_classifier'
        ]
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == '__main__':

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

