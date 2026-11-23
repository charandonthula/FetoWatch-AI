import { NavLink } from "react-router-dom";
import {
    Activity,
    LayoutDashboard,
    PlusCircle,
    History,
    Info
} from "lucide-react";

const Sidebar = () => {
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Activity size={24} />
                </div>

                <div>
                    <h2>FetoWatch <span>AI</span></h2>
                    <p>Monitoring workspace</p>
                </div>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-label">WORKSPACE</p>

                <nav className="sidebar-nav">

                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/predictions/new"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <PlusCircle size={19} />
                        <span>New Prediction</span>
                    </NavLink>

                    <NavLink
                        to="/history"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <History size={19} />
                        <span>Prediction History</span>
                    </NavLink>

                </nav>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-info">
                    <Info size={18} />
                    <div>
                        <strong>Educational Prototype</strong>
                        <p>Not for clinical diagnosis or patient care.</p>
                    </div>
                </div>

                <div className="sidebar-version">
                    FetoWatch AI · Version 1.0
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;