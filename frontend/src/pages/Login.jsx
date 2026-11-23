import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="brand-icon">
                        <Activity size={25} />
                    </div>
                    <span>FetoWatch <strong>AI</strong></span>
                </div>

                <div className="auth-heading">
                    <p className="eyebrow">WELCOME BACK</p>
                    <h1>Sign in to your account</h1>
                    <p>
                        Access your fetal monitoring analysis workspace.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">

                    <label>Email address</label>
                    <div className="input-wrapper">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="doctor@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <label>Password</label>
                    <div className="input-wrapper">
                        <LockKeyhole size={18} />
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account?
                    {" "}
                    <Link to="/register">Create account</Link>
                </p>

                <p className="auth-disclaimer">
                    FetoWatch AI is an educational machine-learning prototype.
                    It is not intended for clinical diagnosis or patient care.
                </p>

            </div>
        </div>
    );
};

export default Login;