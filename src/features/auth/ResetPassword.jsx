import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { formatError } from '../../utils/renderUtils';
import './ResetPassword.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        if (!token) {
            setError("Invalid or missing reset token.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!validate()) return;

        setLoading(true);
        try {
            await authService.resetPassword(token, formData.newPassword);
            setMessage("Your password has been reset successfully. Redirecting to login...");
            setTimeout(() => {
                navigate("/login", { state: { message: "Password reset successful! Please log in with your new password." } });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to reset password. The link may have expired.");
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

            <div className="jira-content-wrapper">
                {/* Left Side: Marketing Info */}
                <div className="jira-marketing-col">
                    <div className="jira-illustration-placeholder">
                        <div className="jira-bar-1"></div>
                        <div className="jira-bar-2"></div>
                        <div className="jira-bar-3"></div>
                    </div>

                    {error && <div className="jira-reset-error">{formatError(error)}</div>}
                    {message && <div className="jira-reset-success">{message}</div>}

                    <div className="jira-checklist">
                        <div className="jira-check-item">✓ Choose a strong password</div>
                        <div className="jira-check-item">✓ Keep your credentials safe</div>
                        <div className="jira-check-item">✓ Access your projects instantly</div>
                    </div>
                </div>

                {/* Right Side: Reset Card */}
                <div className="jira-form-card">
                    <h2 className="jira-card-header">Reset Password</h2>
                    <p className="jira-card-sub-header">Create a new password for your account</p>

                    {error && <div className="jira-auth-error-toast">{error}</div>}
                    {message && <div className="jira-auth-success-toast">{message}</div>}

                    <form onSubmit={handleSubmit} className="jira-form-stack">
                        <div className="jira-field-group">
                            <label className="jira-label">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="jira-input"
                                placeholder="Min 8 characters"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="jira-field-group">
                            <label className="jira-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="jira-input"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="jira-submit-btn"
                            disabled={loading || !!message}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    <div className="jira-login-link-container">
                        <span className="jira-link" onClick={() => navigate("/login")}>Back to Login</span>
                    </div>

                    <div className="jira-no-credit-card">SECURE RESET</div>
                </div>
            </div>
        </div>
    );
}
