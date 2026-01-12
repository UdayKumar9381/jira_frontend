import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import kietLogo from '../../assets/kiet-logo.png';
import { formatError } from '../../utils/renderUtils';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setMessage("If an account exists for " + email + ", you will receive a password reset link shortly.");
        } catch (err) {
            setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="jira-page-container">
            {/* Header / Background Strip */}
            <div className="jira-blue-header">
                <div className="jira-header-container">
                    <div className="jira-header-content">
                        <div className="jira-logo-area">
                            <img src={kietLogo} alt="KIET" className="jira-logo-img" />
                            <span className="jira-logo-text">KIET</span>
                        </div>
                        <div className="jira-sub-header">Project Suite</div>
                    </div>
                </div>
            </div>

            {error && <div className="jira-reset-error">{formatError(error)}</div>}
            {message && <div className="auth-success-toast">{message}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-input-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <h3 className="jira-marketing-title">Can't log in?</h3>

                <div className="jira-checklist">
                    <div className="jira-check-item">✓ Enter your email address</div>
                    <div className="jira-check-item">✓ Get a secure reset link</div>
                    <div className="jira-check-item">✓ Regain access to your work</div>
                </div>
            </form>

            {/* Right Side: Forgot Card */}
            <div className="jira-form-card">
                <h2 className="jira-card-header">Trouble Logging In?</h2>
                <p className="jira-card-sub-header">We'll send a recovery link to your email</p>

                {error && <div className="jira-auth-error-toast">{error}</div>}
                {message && <div className="jira-auth-success-toast">{message}</div>}

                <form onSubmit={handleSubmit} className="jira-form-stack">
                    <div className="jira-field-group">
                        <label className="jira-label">Email Address</label>
                        <input
                            type="email"
                            className="jira-input"
                            placeholder="e.g. name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="jira-submit-btn"
                        disabled={loading || !!message}
                    >
                        {loading ? "Sending Link..." : "Send Link"}
                    </button>
                </form>

                <div className="jira-login-link-container">
                    <span className="jira-link" onClick={() => navigate("/login")}>
                        Return to Log in
                    </span>
                </div>

                <div className="jira-no-credit-card">SECURE RECOVERY</div>
            </div>
        </div>
    );
}
