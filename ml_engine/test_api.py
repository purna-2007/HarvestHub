
import requests


BASE_URL = "http://127.0.0.1:5000"


# ============================================================
# SAMPLE FARMER DATA
# ============================================================

farmer_data = {

    "date": "2026-10-05",

    "mandi_season": "Rabi",

    "district": "Guntur District",

    "crop_type": "Paddy",

    "weather_condition": "Heavy Rain Alert",

    "historical_labour_demanded": 60,

    "historical_labour_supplied": 45
}


# ============================================================
# TEST 1 — MARKET WAGE
# ============================================================

wage_response = requests.post(
    f"{BASE_URL}/predict_wage",
    json=farmer_data
)

print("\n======================================")
print("       MARKET WAGE API")
print("======================================")

print("Status Code:", wage_response.status_code)
print("Response:", wage_response.json())


# ============================================================
# TEST 2 — LABOUR DEMAND
# ============================================================

jobs_response = requests.post(
    f"{BASE_URL}/predict_jobs",
    json=farmer_data
)

print("\n======================================")
print("       LABOUR DEMAND API")
print("======================================")

print("Status Code:", jobs_response.status_code)
print("Response:", jobs_response.json())


# ============================================================
# SAMPLE WORKER DATA
# ============================================================

worker_data = {

    "experience": 5,

    "distance": 4.5,

    "w_rating": 4.5,

    "f_rating": 4.2
}


# ============================================================
# TEST 3 — WORKER-FARMER MATCHING
# ============================================================

match_response = requests.post(
    f"{BASE_URL}/predict_match",
    json=worker_data
)

print("\n======================================")
print("       WORKER MATCHING API")
print("======================================")

print("Status Code:", match_response.status_code)
print("Response:", match_response.json())


# ============================================================
# FINAL STATUS
# ============================================================

print("\n======================================")
print("       API TESTING COMPLETED")
print("======================================")

if (
    wage_response.status_code == 200
    and jobs_response.status_code == 200
    and match_response.status_code == 200
):
    print("✓ All 3 APIs are working successfully!")
else:
    print("✗ One or more APIs returned an error.")

