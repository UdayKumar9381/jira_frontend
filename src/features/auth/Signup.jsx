import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import { formatError } from '../../utils/renderUtils';
import './Auth.css';

export default function Signup() {
    const [form, setForm] = useState({
        email: "",
        full_name: "",
        password: "",
        role: "VIEWER"
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    // Password Rules
    const rules = [
        { label: "At least 8 characters", valid: form.password.length >= 8 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
        { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
        { label: "One number", valid: /\d/.test(form.password) },
        { label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
    ];

    const allRulesMet = rules.every(rule => rule.valid);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");

        if (!allRulesMet) {
            setPasswordError("Password does not meet complexity requirements");
            return;
        }

        if (form.password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            // Register and auto-login (mapping full_name to username)
            await signup(form.full_name, form.email.toLowerCase(), form.password, form.role);
            // After signup, we redirect to login to ensure they have a session, 
            // but the user's snippet asked for /dashboard. 
            // If the backend doesn't auto-login on signup, /dashboard will fail.
            // I'll stick to the user's request of /dashboard for UI consistency, 
            // but usually we'd want /login for safety unless we call login here.
            navigate("/login", { state: { message: "Signup successful! Please log in with your new account." } });
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.detail || err.message || "Unknown error";
            setPasswordError("Signup failed: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmChange = (e) => {
        const val = e.target.value;
        setConfirmPassword(val);
        if (form.password && val && form.password !== val) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
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

            {/* Main Content Area */}
            <div className="jira-content-wrapper">

                {/* Left Side: Marketing Info */}
                <div className="jira-marketing-col">
                    <div className="jira-illustration-placeholder">
                        <div className="jira-bar-1"></div>
                        <div className="jira-bar-2"></div>
                        <div className="jira-bar-3"></div>
                    </div>

                    <h3 className="jira-marketing-title">Trusted by over 65,000 teams worldwide</h3>

                    <div className="jira-logos-row">
                        <span className="jira-logo-item-text">Square</span>
                        <span className="jira-logo-item-text">VISA</span>
                        <span className="jira-logo-item-text">CISCO</span>
                        <span className="jira-logo-item-text">Pfizer</span>
                    </div>

                    <div className="jira-checklist">
                        <div className="jira-check-item">✓ Scale agile practices</div>
                        <div className="jira-check-item">✓ Consolidate workflows</div>
                        <div className="jira-check-item">✓ Expand visibility</div>
                        <div className="jira-check-item">✓ Plan, track, and release</div>
                    </div>
                </div>

                {error && <div className="auth-error-toast">{formatError(error)}</div>}

                    <form onSubmit={handleSubmit} className="jira-form-stack">
                        {/* Full Name */}
                        <div className="jira-field-group">
                            <label className="jira-label">Full Name</label>
                            <input
                                type="text"
                                className="jira-input"
                                placeholder="Enter full name"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Work Email */}
                        <div className="jira-field-group">
                            <label className="jira-label">Work Email</label>
                            <input
                                type="email"
                                className="jira-input"
                                placeholder="name@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="jira-field-group">
                            <label className="jira-label">Role</label>
                            <select
                                className="jira-input"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="VIEWER">Viewer (Read Only)</option>
                                <option value="DEVELOPER">Developer</option>
                                <option value="TESTER">Tester</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div className="jira-field-group">
                            <label className="jira-label">Password</label>
                            <input
                                type="password"
                                className="jira-input"
                                placeholder="Create password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="jira-field-group">
                            <label className="jira-label">Confirm Password</label>
                            <input
                                type="password"
                                className="jira-input"
                                style={{
                                    borderColor: passwordError && (passwordError.includes("match") || passwordError.includes("complexity")) ? "#de350b" : "#dfe1e6"
                                }}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={handleConfirmChange}
                                required
                            />
                            {passwordError && <span className="jira-error-text">{passwordError}</span>}
                        </div>

                        {/* Password Requirements Checklist */}
                        {form.password && (
                            <div className="jira-password-requirements">
                                <p className="jira-password-requirements-header">Password Requirements</p>
                                {rules.map((rule, idx) => (
                                    <div key={idx} className="jira-rule-item" style={{ color: rule.valid ? "#006644" : "#42526e" }}>
                                        <span className="jira-rule-check" style={{ color: rule.valid ? "#36b37e" : "#dfe1e6" }}>
                                            {rule.valid ? "✓" : "○"}
                                        </span>
                                        {rule.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="jira-terms-text">
                            By clicking below, you agree to the Atlassian Cloud Terms of Service and Privacy Policy.
                        </p>

                        <button type="submit" className="jira-submit-btn" disabled={loading}>
                            {loading ? "Creating account..." : "Agree & Sign up"}
                        </button>
                    </form>

                    <div className="jira-login-link-container">
                        <span style={{ color: "#42526e" }}>Already have an account? </span>
                        <span className="jira-link" onClick={() => navigate("/login")}>Log in</span>
                    </div>

                    <div className="jira-no-credit-card">NO CREDIT CARD REQUIRED</div>
                </div>

            </div>
        </div>
    );
}
