from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd

from app.model_loader import (
    model,
    explainer,
    FEATURE_NAMES,
    CLASS_NAMES,
    ENCODED_TO_ORIGINAL
)


app = FastAPI(
    title="FetoWatch AI",
    description="ML inference service for fetal health classification research",
    version="1.0.0"
)


class PredictionRequest(BaseModel):
    features: dict[str, float]


@app.get("/")
def home():
    return {
        "message": "Welcome to FetoWatch AI ML Service"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FetoWatch AI ML Service",
        "model_loaded": True
    }


@app.post("/predict")
def predict(request: PredictionRequest):

    input_features = request.features

    # Check for missing features
    missing_features = [
        feature for feature in FEATURE_NAMES
        if feature not in input_features
    ]

    # Check for unexpected features
    extra_features = [
        feature for feature in input_features
        if feature not in FEATURE_NAMES
    ]

    if missing_features or extra_features:
        raise HTTPException(
            status_code=400,
            detail={
                "missing_features": missing_features,
                "unexpected_features": extra_features
            }
        )

    # Arrange features in the original training order
    input_data = pd.DataFrame(
        [[input_features[name] for name in FEATURE_NAMES]],
        columns=FEATURE_NAMES
    )

    # Generate prediction
    prediction = int(model.predict(input_data)[0])

    # Generate class probabilities
    probabilities = model.predict_proba(input_data)[0]

    # Convert encoded class into original class
    original_class = ENCODED_TO_ORIGINAL[str(prediction)]

    predicted_class_name = CLASS_NAMES[str(prediction)]

    probability_results = {
        CLASS_NAMES[str(index)]: round(float(probability), 4)
        for index, probability in enumerate(probabilities)
    }

    return {
        "predicted_class": predicted_class_name,
        "encoded_class": prediction,
        "original_class": original_class,
        "probabilities": probability_results,
        "disclaimer": (
            "Educational prototype only. "
            "Not intended for clinical diagnosis or patient care."
        )
    }


@app.post("/explain")
def explain_prediction(request: PredictionRequest):
    input_features = request.features

    missing_features = [
        feature for feature in FEATURE_NAMES
        if feature not in input_features
    ]

    extra_features = [
        feature for feature in input_features
        if feature not in FEATURE_NAMES
    ]

    if missing_features or extra_features:
        raise HTTPException(
            status_code=400,
            detail={
                "missing_features": missing_features,
                "unexpected_features": extra_features
            }
        )

    input_data = pd.DataFrame(
        [[input_features[name] for name in FEATURE_NAMES]],
        columns=FEATURE_NAMES
    )

    prediction = int(model.predict(input_data)[0])
    probabilities = model.predict_proba(input_data)[0]

    predicted_class_name = CLASS_NAMES[str(prediction)]
    original_class = ENCODED_TO_ORIGINAL[str(prediction)]

    # Calculate SHAP contributions
    shap_values = explainer.shap_values(input_data)

    # Select contributions for the predicted class
    predicted_class_shap = shap_values[0, :, prediction]

    # Build feature explanation
    explanation = pd.DataFrame({
        "feature": FEATURE_NAMES,
        "feature_value": input_data.iloc[0].values,
        "shap_value": predicted_class_shap
    })

    # Rank by absolute contribution
    explanation["importance"] = explanation["shap_value"].abs()

    explanation = explanation.sort_values(
        by="importance",
        ascending=False
    )

    # Return top 10 features
    top_features = []

    for _, row in explanation.head(10).iterrows():
        shap_value = float(row["shap_value"])

        top_features.append({
            "feature": row["feature"],
            "feature_value": float(row["feature_value"]),
            "shap_value": round(shap_value, 6),
            "direction": (
                "towards_predicted_class"
                if shap_value > 0
                else "away_from_predicted_class"
                if shap_value < 0
                else "no_contribution"
            )
        })

    probability_results = {
        CLASS_NAMES[str(index)]: round(float(probability), 4)
        for index, probability in enumerate(probabilities)
    }

    return {
        "predicted_class": predicted_class_name,
        "encoded_class": prediction,
        "original_class": original_class,
        "probabilities": probability_results,
        "top_features": top_features,
        "disclaimer": (
            "Educational prototype only. "
            "SHAP explanations describe model behavior, "
            "not medical causation. "
            "Not intended for clinical diagnosis or patient care."
        )
    }
