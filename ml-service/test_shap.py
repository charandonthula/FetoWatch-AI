import pandas as pd

from app.model_loader import (
    model,
    explainer,
    FEATURE_NAMES,
    CLASS_NAMES
)

# One sample input with all 21 features
sample = {
    "baseline value": 138.0,
    "accelerations": 0.0,
    "fetal_movement": 0.004,
    "uterine_contractions": 0.0,
    "light_decelerations": 0.0,
    "severe_decelerations": 0.0,
    "prolongued_decelerations": 0.0,
    "abnormal_short_term_variability": 38.0,
    "mean_value_of_short_term_variability": 1.2,
    "percentage_of_time_with_abnormal_long_term_variability": 0.0,
    "mean_value_of_long_term_variability": 16.5,
    "histogram_width": 84.0,
    "histogram_min": 71.0,
    "histogram_max": 155.0,
    "histogram_number_of_peaks": 4.0,
    "histogram_number_of_zeroes": 0.0,
    "histogram_mode": 144.0,
    "histogram_mean": 140.0,
    "histogram_median": 142.0,
    "histogram_variance": 5.0,
    "histogram_tendency": 1.0
}

input_data = pd.DataFrame(
    [[sample[name] for name in FEATURE_NAMES]],
    columns=FEATURE_NAMES
)

# Get model prediction
prediction = int(model.predict(input_data)[0])
predicted_class = CLASS_NAMES[str(prediction)]

print("\nPredicted class:", predicted_class)

# Calculate SHAP values

shap_values = explainer.shap_values(input_data)

print("\nSHAP output shape:", shap_values.shape)

# Select SHAP values for the predicted class
predicted_class_shap = shap_values[0, :, prediction]

# Create a table of feature contributions
explanation = pd.DataFrame({
    "feature": FEATURE_NAMES,
    "feature_value": input_data.iloc[0].values,
    "shap_value": predicted_class_shap
})

# Rank features by absolute contribution
explanation["importance"] = explanation["shap_value"].abs()

explanation = explanation.sort_values(
    by="importance",
    ascending=False
)

print("\nTop 10 contributing features:")
print(
    explanation[
        ["feature", "feature_value", "shap_value"]
    ].head(10).to_string(index=False)
)

print("\nSHAP calculation completed successfully.")
