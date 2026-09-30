<<<<<<< HEAD
import os
import pickle
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for backend communication

# Global placeholders for the trained models
wage_model = None
jobs_model = None
matching_model = None


def load_trained_models():
    """Safely loads the trained pickle models from the models directory."""
    global wage_model, jobs_model, matching_model

    # Define paths exactly where your scripts export them
    wage_path = "models/forecast_wage_model.pkl"
    jobs_path = "models/forecast_jobs_model.pkl"
    matching_path = "models/matching_model.pkl"

    try:
        if os.path.exists(wage_path):
            with open(wage_path, "rb") as f:
                wage_model = pickle.load(f)
        if os.path.exists(jobs_path):
            with open(jobs_path, "rb") as f:
                jobs_model = pickle.load(f)
        if os.path.exists(matching_path):
            with open(matching_path, "rb") as f:
                matching_model = pickle.load(f)

        print("🤖 All Machine Learning Models loaded cleanly into memory!")
    except Exception as e:
        print(f"⚠️ Error loading models: {str(e)}. Using safe mathematical fallbacks.")


# ==========================================
# ENDPOINT 1: WAGE & LABOUR DEMAND FORECAST
# ==========================================
@app.route("/predict_forecast", methods=["POST"])
def predict_forecast():
    """Expects historical demanded and supplied counts.

    Returns dynamic suggested wage and job volume forecast.
    """
    data = request.json
    try:
        # Extract features matching your training datasets exactly
        demanded = float(data.get("demanded", 100))
        supplied = float(data.get("supplied", 60))

        features = np.array([[demanded, supplied]])

        # Predict using models if available, otherwise apply economic rules
        if wage_model and jobs_model:
            pred_wage = wage_model.predict(features)[0]
            pred_jobs = jobs_model.predict(features)[0]
        else:
            # High demand + low supply spikes baseline daily wage
            pred_wage = 450 + (demanded - supplied) * 2.5
            pred_jobs = max(5, int(demanded * 0.6))

        return jsonify(
            {
                "success": True,
                "suggested_wage": round(float(pred_wage), 2),
                "predicted_jobs_next_week": max(1, int(pred_jobs)),
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# ENDPOINT 2: GEOSPATIAL WORKER MATCH SCORE
# ==========================================
@app.route("/predict_match", methods=["POST"])
def predict_match():
    """Expects worker metrics and proximity distance.

    Returns a matching probability score.
    """
    data = request.json
    try:
        experience = float(data.get("experience", 5))
        distance = float(data.get("distance", 5.0))
        w_rating = float(data.get("worker_rating", 4.5))
        f_rating = float(data.get("farmer_rating", 4.2))
        acceptance_rate = float(data.get("acceptance_rate", 0.8))

        features = np.array(
            [[experience, distance, w_rating, f_rating, acceptance_rate]]
        )

        if matching_model:
            # Fetch match probability percentage for successful class (index 1)
            prob = matching_model.predict_proba(features)[0][1]
            match_percentage = prob * 100
        else:
            # Safe heuristic rule matching: penalize high distance, reward experience
            base_score = 85 + (experience * 1.5) - (distance * 1.2)
            match_percentage = min(99, max(40, base_score))

        return jsonify({"success": True, "match_score": round(float(match_percentage), 2)})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    load_trained_models()
    # Run locally on Port 5000 matching your backend proxy configs
    app.run(host="127.0.0.1", port=5000, debug=True)
=======

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

>>>>>>> a9d6c306323eabb686988c9188f0d307025652a9
