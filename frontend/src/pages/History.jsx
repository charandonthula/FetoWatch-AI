
import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    FileText,
    Search,
    Filter,
    Clock,
    Eye,
    RefreshCw
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../services/api";

const History = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchPredictions = async () => {
            setLoading(true);
            setError("");

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
    }, [refreshKey]);

    const totalPredictions = predictions.length;

    const normalCount = predictions.filter(
        (item) => item.predictedClass?.toLowerCase() === "normal"
    ).length;

    const suspectCount = predictions.filter(
        (item) => item.predictedClass?.toLowerCase() === "suspect"
    ).length;

    const pathologicalCount = predictions.filter(
        (item) => item.predictedClass?.toLowerCase() === "pathological"
    ).length;

    const filteredPredictions = useMemo(() => {
        return predictions.filter((item) => {
            const search = searchTerm.trim().toLowerCase();

            const matchesSearch =
                !search ||
                item._id?.toLowerCase().includes(search) ||
                item._id?.slice(-8).toLowerCase().includes(search) ||
                item.predictedClass?.toLowerCase().includes(search);

            const matchesClass =
                classFilter === "all" ||
                item.predictedClass?.toLowerCase() === classFilter;

            const matchesStatus =
                statusFilter === "all" ||
                item.reviewStatus === statusFilter;

            return matchesSearch && matchesClass && matchesStatus;
        });
    }, [predictions, searchTerm, classFilter, statusFilter]);

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const resetFilters = () => {
        setSearchTerm("");
        setClassFilter("all");
        setStatusFilter("all");
    };

    return (
        <div className="history-page">

            {/* Page heading */}
            <div className="page-heading">
                <div>
                    <p className="eyebrow">RECORD MANAGEMENT</p>
                    <h1>Prediction History</h1>
                    <p>
                        View and manage your previous CTG prediction records.
                    </p>
                </div>

                <button
                    className="history-refresh-button"
                    onClick={() => setRefreshKey((current) => current + 1)}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Summary statistics */}
            <div className="history-stats-grid">

                <div className="history-stat-card">
                    <div className="history-stat-top">
                        <div className="stat-icon blue">
                            <FileText size={21} />
                        </div>
                        <span className="stat-caption">ALL RECORDS</span>
                    </div>

                    <h2>{loading ? "..." : totalPredictions}</h2>
                    <p>Total predictions</p>
                </div>

                <div className="history-stat-card">
                    <div className="history-stat-top">
                        <div className="stat-icon green">
                            <Activity size={21} />
                        </div>
                        <span className="stat-caption">CLASS 1</span>
                    </div>

                    <h2>{loading ? "..." : normalCount}</h2>
                    <p>Normal predictions</p>
                </div>

                <div className="history-stat-card">
                    <div className="history-stat-top">
                        <div className="stat-icon orange">
                            <Activity size={21} />
                        </div>
                        <span className="stat-caption">CLASS 2</span>
                    </div>

                    <h2>{loading ? "..." : suspectCount}</h2>
                    <p>Suspect predictions</p>
                </div>

                <div className="history-stat-card">
                    <div className="history-stat-top">
                        <div className="stat-icon red">
                            <Activity size={21} />
                        </div>
                        <span className="stat-caption">CLASS 3</span>
                    </div>

                    <h2>{loading ? "..." : pathologicalCount}</h2>
                    <p>Pathological predictions</p>
                </div>

            </div>

            {/* Search and filters */}
            <div className="history-toolbar">

                <div className="history-search">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search by prediction ID or class..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>

                <div className="history-filter">
                    <Filter size={18} />

                    <select
                        value={classFilter}
                        onChange={(event) => setClassFilter(event.target.value)}
                    >
                        <option value="all">All classes</option>
                        <option value="normal">Normal</option>
                        <option value="suspect">Suspect</option>
                        <option value="pathological">Pathological</option>
                    </select>
                </div>

                <div className="history-filter">
                    <Clock size={18} />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="flagged">Flagged</option>
                    </select>
                </div>

                <button
                    className="history-reset-button"
                    onClick={resetFilters}
                >
                    Clear filters
                </button>

            </div>

            {/* Prediction records */}
            <div className="history-table-card">

                <div className="history-table-heading">
                    <div>
                        <h2>All prediction records</h2>
                        <p>
                            {loading
                                ? "Loading records..."
                                : `Showing ${filteredPredictions.length} of ${totalPredictions} records`
                            }
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="history-empty-state">
                        <div className="history-empty-icon">
                            <RefreshCw size={25} />
                        </div>
                        <h3>Loading prediction history</h3>
                        <p>Please wait while your records are retrieved.</p>
                    </div>
                ) : error ? (
                    <div className="history-empty-state">
                        <div className="history-empty-icon">
                            <FileText size={25} />
                        </div>
                        <h3>Unable to load records</h3>
                        <p>Try refreshing the prediction history.</p>
                        <button
                            className="history-empty-button"
                            onClick={() => setRefreshKey((current) => current + 1)}
                        >
                            Try again
                        </button>
                    </div>
                ) : predictions.length === 0 ? (
                    <div className="history-empty-state">
                        <div className="history-empty-icon">
                            <FileText size={25} />
                        </div>

                        <h3>No predictions yet</h3>

                        <p>
                            Your saved prediction records will appear here
                            after you generate your first prediction.
                        </p>

                        <Link
                            to="/predictions/new"
                            className="primary-link"
                        >
                            Create prediction
                        </Link>
                    </div>
                ) : filteredPredictions.length === 0 ? (
                    <div className="history-empty-state">
                        <div className="history-empty-icon">
                            <Search size={25} />
                        </div>

                        <h3>No matching records</h3>

                        <p>
                            Try changing your search term or filters.
                        </p>

                        <button
                            className="history-empty-button"
                            onClick={resetFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="table-scroll">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Prediction ID</th>
                                    <th>Predicted class</th>
                                    <th>Review status</th>
                                    <th>Date created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPredictions.map((item) => (
                                    <tr key={item._id}>
                                        <td className="id-cell">
                                            #{item._id.slice(-8)}
                                        </td>

                                        <td>
                                            <span
                                                className={`history-class-badge ${
                                                    item.predictedClass?.toLowerCase()
                                                }`}
                                            >
                                                {item.predictedClass}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${item.reviewStatus}`}
                                            >
                                                {item.reviewStatus}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td>
                                            <Link
                                                to={`/predictions/${item._id}`}
                                                className="history-view-link"
                                            >
                                                <Eye size={16} />
                                                View details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {/* Educational disclaimer */}
            <div className="dashboard-note history-note">
                <Activity size={19} />
                <div>
                    <strong>Educational prototype</strong>
                    <p>
                        Prediction records demonstrate experimental CTG
                        classification and model explainability. They are
                        not clinical diagnoses and must not be used for
                        patient-care decisions.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default History;
