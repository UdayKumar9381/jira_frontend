import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import './JiraAuth.css';

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
            await signup(form.full_name, form.email.toLowerCase(), form.password, form.role);
            navigate("/login", { state: { message: "Signup successful! Please log in with your new account." } });
        } catch (err) {
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

                <div className="jira-form-card">
                    <h2 className="jira-card-header">Sign up</h2>
                    <p className="jira-card-sub-header">Create your KIET Project Suite account</p>

                    {passwordError && <div className="jira-auth-error-toast">{passwordError}</div>}

                    <form onSubmit={handleSubmit} className="jira-form-stack">
                        <div className="jira-field-group">
                            <label className="jira-label">Full Name</label>
                            <input
                                type="text"
                                className="jira-input"
                                placeholder="Enter your full name"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="jira-field-group">
                            <label className="jira-label">Work Email</label>
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

                        <div className="jira-field-group">
                            <label className="jira-label">Password</label>
                            <input
                                type="password"
                                className="jira-input"
                                placeholder="Create a password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            {form.password && (
                                <div className="jira-password-requirements">
                                    <div className="jira-password-requirements-header">Password Requirements</div>
                                    {rules.map((rule, index) => (
                                        <div key={index} className="jira-rule-item">
                                            <span className="jira-rule-check">
                                                {rule.valid ? '✓' : '✗'}
                                            </span>
                                            <span style={{ color: rule.valid ? '#00875a' : '#de350b' }}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="jira-field-group">
                            <label className="jira-label">Confirm Password</label>
                            <input
                                type="password"
                                className="jira-input"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={handleConfirmChange}
                                required
                            />
                        </div>

                        <button type="submit" className="jira-submit-btn" disabled={loading || !allRulesMet}>
                            {loading ? "Creating account..." : "Create account"}
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
