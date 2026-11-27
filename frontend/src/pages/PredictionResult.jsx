import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  CalendarDays,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import api from "../services/api";

const formatFeatureName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PredictionResult = () => {
  const { id } = useParams();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/predictions/${id}`);
        setPrediction(response.data.prediction);
      } catch (err) {
        console.error(
          "Unable to retrieve prediction:",
          err.response?.data || err,
        );

        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : "Unable to load this prediction.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [id]);
  const handleReviewStatusUpdate = async (newStatus) => {
    if (!prediction || statusUpdating) return;

    if (newStatus === (prediction.reviewStatus || "pending")) {
      return;
    }

    setStatusUpdating(true);
    setStatusFeedback({
      type: "",
      message: "",
    });

    try {
      const response = await api.patch(`/predictions/${id}/status`, {
        reviewStatus: newStatus,
      });

      setPrediction(response.data.prediction);

      setStatusFeedback({
        type: "success",
        message: `Review status updated to ${newStatus}.`,
      });
    } catch (err) {
      console.error(
        "Unable to update review status:",
        err.response?.data || err,
      );

      setStatusFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          "Unable to update review status. Please try again.",
      });
    } finally {
      setStatusUpdating(false);
    }
  };
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading prediction results...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="prediction-result-page">
        <div className="result-error-card">
          <AlertCircle size={30} />
          <h2>Unable to load prediction</h2>
          <p>{error || "The requested prediction was not found."}</p>

          <Link to="/dashboard" className="primary-link">
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const probabilities = Object.entries(prediction.probabilities || {}).map(
    ([className, probability]) => ({
      className,
      probability: Number(probability),
    }),
  );

  const topFeatures = (prediction.topFeatures || [])
    .map((item) => ({
      ...item,
      shap_value: Number(item.shap_value),
    }))
    .filter((item) => Number.isFinite(item.shap_value));

  const chartData = [...topFeatures].reverse();

  const getDirectionLabel = (direction) => {
    if (direction === "towards_predicted_class") {
      return "Towards predicted class";
    }

    if (direction === "away_from_predicted_class") {
      return "Away from predicted class";
    }

    return "No contribution";
  };

  const getDirectionClass = (direction) => {
    if (direction === "towards_predicted_class") {
      return "shap-positive";
    }

    if (direction === "away_from_predicted_class") {
      return "shap-negative";
    }

    return "shap-neutral";
  };

  return (
    <div className="prediction-result-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PREDICTION ANALYSIS</p>
          <h1>Prediction results</h1>
          <p>Review the model output and its feature-level explanations.</p>
        </div>

        <Link to="/dashboard" className="secondary-link">
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </div>

      {/* Main prediction summary */}

      <section className="result-overview-card">
        <div className="result-overview-top">
          <div>
            <p className="result-overline">MODEL PREDICTION</p>

            <h2>{prediction.predictedClass}</h2>

            <p className="result-overview-description">
              Predicted class returned by the trained XGBoost classification
              model.
            </p>
          </div>

          <div className="result-overview-icon">
            <Activity size={28} />
          </div>
        </div>

        <div className="result-metadata">
          <div>
            <FileText size={16} />
            <span>Original class: {prediction.originalClass}</span>
          </div>

          <div>
            <CalendarDays size={16} />
            <span>{formatDate(prediction.createdAt)}</span>
          </div>

          <div>
            <span className="review-status">
              {prediction.reviewStatus || "pending"}
            </span>
            <span>Review status</span>
          </div>
        </div>
      </section>
      <section className="result-content-card review-status-controls">
        <div className="result-section-heading">
          <div>
            <h2>Prediction review status</h2>
            <p>Update the workflow status of this saved prediction.</p>
          </div>
        </div>

        <div className="review-status-actions">
          {["pending", "reviewed", "flagged"].map((status) => (
            <button
              key={status}
              type="button"
              className={`review-status-button ${
                (prediction.reviewStatus || "pending") === status
                  ? "active"
                  : ""
              }`}
              onClick={() => handleReviewStatusUpdate(status)}
              disabled={
                statusUpdating ||
                (prediction.reviewStatus || "pending") === status
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {statusUpdating && (
          <p className="review-status-feedback">Updating review status...</p>
        )}

        {statusFeedback.message && (
          <p
            className={`review-status-feedback ${statusFeedback.type}`}
            role="status"
          >
            {statusFeedback.message}
          </p>
        )}

        <p className="review-status-note">
          These statuses track the application's review workflow. They do not
          represent clinical validation or confirmation of a prediction.
        </p>
      </section>

      {/* Class probabilities */}

      <section className="result-content-card">
        <div className="result-section-heading">
          <div>
            <h2>Class probabilities</h2>
            <p>
              Probability estimates produced by the model for each of its three
              classes.
            </p>
          </div>
        </div>

        <div className="probability-grid result-probability-grid">
          {probabilities.map((item) => (
            <div className="probability-item" key={item.className}>
              <span>{item.className}</span>

              <strong>{(item.probability * 100).toFixed(2)}%</strong>

              <div className="probability-track">
                <div
                  className="probability-fill"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, item.probability * 100),
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHAP explanation */}

      <section className="result-content-card">
        <div className="result-section-heading">
          <div>
            <h2>Feature contribution analysis</h2>
            <p>
              Top features influencing this individual model prediction,
              according to SHAP.
            </p>
          </div>
        </div>

        <div className="shap-legend">
          <span>
            <i className="legend-dot shap-towards"></i>
            Towards predicted class
          </span>

          <span>
            <i className="legend-dot shap-away"></i>
            Away from predicted class
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="shap-chart">
            <ResponsiveContainer width="100%" height={430}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 25,
                  bottom: 10,
                  left: 15,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#8793A6" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="feature"
                  width={175}
                  tickFormatter={formatFeatureName}
                  tick={{
                    fontSize: 10,
                    fill: "#596981",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    Number(value).toFixed(5),
                    "SHAP value",
                  ]}
                  labelFormatter={formatFeatureName}
                />

                <Bar
                  dataKey="shap_value"
                  name="SHAP value"
                  radius={[0, 4, 4, 0]}
                  barSize={19}
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={`shap-${index}`}
                      fill={
                        item.direction === "towards_predicted_class"
                          ? "#2563EB"
                          : item.direction === "away_from_predicted_class"
                            ? "#E69A48"
                            : "#9AA5B5"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-shap-state">
            No SHAP contribution data is available for this record.
          </div>
        )}

        <p className="shap-explanation-note">
          A positive SHAP value indicates a contribution towards the predicted
          class, while a negative value indicates a contribution away from it.
          These values explain model behavior; they do not establish medical
          causation or clinical risk.
        </p>
      </section>

      {/* SHAP details table */}

      <section className="result-content-card">
        <div className="result-section-heading">
          <div>
            <h2>Feature explanation details</h2>
            <p>
              Individual feature values and their signed SHAP contributions.
            </p>
          </div>
        </div>

        {topFeatures.length > 0 ? (
          <div className="shap-table-wrapper">
            <table className="shap-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Input value</th>
                  <th>SHAP value</th>
                  <th>Contribution</th>
                </tr>
              </thead>

              <tbody>
                {topFeatures.map((item, index) => (
                  <tr key={`${item.feature}-${index}`}>
                    <td>{formatFeatureName(item.feature)}</td>

                    <td>
                      {Number(item.feature_value).toLocaleString("en-IN")}
                    </td>

                    <td>{item.shap_value.toFixed(5)}</td>

                    <td>
                      <span
                        className={`shap-direction ${getDirectionClass(
                          item.direction,
                        )}`}
                      >
                        {getDirectionLabel(item.direction)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-shap-state">
            No feature details are available.
          </div>
        )}
      </section>

      {/* Disclaimer */}

      <section className="prediction-disclaimer">
        <strong>Educational prototype — important notice</strong>

        <p>
          FetoWatch AI is an experimental machine-learning prototype and has not
          been clinically validated. Its predictions and SHAP explanations must
          not be used for diagnosis, treatment, or patient-care decisions. SHAP
          describes model behavior and does not establish medical causation.
        </p>
      </section>
    </div>
  );
};

export default PredictionResult;
