import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  RotateCcw,
  Send,
} from "lucide-react";

import api from "../services/api";

// Preserve the exact feature names used by the trained model.
const featureGroups = [
  {
    title: "Baseline and fetal movement",
    description: "Baseline heart rate and movement-related measurements.",
    fields: [
      {
        key: "baseline value",
        label: "Baseline value",
        description: "Baseline fetal heart rate.",
      },
      {
        name: "accelerations",
        key: "accelerations",
        label: "Accelerations",
        description: "Number of fetal heart rate accelerations.",
      },
      {
        name: "fetal_movement",
        key: "fetal_movement",
        label: "Fetal movement",
        description: "Fetal movement measurement.",
      },
      {
        name: "uterine_contractions",
        key: "uterine_contractions",
        label: "Uterine contractions",
        description: "Uterine contraction measurement.",
      },
    ],
  },
  {
    title: "Deceleration patterns",
    description: "Measurements related to fetal heart rate decelerations.",
    fields: [
      {
        key: "light_decelerations",
        label: "Light decelerations",
        description: "Number or measurement of light decelerations.",
      },
      {
        key: "severe_decelerations",
        label: "Severe decelerations",
        description: "Number or measurement of severe decelerations.",
      },
      {
        key: "prolongued_decelerations",
        label: "Prolonged decelerations",
        description: "Prolonged deceleration measurement.",
      },
    ],
  },
  {
    title: "Variability measurements",
    description: "Short-term and long-term variability characteristics.",
    fields: [
      {
        key: "abnormal_short_term_variability",
        label: "Abnormal short-term variability",
        description: "Percentage of abnormal short-term variability.",
      },
      {
        key: "mean_value_of_short_term_variability",
        label: "Mean short-term variability",
        description: "Mean value of short-term variability.",
      },
      {
        key: "percentage_of_time_with_abnormal_long_term_variability",
        label: "Abnormal long-term variability time",
        description: "Percentage of time with abnormal long-term variability.",
      },
      {
        key: "mean_value_of_long_term_variability",
        label: "Mean long-term variability",
        description: "Mean value of long-term variability.",
      },
    ],
  },
  {
    title: "CTG histogram measurements",
    description: "Statistical characteristics derived from the CTG histogram.",
    fields: [
      {
        key: "histogram_width",
        label: "Histogram width",
        description: "Width of the CTG histogram.",
      },
      {
        key: "histogram_min",
        label: "Histogram minimum",
        description: "Minimum histogram value.",
      },
      {
        key: "histogram_max",
        label: "Histogram maximum",
        description: "Maximum histogram value.",
      },
      {
        key: "histogram_number_of_peaks",
        label: "Number of histogram peaks",
        description: "Number of peaks in the histogram.",
      },
      {
        key: "histogram_number_of_zeroes",
        label: "Number of histogram zeroes",
        description: "Number of zeroes in the histogram.",
      },
      {
        key: "histogram_mode",
        label: "Histogram mode",
        description: "Mode of the histogram.",
      },
      {
        key: "histogram_mean",
        label: "Histogram mean",
        description: "Mean of the histogram.",
      },
      {
        key: "histogram_median",
        label: "Histogram median",
        description: "Median of the histogram.",
      },
      {
        key: "histogram_variance",
        label: "Histogram variance",
        description: "Variance of the histogram.",
      },
      {
        key: "histogram_tendency",
        label: "Histogram tendency",
        description: "Trend or tendency measurement.",
      },
    ],
  },
];

const allFields = featureGroups.flatMap((group) => group.fields);

const initialFeatures = Object.fromEntries(
  allFields.map((field) => [field.key, ""]),
);

