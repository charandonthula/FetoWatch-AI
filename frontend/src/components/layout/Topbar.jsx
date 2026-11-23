import { Bell, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
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

                <button
                    className="icon-button"
                    title="Notifications"
                    type="button"
                >
                    <Bell size={19} />
                </button>

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