import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MEMBER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            return setError('Password must be at least 8 chars, with 1 uppercase, 1 lowercase, 1 number, and 1 special char.');
        }

        setLoading(true);
        try {
            await signup(formData.username, formData.email, formData.password, formData.role);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to signup. Please check password requirements.');
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
                    <p className="auth-subtitle">Create your account</p>
                </div>

                {error && <div className="auth-error-toast">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form scrollable-form">
                    <div className="auth-input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
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
                        <label>Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="auth-select-premium"
                            required
                        >
                            <option value="DEVELOPER">Developer (Work on assigned tasks)</option>
                            <option value="TESTER">Tester (Validate tasks and create bugs)</option>

                            <option value="MEMBER">Member (Standard access)</option>
                        </select>
                    </div>
                    <div className="auth-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <p className="field-hint">Min 8 chars, 1 uppercase, 1 special, 1 number</p>
                    </div>
                    <div className="auth-input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <div className="auth-footer-alternate">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