const NewPrediction = () => {
  const [features, setFeatures] = useState(initialFeatures);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (key, value) => {
    setFeatures((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFeatures({ ...initialFeatures });
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    // Do not silently convert empty inputs into zero.
    const missingFields = allFields.filter(
      (field) =>
        features[field.key] === "" ||
        features[field.key] === null ||
        !Number.isFinite(Number(features[field.key])),
    );

    if (missingFields.length > 0) {
      setError(
        `Please enter valid numeric values for all 21 features. Missing or invalid fields: ${missingFields.length}.`,
      );
      return;
    }

    const numericFeatures = Object.fromEntries(
      allFields.map((field) => [field.key, Number(features[field.key])]),
    );

    setLoading(true);

    try {
      const response = await api.post("/predictions", {
        features: numericFeatures,
      });

      setResult(response.data.prediction);

      // Move the user to the result summary on the page.
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Prediction error:", err.response?.data || err);

      const serverMessage = err.response?.data?.message;

      setError(
        typeof serverMessage === "string"
          ? serverMessage
          : typeof err.response?.data?.detail === "string"
            ? err.response.data.detail
            : "Unable to generate prediction. Check the browser console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const probabilityEntries = result?.probabilities
    ? Object.entries(result.probabilities)
    : [];

  return (
    <div className="prediction-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ANALYSIS WORKSPACE</p>
          <h1>New CTG prediction</h1>
          <p>
            Enter the 21 CTG features to generate an experimental model
            prediction.
          </p>
        </div>

        <Link to="/dashboard" className="secondary-link">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>
      </div>

      {error && <div className="error-message prediction-error">{error}</div>}

      {result && (
        <div className="result-summary-card" id="prediction-result">
          <div className="result-success-heading">
            <div className="result-success-icon">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <p className="result-overline">PREDICTION GENERATED</p>
              <h2>Your model result is ready</h2>
            </div>
          </div>

          <div className="result-class">
            <span>Predicted class</span>
            <strong>{result.predictedClass}</strong>
          </div>

          <div className="result-probabilities">
            <h3>Class probabilities</h3>

            <div className="probability-grid">
              {probabilityEntries.map(([name, value]) => (
                <div className="probability-item" key={name}>
                  <span>{name}</span>
                  <strong>{(Number(value) * 100).toFixed(2)}%</strong>
                </div>
              ))}
            </div>
          </div>

          <p className="result-record-id">Record ID: {result._id}</p>

          <div className="result-disclaimer">{result.disclaimer}</div>

          <div className="result-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              New prediction
            </button>

            <Link to="/history" className="primary-link">
              View history <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      )}

      <div className="form-intro-card">
        <div className="form-intro-icon">
          <FileText size={22} />
        </div>

        <div>
          <h2>CTG feature information</h2>
          <p>
            Complete all 21 fields using numeric values from your prepared CTG
            dataset or test example. The feature names and ordering are aligned
            with the trained model.
          </p>
        </div>

        <div className="feature-count">
          <strong>21</strong>
          <span>Features</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="prediction-form">
        {featureGroups.map((group, groupIndex) => (
          <section className="feature-section" key={group.title}>
            <div className="feature-section-heading">
              <div className="section-number">
                {String(groupIndex + 1).padStart(2, "0")}
              </div>

              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>

              <span className="section-count">
                {group.fields.length} fields
              </span>
            </div>

            <div className="feature-grid">
              {group.fields.map((field) => (
                <div className="feature-field" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    <span className="required-mark">*</span>
                  </label>

                  <input
                    id={field.key}
                    type="number"
                    step="any"
                    value={features[field.key]}
                    onChange={(event) =>
                      handleChange(field.key, event.target.value)
                    }
                    placeholder="Enter numeric value"
                    required
                  />

                  <p>{field.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="form-bottom">
          <div className="form-bottom-note">
            <Activity size={18} />
            <span>All 21 features are required before submission.</span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw size={16} />
              Reset form
            </button>

            <button
              type="submit"
              className="primary-link submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Generate prediction
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="prediction-disclaimer">
        <strong>Important notice</strong>
        <p>
          FetoWatch AI is an educational machine-learning prototype. Its
          predictions and explanations are experimental, not clinically
          validated, and must not be used for diagnosis or patient-care
          decisions.
        </p>
      </div>
    </div>
  );
};

export default NewPrediction;
