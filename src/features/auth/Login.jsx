import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container premium-bg">
            <div className="auth-glass-card">
                <div className="auth-header">
                    <img src={kietLogo} alt="KIET" className="auth-logo-premium" style={{ height: '48px', width: 'auto' }} />
                    <h1 className="auth-title">KIET</h1>
                    <p className="auth-subtitle">Project Suite</p>
                </div>

                {message && <div className="auth-success-toast">{message}</div>}
                {error && <div className="auth-error-toast">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <div className="label-flex">
                            <label>Password</label>
                            <Link to="/forgot-password">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <div className="auth-footer-alternate">
                    Don't have an account? <Link to="/signup">Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
