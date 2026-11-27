
import { useEffect, useState } from "react";
import {
    Activity,
    FileText,
    Clock,
    ArrowUpRight,
    Plus,
    ArrowRight
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFeedback, setStatusFeedback] = useState("");
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const response = await api.get("/predictions");

                setPredictions(response.data.predictions || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load prediction history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
    }, []);

    const handleStatusChange = async (predictionId, newStatus) => {
        setStatusUpdatingId(predictionId);
        setError("");
        setStatusFeedback("");

        try {
            const response = await api.patch(
                `/predictions/${predictionId}/status`,
                { reviewStatus: newStatus }
            );

            const updatedStatus =
                response.data.prediction?.reviewStatus || newStatus;

            setPredictions((previousPredictions) =>
                previousPredictions.map((item) =>
                    item._id === predictionId
                        ? { ...item, reviewStatus: updatedStatus }
                        : item
                )
            );

            setStatusFeedback("Review status updated successfully.");

            // Notify the Topbar so its pending notification count refreshes.
            window.dispatchEvent(new Event("predictions-updated"));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update the review status."
            );
        } finally {
            setStatusUpdatingId(null);
        }
    };

    const totalPredictions = predictions.length;

    const pendingReviews = predictions.filter(
        (item) => item.reviewStatus === "pending"
    ).length;

    const latestPrediction = predictions[0];

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="dashboard">

            <div className="page-heading">
                <div>
                    <p className="eyebrow">OVERVIEW</p>
                    <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
                    <p>
                        Here's an overview of your FetoWatch AI workspace.
                    </p>
                </div>

                <Link to="/predictions/new" className="primary-link">
                    <Plus size={18} />
                    New Prediction
                </Link>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {statusFeedback && (
                <div className="status-feedback">
                    {statusFeedback}
                </div>
            )}

            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon blue">
                            <FileText size={21} />
                        </div>
                        <span className="stat-caption">ALL RECORDS</span>
                    </div>

                    <h2>{loading ? "..." : totalPredictions}</h2>
                    <p>Total predictions</p>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon orange">
                            <Clock size={21} />
                        </div>
                        <span className="stat-caption">WORKFLOW</span>
                    </div>

                    <h2>{loading ? "..." : pendingReviews}</h2>
                    <p>Pending reviews</p>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon green">
                            <Activity size={21} />
                        </div>
                        <span className="stat-caption">LATEST ACTIVITY</span>
                    </div>

                    <h2 className="stat-date">
                        {loading
                            ? "..."
                            : latestPrediction
                                ? formatDate(latestPrediction.createdAt)
                                : "No activity"
                        }
                    </h2>

                    <p>Most recent prediction</p>
                </div>

            </div>

            <div className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <h2>Recent predictions</h2>
                        <p>Your latest prediction records</p>
                    </div>

                    <Link to="/history" className="text-link">
                        View all <ArrowUpRight size={16} />
                    </Link>
                </div>

                <div className="table-card">

                    {loading ? (
                        <div className="empty-state">
                            Loading predictions...
                        </div>
                    ) : predictions.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <FileText size={25} />
                            </div>

                            <h3>No predictions yet</h3>

                            <p>
                                Your prediction records will appear here
                                after you submit your first CTG analysis.
                            </p>

                            <Link
                                to="/predictions/new"
                                className="primary-link"
                            >
                                Create prediction <ArrowRight size={17} />
                            </Link>
                        </div>
                    ) : (
                        <div className="table-scroll">
                            <table className="prediction-table">
                                <thead>
                                    <tr>
                                        <th>Prediction ID</th>
                                        <th>Predicted class</th>
                                        <th>Review status</th>
                                        <th>Date</th>
                                        <th>Update status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {predictions.slice(0, 5).map((item) => (
                                        <tr key={item._id}>
                                            <td className="id-cell">
                                                #{item._id.slice(-8)}
                                            </td>

                                            <td>
                                                {item.predictedClass}
                                            </td>

                                            <td>
                                                <span className={`status-badge ${item.reviewStatus}`}>
                                                    {item.reviewStatus}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(item.createdAt)}
                                            </td>

                                            <td>
                                                <select
                                                    className="review-status-select"
                                                    value={item.reviewStatus}
                                                    disabled={statusUpdatingId === item._id}
                                                    onChange={(event) =>
                                                        handleStatusChange(
                                                            item._id,
                                                            event.target.value
                                                        )
                                                    }
                                                    aria-label={`Update review status for prediction ${item._id.slice(-8)}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewed">Reviewed</option>
                                                    <option value="flagged">Flagged</option>
                                                </select>

                                                {statusUpdatingId === item._id && (
                                                    <span className="status-saving">
                                                        Saving...
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

            </div>

            <div className="dashboard-note">
                <Activity size={19} />
                <div>
                    <strong>About FetoWatch AI</strong>
                    <p>
                        This platform demonstrates CTG classification and
                        model explainability using machine learning.
                        Its results are experimental and are not intended
                        for clinical diagnosis or patient care.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
