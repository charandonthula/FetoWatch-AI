import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, User, Mail, LockKeyhole, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create your account."
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
                    <p className="eyebrow">GET STARTED</p>
                    <h1>Create your account</h1>
                    <p>
                        Set up your FetoWatch AI workspace.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">

                    <label>Full name</label>
                    <div className="input-wrapper">
                        <User size={18} />
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <label>Confirm password</label>
                    <div className="input-wrapper">
                        <LockKeyhole size={18} />
                        <input
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?
                    {" "}
                    <Link to="/">Sign in</Link>
                </p>

                <p className="auth-disclaimer">
                    FetoWatch AI is an educational machine-learning prototype.
                    It is not intended for clinical diagnosis or patient care.
                </p>

            </div>
        </div>
    );
};

export default Register;