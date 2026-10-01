

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os
import json
import tensorflow as tf

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
# LOAD PLANT DISEASE CNN MODEL
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cnn_model_path = os.path.join(
    BASE_DIR,
    "models",
    "plant_disease",
    "best_fine_tuned_model.keras"
)

class_names_path = os.path.join(
    BASE_DIR,
    "models",
    "plant_disease",
    "class_names.json"
)

treatment_csv_path = os.path.join(
    BASE_DIR,
    "datasets",
    "disease_treatment.csv"
)

plant_disease_model = tf.keras.models.load_model(
    cnn_model_path
)

with open(class_names_path, "r") as f:
    class_names = json.load(f)

treatment_df = pd.read_csv(
    treatment_csv_path
)

print("✓ Plant Disease CNN model loaded")
print("✓ Plant disease class names loaded")
print("✓ Disease treatment data loaded")

# ============================================================
# CNN LABEL → TREATMENT CSV MAPPING
# ============================================================

cnn_to_csv = {

    "Chilli_Healthy": ("Chilli", "healthy"),
    "Chilli_Leaf_Curl": ("Chilli", "leafcurl"),
    "Chilli_Leaf_Spot": ("Chilli", "spotleaf"),
    "Chilli_Whitefly": ("Chilli", "whitefly"),
    "Chilli_Yellowish_Leaf": ("Chilli", "Yellowish Leaf"),

    "Cotton_Healthy": ("Cotton", "Healthy"),
    "Cotton_Bacterial_Blight": ("Cotton", "bacterial_blight"),
    "Cotton_Curl_Virus": ("Cotton", "curl_virus"),
    "Cotton_Fusarium_Wilt": ("Cotton", "fussarium_wilt"),

    "Paddy_Healthy": ("Paddy", "health_paddy"),
    "Paddy_Brownspot": ("Paddy", "Brownspot"),
    "Paddy_Leafsmut": ("Paddy", "Leafsmut"),
    "Paddy_Bacterial_Leaf": ("Paddy", "bacterial_leaf"),

    "Sugarcane_Healthy": ("Sugarcane", "Healthy"),
    "Sugarcane_Mosaic": ("Sugarcane", "Mosaic"),
    "Sugarcane_Redrot": ("Sugarcane", "redrot"),
    "Sugarcane_Rust": ("Sugarcane", "Rust"),

    "Wheat_Healthy": ("Wheat", "Healthy"),
    "Wheat_Brown_Rust": ("Wheat", "Brownrust"),
    "Wheat_Septoria": ("Wheat", "septorial"),
    "Wheat_Yellow_Rust": ("Wheat", "yellow")
}

print("✓ CNN to treatment mapping loaded")
print("Total CNN mappings:", len(cnn_to_csv))

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
# ROUTE 4 — PLANT DISEASE PREDICTION
# ============================================================

@app.route('/predict_disease', methods=['POST'])
def predict_disease():

    # --------------------------------------------------------
    # 1. Check image upload
    # --------------------------------------------------------

    if 'image' not in request.files:
        return jsonify({
            'error': 'No image uploaded'
        }), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({
            'error': 'No image selected'
        }), 400

    # --------------------------------------------------------
    # 2. Read image
    # --------------------------------------------------------

    image_bytes = file.read()

    image = tf.io.decode_image(
        image_bytes,
        channels=3,
        expand_animations=False
    )

    # --------------------------------------------------------
    # 3. Resize exactly like Colab
    # --------------------------------------------------------

    image = tf.image.resize(
        image,
        (224, 224)
    )

    # --------------------------------------------------------
    # 4. Normalize exactly like Colab
    # --------------------------------------------------------

    image = image / 255.0

    # --------------------------------------------------------
    # 5. Add batch dimension
    # --------------------------------------------------------

    image = tf.expand_dims(
        image,
        axis=0
    )

    # --------------------------------------------------------
    # 6. CNN prediction
    # --------------------------------------------------------

    predictions = plant_disease_model.predict(
        image,
        verbose=0
    )

    # --------------------------------------------------------
    # 7. Get predicted class
    # --------------------------------------------------------

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_label = class_names[
        predicted_index
    ]

    # --------------------------------------------------------
    # 8. Confidence
    # --------------------------------------------------------

    confidence = float(
        predictions[0][predicted_index]
    ) * 100

    # --------------------------------------------------------
    # 9. CNN label → CSV mapping
    # --------------------------------------------------------

    if predicted_label not in cnn_to_csv:

        return jsonify({
            'error': 'Predicted class not found in mapping',
            'predicted_class': predicted_label
        }), 500

    crop, disease_class = cnn_to_csv[
        predicted_label
    ]

    # --------------------------------------------------------
    # 10. Find treatment information
    # --------------------------------------------------------

    result = treatment_df[
        (treatment_df['Crop'] == crop) &
        (treatment_df['Disease_Class'] == disease_class)
    ]

    # --------------------------------------------------------
    # 11. Treatment information not found
    # --------------------------------------------------------

    if result.empty:

        return jsonify({
            'error': 'Treatment information not found',
            'predicted_class': predicted_label,
            'crop': crop,
            'disease_class': disease_class
        }), 404

    # --------------------------------------------------------
    # 12. Get matching CSV row
    # --------------------------------------------------------

    row = result.iloc[0]

    # --------------------------------------------------------
    # 13. Return final response
    # --------------------------------------------------------

    return jsonify({

        'predicted_class': predicted_label,

        'confidence': round(
            confidence,
            2
        ),

        'crop': row['Crop'],

        'disease': row['Disease_Name'],

        'symptoms': row['Symptoms'],

        'precautions': row[
            'Precautions_Management'
        ],

        'treatment_pesticide_information': row[
            'Treatment_Pesticide_Information'
        ]
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

