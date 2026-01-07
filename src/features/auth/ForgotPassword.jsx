import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import kietLogo from '../../assets/kiet-logo.png';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setMessage('If an account exists for ' + email + ', you will receive a password reset link shortly.');
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container premium-bg">
            <div className="auth-glass-card">
                <div className="auth-header">
                    <img src={kietLogo} alt="KIET" className="auth-logo-premium" style={{ height: '48px', width: 'auto' }} />
                    <h1 className="auth-title">Can't log in?</h1>
                    <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {error && <div className="auth-error-toast">{error}</div>}
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

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading || !!message}
                    >
                        {loading ? 'Sending Link...' : 'Send Link'}
                    </button>
                </form>

                <div className="auth-footer-alternate" style={{ marginTop: '24px' }}>
                    <Link to="/login">Return to Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
