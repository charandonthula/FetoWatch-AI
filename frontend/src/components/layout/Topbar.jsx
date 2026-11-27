
import { useCallback, useEffect, useState } from "react";
import {
    Bell,
    LogOut,
    UserCircle,
    Clock,
    FileText
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const Topbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [pendingPredictions, setPendingPredictions] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const fetchNotifications = useCallback(async () => {
        setNotificationLoading(true);
        setNotificationError("");

        try {
            const response = await api.get("/predictions");
            const allPredictions = response.data.predictions || [];

            const pending = allPredictions.filter(
                (item) => item.reviewStatus === "pending"
            );

            setPendingPredictions(pending);
        } catch (err) {
            setNotificationError(
                err.response?.data?.message ||
                "Unable to load notifications."
            );
        } finally {
            setNotificationLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        const handlePredictionsUpdated = () => {
            fetchNotifications();
        };

        window.addEventListener(
            "predictions-updated",
            handlePredictionsUpdated
        );

        return () => {
            window.removeEventListener(
                "predictions-updated",
                handlePredictionsUpdated
            );
        };
    }, [fetchNotifications]);

    const handleNotificationClick = () => {
        const nextState = !notificationsOpen;
        setNotificationsOpen(nextState);

        if (nextState) {
            fetchNotifications();
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const initials = user?.name
        ?.split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <header className="topbar">

            <div className="topbar-left">
                <p>FetoWatch AI / <strong>Workspace</strong></p>
            </div>

            <div className="topbar-right">

                <div className="notification-wrapper">
                    <button
                        className="icon-button notification-button"
                        title="Notifications"
                        type="button"
                        onClick={handleNotificationClick}
                        aria-label="Notifications"
                        aria-expanded={notificationsOpen}
                    >
                        <Bell size={19} />

                        {pendingPredictions.length > 0 && (
                            <span className="notification-count">
                                {pendingPredictions.length > 99
                                    ? "99+"
                                    : pendingPredictions.length}
                            </span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="notification-dropdown">

                            <div className="notification-header">
                                <div>
                                    <h3>Notifications</h3>
                                    <p>
                                        {pendingPredictions.length} pending
                                        {pendingPredictions.length === 1
                                            ? " prediction"
                                            : " predictions"}
                                    </p>
                                </div>
                            </div>

                            {notificationLoading ? (
                                <div className="notification-empty">
                                    Loading notifications...
                                </div>
                            ) : notificationError ? (
                                <div className="notification-empty notification-error">
                                    {notificationError}
                                </div>
                            ) : pendingPredictions.length === 0 ? (
                                <div className="notification-empty">
                                    <Bell size={23} />
                                    <p>You're all caught up!</p>
                                    <span>
                                        There are no pending predictions.
                                    </span>
                                </div>
                            ) : (
                                <div className="notification-list">
                                    {pendingPredictions.slice(0, 5).map((item) => (
                                        <Link
                                            key={item._id}
                                            to={`/predictions/${item._id}`}
                                            className="notification-item"
                                            onClick={() =>
                                                setNotificationsOpen(false)
                                            }
                                        >
                                            <div className="notification-item-icon">
                                                <FileText size={17} />
                                            </div>

                                            <div className="notification-item-content">
                                                <strong>
                                                    Prediction #{item._id.slice(-8)}
                                                </strong>

                                                <span>
                                                    {item.predictedClass}
                                                </span>

                                                <small>
                                                    <Clock size={12} />
                                                    {formatDate(item.createdAt)}
                                                </small>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {pendingPredictions.length > 5 && (
                                <Link
                                    to="/history"
                                    className="notification-footer"
                                    onClick={() =>
                                        setNotificationsOpen(false)
                                    }
                                >
                                    View all predictions
                                </Link>
                            )}

                        </div>
                    )}
                </div>

                <div className="topbar-user">
                    <div className="user-avatar">
                        {initials || <UserCircle size={22} />}
                    </div>

                    <div className="user-details">
                        <strong>{user?.name || "User"}</strong>
                        <span>{user?.role || "Doctor"}</span>
                    </div>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                    title="Logout"
                    type="button"
                >
                    <LogOut size={18} />
                </button>

            </div>

        </header>
    );
};

export default Topbar;
