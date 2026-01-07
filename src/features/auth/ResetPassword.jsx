import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import './ResetPassword.css';

import resetIllustration from '../../assets/reset_illustration.png';
import jiraLogo from '../../assets/jira-logo.png';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (!token) {
            setError('Invalid or missing reset token.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validate()) return;

        setLoading(true);
        try {
            await authService.resetPassword(token, formData.newPassword);
            setMessage('Your password has been reset successfully. Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="jira-reset-container">
            <div className="jira-reset-card animate-slide-up">
                <div className="reset-illustration-side">
                    <img src={resetIllustration} alt="Reset Password" className="reset-illustration-img" />
                </div>
                <div className="reset-form-side">
                    <div className="jira-reset-header">
                        <img src={jiraLogo} alt="Jira" style={{ height: '32px', marginBottom: '16px' }} />
                        <h1>Reset Your Password</h1>
                    </div>

                    {error && <div className="jira-reset-error">{error}</div>}
                    {message && <div className="jira-reset-success">{message}</div>}

                    <form onSubmit={handleSubmit} className="jira-reset-form">
                        <div className="jira-reset-field">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="jira-reset-input"
                                placeholder="Min 8 characters"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="jira-reset-field">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="jira-reset-input"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="jira-reset-button"
                            disabled={loading || !!message}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="jira-reset-footer">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
