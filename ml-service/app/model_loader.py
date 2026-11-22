import json
from pathlib import Path
from xgboost import XGBClassifier
import shap


# Locate the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Locate the saved model directory
MODEL_DIR = PROJECT_ROOT / "ml-training" / "models"

MODEL_PATH = MODEL_DIR / "fetowatch_xgb.json"
METADATA_PATH = MODEL_DIR / "model_metadata.json"


# Load model metadata
with open(METADATA_PATH, "r") as file:
    metadata = json.load(file)


# Load trained XGBoost model
model = XGBClassifier()
model.load_model(str(MODEL_PATH))


# Extract feature information
FEATURE_NAMES = metadata["feature_names"]

CLASS_NAMES = metadata["class_names"]

ENCODED_TO_ORIGINAL = metadata["encoded_to_original"]


print("FetoWatch model loaded successfully.")
print("Number of expected features:", len(FEATURE_NAMES))

explainer = shap.TreeExplainer(model)

print("SHAP explainer initialized successfully.")