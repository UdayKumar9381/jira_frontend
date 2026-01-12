import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import './JiraAuth.css';

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await login(form.email.toLowerCase(), form.password);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="jira-page-container">
            <div className="jira-blue-header">
                <div className="jira-header-container">
                    <div className="jira-header-content">
                        <div className="jira-logo-area">
                            <img src={kietLogo} alt="KIET" className="jira-logo-img" />
                            <span className="jira-logo-text">KIET</span>
                        </div>
                        <div className="jira-sub-header">Jira</div>
                    </div>
                </div>
            </div>

            <div className="jira-content-wrapper">
                <div className="jira-marketing-col">
                    <div className="jira-illustration-placeholder">
                        <div className="jira-bar-1"></div>
                        <div className="jira-bar-2"></div>
                        <div className="jira-bar-3"></div>
                    </div>

                    <h3 className="jira-marketing-title">Welcome back to your team</h3>

                    <div className="jira-checklist">
                        <div className="jira-check-item">✓ Continue where you left off</div>
                        <div className="jira-check-item">✓ Check your latest tasks</div>
                        <div className="jira-check-item">✓ Collaborate in real-time</div>
                    </div>
                </div>

                <div className="jira-form-card">
                    <h2 className="jira-card-header">Log in</h2>
                    <p className="jira-card-sub-header">Continue to KIET Jira</p>

                    {message && <div className="jira-auth-success-toast">{message}</div>}
                    {error && <div className="jira-auth-error-toast">{error}</div>}

                    <form onSubmit={handleSubmit} className="jira-form-stack">
                        <div className="jira-field-group">
                            <label className="jira-label">Email</label>
                            <input
                                type="email"
                                className="jira-input"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="jira-field-group">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label className="jira-label">Password</label>
                                <span
                                    className="jira-link"
                                    style={{ fontSize: "12px" }}
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Forgot Password?
                                </span>
                            </div>
                            <input
                                type="password"
                                className="jira-input"
                                placeholder="Enter password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="jira-submit-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="jira-login-link-container">
                        <span style={{ color: "#42526e" }}>Don't have an account? </span>
                        <span className="jira-link" onClick={() => navigate("/signup")}>Sign up</span>
                    </div>

                    <div className="jira-no-credit-card">SECURE LOGIN</div>
                </div>
            </div>
        </div>
    );
}
