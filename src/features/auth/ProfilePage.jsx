import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Camera, Edit2, Save, X, Loader2, User } from 'lucide-react';
import { formatError } from '../../utils/renderUtils';
import ModeSwitchRequestModal from './ModeSwitchRequestModal';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, checkAuth, switchMode } = useAuth();
    const currentUser = user; // ✅ FIX: alias to avoid undefined error
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [switchingMode, setSwitchingMode] = useState(false);
    const [formData, setFormData] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || '',
    });
    const [infoMessage, setInfoMessage] = useState('');

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isVerified: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    // ... (useEffect remains same) ...

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleVerifyPassword = async () => {
        if (!passwordData.currentPassword) return;
        setLoading(true);
        setError('');
        try {
            await authService.verifyPassword(passwordData.currentPassword);
            setPasswordData(prev => ({ ...prev, isVerified: true }));
        } catch (err) {
            setError('Current password incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError('');
        try {
            await authService.uploadAvatar(file);
            await checkAuth(); // Refresh user data to get new avatar URL
            setSuccess('Profile picture updated successfully');
        } catch (err) {
            setError('Failed to upload profile picture');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setInfoMessage('');

        try {
            const updateData = {};
            if (formData.username !== currentUser.username) updateData.username = formData.username;

            // Password update logic
            if (isChangingPassword) {
                if (!passwordData.isVerified) {
                    setError('Please verify your current password first');
                    setLoading(false);
                    return;
                }
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    setError('New passwords do not match');
                    setLoading(false);
                    return;
                }
                if (passwordData.newPassword.length < 6) {
                    setError('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }
                updateData.password = passwordData.newPassword;
                updateData.current_password = passwordData.currentPassword;
            }

            console.log('Update Data:', updateData);
            if (Object.keys(updateData).length > 0) {
                await authService.updateProfile(updateData);
                await checkAuth();
                setSuccess('Profile updated successfully');
                setIsEditing(false);
                setIsChangingPassword(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', isVerified: false });
            } else {
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Profile update error:", err);
            const detail = err.response?.data?.detail;
            if (typeof detail === 'object') {
                setError(JSON.stringify(detail));
            } else {
                setError(detail || 'Failed to update profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const [showRequestModal, setShowRequestModal] = useState(null);

    const handleSwitchMode = (mode) => {
        if (user.view_mode === mode) return;
        setShowRequestModal(mode);
    };

    const onRequestSuccess = () => {
        setShowRequestModal(null);
        setSuccess('Your request has been sent to the Master Admin for approval.');
        setTimeout(() => setSuccess(''), 5000);
    };

    return (
        <div className="profile-page animate-fade-in">
            <header className="profile-header glass">
                <div className="header-title-group">
                    <div className="title-icon-container">
                        <User size={24} />
                    </div>
                    <div>
                        <h1>User Profile</h1>
                        <span className="subtitle">Manage your personal profile and security</span>
                    </div>
                </div>
            </header>

            <div className="profile-container">
                {/* Profile Information */}
                {/* Profile Information */}
                <div className={`profile-card ${isEditing ? 'glass' : 'transparent'}`} style={!isEditing ? { background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 } : {}}>
                    {isEditing && (
                        <div className="profile-section">
                            <div className="section-header">
                                <div>
                                    <h3>Edit Profile</h3>
                                    <p>Update your personal details and settings.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="profile-edit-form">
                            <div className="profile-edit-avatar-section">
                                <div className="profile-avatar-large editable" onClick={handleAvatarClick}>
                                    {user.profile_pic ? (
                                        <img src={`/api${user.profile_pic}`} alt="" className="avatar-img-large" />
                                    ) : (
                                        <div className="avatar-placeholder-large">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="avatar-overlay">
                                        <Camera size={24} />
                                        <span>Change</span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                                <p className="avatar-help-text">Click to upload a new profile picture</p>
                            </div>

                            <div className="form-group">
                                <label className="jira-label">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="jira-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="jira-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="jira-input disabled"
                                    title="Email cannot be changed"
                                />
                            </div>

                            <div className="password-change-section" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #dfe1e6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                    <input
                                        type="checkbox"
                                        id="changePassword"
                                        checked={isChangingPassword}
                                        onChange={(e) => {
                                            setIsChangingPassword(e.target.checked);
                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            setInfoMessage('');
                                        }}
                                        style={{ marginRight: 8 }}
                                    />
                                    <label htmlFor="changePassword" style={{ fontWeight: 500, cursor: 'pointer' }}>Change Password</label>
                                </div>

                                {isChangingPassword && (
                                    <div className="password-fields animate-fade-in">
                                        {!passwordData.isVerified ? (
                                            <div className="form-group">
                                                <label className="jira-label">Current Password</label>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <input
                                                        type="password"
                                                        name="currentPassword"
                                                        value={passwordData.currentPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Enter current password"
                                                        className="jira-input"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="jira-btn-secondary"
                                                        onClick={handleVerifyPassword}
                                                        disabled={!passwordData.currentPassword || loading}
                                                    >
                                                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="profile-alert success" style={{ marginBottom: 16 }}>
                                                    Password verified successfully. You can now set a new password.
                                                </div>
                                                <div className="form-group">
                                                    <label className="jira-label">New Password</label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Enter new password"
                                                        className="jira-input"
                                                    />
                                                    <p className="password-requirements-text" style={{ fontSize: '12px', color: '#6b778c', marginTop: '4px' }}>
                                                        Password must be at least 8 characters long and contain at least one uppercase letter (A-Z) and one special character.
                                                    </p>
                                                </div>
                                                <div className="form-group">
                                                    <label className="jira-label">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={passwordData.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Confirm new password"
                                                        className="jira-input"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {infoMessage && <div className="profile-alert info">{infoMessage}</div>}

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setIsEditing(false);
                                    setIsChangingPassword(false);
                                    setInfoMessage('');
                                }}>
                                    <X size={16} /> Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={loading || (isChangingPassword && !passwordData.isVerified)}>
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* Card 1: Identity & Edit Button */}
                            <div className="profile-card glass">
                                <div className="profile-section">
                                    <div className="profile-title-area">
                                        <div className="profile-name-row">
                                            <div
                                                className="profile-avatar-large"
                                                onClick={() => setIsEditing(true)}
                                                style={{ cursor: 'pointer', position: 'relative' }}
                                                title="Click to edit profile"
                                            >
                                                {user.profile_pic ? (
                                                    <img src={`/api${user.profile_pic}`} alt="" className="avatar-img-large" />
                                                ) : (
                                                    <div className="avatar-placeholder-large">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="avatar-edit-badge" style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    background: '#0052cc',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    border: '3px solid white',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    zIndex: 10
                                                }}>
                                                    <Edit2 size={16} />
                                                </div>
                                            </div>
                                            <div className="name-with-banner">
                                                <h1>{user.username}</h1>
                                                {user.is_master_admin && (
                                                    <span className="master-admin-badge" title="Full System Access">
                                                        🛡️ Master Administrator
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {user.is_master_admin && (
                                        <div className="master-admin-banner">
                                            <div className="banner-icon">🛡️</div>
                                            <div className="banner-content">
                                                <h3>Master Administrator</h3>
                                                <p>You have full access to all projects and users in the system.</p>
                                            </div>
                                        </div>
                                    )}

                                    {error && <div className="profile-alert error" style={{ marginTop: 16 }}>{formatError(error)}</div>}
                                    {success && <div className="profile-alert success" style={{ marginTop: 16 }}>{success}</div>}
                                </div>
                            </div>



                            {/* Card 2: Account Information */}
                            <div className="profile-card glass">
                                <section className="profile-section">
                                    <h3>Account Information</h3>
                                    <div className="account-info-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'min-content 1fr', alignItems: 'center' }}>

                                        <div className="info-label" style={{ fontWeight: 600, color: '#6b778c', whiteSpace: 'nowrap', paddingRight: '24px' }}>User ID</div>
                                        <div className="info-value-box" style={{ background: '#ebecf0', padding: '10px 12px', borderRadius: '4px', color: '#172b4d', fontSize: '14px' }}>
                                            {user.id}
                                        </div>

                                        <div className="info-label" style={{ fontWeight: 600, color: '#6b778c', whiteSpace: 'nowrap', paddingRight: '24px' }}>Username</div>
                                        <div className="info-value-box" style={{ background: '#ebecf0', padding: '10px 12px', borderRadius: '4px', color: '#172b4d', fontSize: '14px' }}>
                                            {user.username}
                                        </div>

                                        <div className="info-label" style={{ fontWeight: 600, color: '#6b778c', whiteSpace: 'nowrap', paddingRight: '24px' }}>Email</div>
                                        <div className="info-value-box" style={{ background: '#ebecf0', padding: '10px 12px', borderRadius: '4px', color: '#172b4d', fontSize: '14px' }}>
                                            {user.email}
                                        </div>

                                        <div className="info-label" style={{ fontWeight: 600, color: '#6b778c', whiteSpace: 'nowrap', paddingRight: '24px' }}>Joined</div>
                                        <div className="info-value-box" style={{ background: '#ebecf0', padding: '10px 12px', borderRadius: '4px', color: '#172b4d', fontSize: '14px' }}>
                                            {new Date(user.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>

                                    </div>
                                </section>
                            </div>

                            {/* Card 3: View Mode (Moved below Account Info) */}
                            {!user.is_master_admin && (
                                <div className="profile-card glass">
                                    <section className="profile-section mode-switch-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                                        <h3>View Mode</h3>
                                        <p className="mode-description">
                                            Switch between roles to manage your own projects or view assigned tasks.
                                        </p>
                                        <div className="mode-toggle-group">
                                            <button
                                                className={`mode-btn ${user.view_mode === 'DEVELOPER' ? 'active' : ''}`}
                                                onClick={() => handleSwitchMode('DEVELOPER')}
                                                disabled={switchingMode}
                                            >
                                                <div className="mode-btn-content">
                                                    <span className="mode-icon">👨‍💻</span>
                                                    <div className="mode-text">
                                                        <span className="mode-label">Developer Mode</span>
                                                        <span className="mode-sublabel">See projects where you're assigned</span>
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                className={`mode-btn ${user.view_mode === 'ADMIN' ? 'active' : ''}`}
                                                onClick={() => handleSwitchMode('ADMIN')}
                                                disabled={switchingMode}
                                            >
                                                <div className="mode-btn-content">
                                                    <span className="mode-icon">🏗️</span>
                                                    <div className="mode-text">
                                                        <span className="mode-label">Admin Mode</span>
                                                        <span className="mode-sublabel">See projects you own/created</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {
                showRequestModal && (
                    <ModeSwitchRequestModal
                        requestedMode={showRequestModal}
                        onClose={() => setShowRequestModal(null)}
                        onSuccess={onRequestSuccess}
                    />
                )
            }
        </div >
    );
};

export default ProfilePage;
