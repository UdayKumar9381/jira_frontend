import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { Camera, Edit2, Save, X, Loader2 } from 'lucide-react';
import { formatError } from '../../utils/renderUtils';
import ModeSwitchRequestModal from './ModeSwitchRequestModal';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, checkAuth, switchMode } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [switchingMode, setSwitchingMode] = useState(false);
    const [formData, setFormData] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await authService.getMyProjects();
                setProjects(data);
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setProjectsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (!currentUser) return <div style={{ padding: '40px' }}>Loading profile...</div>;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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

        try {
            const updateData = {};
            if (formData.username !== currentUser.username) updateData.username = formData.username;
            if (formData.email !== currentUser.email) updateData.email = formData.email;

            if (Object.keys(updateData).length > 0) {
                await authService.updateProfile(updateData);
                await checkAuth();
                setSuccess('Profile updated successfully');
                setIsEditing(false);
            } else {
                setIsEditing(false);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile');
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
                        <h1>Account Settings</h1>
                        <span className="subtitle">Manage your personal profile and security</span>
                    </div>
                </div>
            </header>

            <div className="profile-container">
                {/* Profile Information */}
                <div className="profile-card glass">
                    <div className="profile-section">
                        <div className="section-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3>Profile Information</h3>
                                    <p>Your basic account details and role.</p>
                                </div>
                                {!isEditing && (
                                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                    <div className="profile-title-area">
                        <div className="profile-name-row">
                            <div className="name-with-banner">
                                <h1>{user.username}</h1>
                                {user.is_master_admin && (
                                    <span className="master-admin-badge" title="Full System Access">
                                        🛡️ Master Administrator
                                    </span>
                                )}
                            </div>
                            {!isEditing && (
                                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} /> Edit Profile
                                </button>
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

                {error && <div className="profile-alert error">{formatError(error)}</div>}
                {success && <div className="profile-alert success">{success}</div>}

                    {error && isChangingPassword && <div className="profile-alert error" style={{ marginTop: 16 }}>{error}</div>}
                    {success && isChangingPassword && <div className="profile-alert success" style={{ marginTop: 16 }}>{success}</div>}

                    {isChangingPassword ? (
                        <form onSubmit={handleUpdatePassword} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '400px' }}>
                            <div className="form-group">
                                <label className="jira-label">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="jira-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsChangingPassword(false)}>
                                    <X size={16} /> Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">
                            {!user.is_master_admin && (
                                <section className="profile-section mode-switch-section">
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
                            )}

                            <section className="profile-section">
                                <h3>Account Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>User ID</label>
                                        <p>{user.id}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Username</label>
                                        <p>{user.username}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Joined</label>
                                        <p>{new Date(user.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Worked On / Projects */}
                <div className="profile-card glass">
                    <div className="section-header">
                        <h3>Worked On</h3>
                        <p>Projects you are currently contributing to.</p>
                    </div>
                    <div className="table-container" style={{ marginTop: 24 }}>
                        <table className="jira-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Key</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectsLoading ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: '#6b778c' }}>
                                            Loading projects...
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {projects.map((p) => (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: 500 }}>{p.name}</td>
                                                <td style={{ color: '#6b778c' }}>{p.project_prefix}</td>
                                                <td>
                                                    <span className={`role-badge ${p.role || 'MEMBER'}`}>
                                                        {p.role || 'MEMBER'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {projects.length === 0 && (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', color: '#6b778c' }}>
                                                    No projects found.
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showRequestModal && (
                <ModeSwitchRequestModal
                    requestedMode={showRequestModal}
                    onClose={() => setShowRequestModal(null)}
                    onSuccess={onRequestSuccess}
                />
            )}
        </div>
    );
};

export default ProfilePage;
