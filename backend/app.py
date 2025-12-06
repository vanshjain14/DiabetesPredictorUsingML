from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
from supabase import create_client, Client
import json
import datetime

# ============================================================== #
# 🚀 Flask setup
# ============================================================== #
app = Flask(__name__)
CORS(app)

# ============================================================== #
# 🧠 Load model and scaler
# ============================================================== #
try:
    model = joblib.load("pima_stacked_model.pkl")
    scaler = joblib.load("pima_scaler.pkl")
    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print("❌ Error loading model/scaler:", e)

# ============================================================== #
# 🔐 Supabase setup
# ============================================================== #
SUPABASE_URL = "<your url here>"
SUPABASE_SERVICE_KEY = "<your key here>"  # ⚠️ keep this private
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ============================================================== #
# 🩺 Prediction endpoint
# ============================================================== #
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Extract safely
        pregnancies = float(data.get("pregnancies", 0))
        glucose = float(data.get("glucose", 0))
        bloodPressure = float(data.get("bloodPressure", 0))
        skinThickness = float(data.get("skinThickness", 0))
        insulin = float(data.get("insulin", 0))
        bmi = float(data.get("bmi", 0))
        diabetesPedigreeFunction = float(data.get("diabetesPedigreeFunction", 0))
        age = float(data.get("age", 0))
        user_id = data.get("user_id")

        # ==============================================================
        # ⚙️ Preprocess input
        # ==============================================================
        input_data = np.array([[pregnancies, glucose, bloodPressure, skinThickness,
                                insulin, bmi, diabetesPedigreeFunction, age]])
        scaled = scaler.transform(input_data)

        # ==============================================================
        # 🔮 Predict using stacked model
        # ==============================================================
        prediction = int(model.predict(scaled)[0])
        probability = float(model.predict_proba(scaled)[0][1]) * 100

        # Risk level
        if probability > 70:
            risk_level = "High"
        elif probability > 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # ==============================================================
        # 📊 Dynamic Feature Importance (0–100%)
        # ==============================================================
        feature_names = [
            "pregnancies",
            "glucose",
            "bloodPressure",
            "skinThickness",
            "insulin",
            "bmi",
            "diabetesPedigreeFunction",
            "age",
        ]

        abs_features = np.abs(scaled[0])
        total = np.sum(abs_features)
        if total > 0:
            normalized_importance = (abs_features / total) * 100
        else:
            normalized_importance = np.ones_like(abs_features) * (100 / len(abs_features))

        feature_importance = {
            feature_names[i]: round(float(normalized_importance[i]), 2)
            for i in range(len(feature_names))
        }

        # ==============================================================
        # 💾 Save prediction to Supabase
        # ==============================================================
        insert_data = {
            "user_id": user_id,
            "input_data": json.dumps(data),
            "prediction": prediction,
            "probability": round(probability, 2),
            "risk_level": risk_level,
            "feature_importance": json.dumps(feature_importance),
            "created_at": datetime.datetime.utcnow().isoformat(),
        }

        response = supabase.table("predictions").insert(insert_data).execute()

        if hasattr(response, "error") and response.error:
            print("⚠️ Supabase insert error:", response.error)

        # ==============================================================
        # 📈 Update or create user analytics
        # ==============================================================
        if user_id:
            existing = supabase.table("user_analytics").select("*").eq("user_id", user_id).execute()

            if existing.data:
                record = existing.data[0]
                total = record.get("total_predictions", 0) + 1
                high = record.get("high_risk_predictions", 0) + (1 if risk_level == "High" else 0)
                medium = record.get("medium_risk_predictions", 0) + (1 if risk_level == "Medium" else 0)
                low = record.get("low_risk_predictions", 0) + (1 if risk_level == "Low" else 0)

                supabase.table("user_analytics").update({
                    "total_predictions": total,
                    "high_risk_predictions": high,
                    "medium_risk_predictions": medium,
                    "low_risk_predictions": low,
                    "last_prediction_at": datetime.datetime.utcnow().isoformat(),
                }).eq("user_id", user_id).execute()

            else:
                supabase.table("user_analytics").insert({
                    "user_id": user_id,
                    "total_predictions": 1,
                    "high_risk_predictions": 1 if risk_level == "High" else 0,
                    "medium_risk_predictions": 1 if risk_level == "Medium" else 0,
                    "low_risk_predictions": 1 if risk_level == "Low" else 0,
                    "last_prediction_at": datetime.datetime.utcnow().isoformat(),
                }).execute()

        # ==============================================================
        # ✅ Response
        # ==============================================================
        return jsonify({
            "prediction": prediction,
            "probability": round(probability, 2),
            "riskLevel": risk_level,
            "featureImportance": feature_importance,
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


# ============================================================== #
# 🏃 Run Flask
# ============================================================== #
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
