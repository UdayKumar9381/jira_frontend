import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { Camera, Edit2, Save, X, Loader2, User, Shield, Briefcase } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user: currentUser, checkAuth } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
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

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.updateProfile({ password: passwordData.newPassword });
            await checkAuth();
            setSuccess('Password updated successfully');
            setIsChangingPassword(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update password');
        } finally {
            setLoading(false);
        }
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

                        {error && !isChangingPassword && <div className="profile-alert error">{error}</div>}
                        {success && !isChangingPassword && <div className="profile-alert success">{success}</div>}

                        <div className="profile-body" style={{ padding: 0, marginTop: 24 }}>
                            <div className="avatar-section" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div className="profile-avatar-container">
                                    <div className="profile-avatar-large" onClick={handleAvatarClick}>
                                        {currentUser.profile_pic ? (
                                            <img src={`/api${currentUser.profile_pic}`} alt={currentUser.username} className="avatar-img" />
                                        ) : (
                                            currentUser.username.charAt(0).toUpperCase()
                                        )}
                                        <div className="avatar-overlay">
                                            <Camera size={24} />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px', color: '#172b4d' }}>{currentUser.username}</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b778c' }}>{currentUser.role}</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="profile-edit-form">
                                    <div className="form-group">
                                        <label className="jira-label">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="jira-label">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                            <X size={16} /> Cancel
                                        </button>
                                        <button type="submit" className="save-btn" disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label className="jira-label">Full Name</label>
                                        <div className="info-value">{currentUser?.username}</div>
                                    </div>
                                    <div className="info-item">
                                        <label className="jira-label">Email Address</label>
                                        <div className="info-value">
                                            {currentUser?.email}
                                            <span className="verified-badge">Verified</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label className="jira-label">System Role</label>
                                        <div className="info-value">{currentUser?.role}</div>
                                    </div>
                                    <div className="info-item">
                                        <label className="jira-label">Member Since</label>
                                        <div className="info-value">
                                            {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="profile-card glass profile-danger-zone">
                    <div className="section-header">
                        <h3>Security</h3>
                        <p>Manage your password and authentication methods.</p>
                    </div>

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
                        <div className="danger-content" style={{ marginTop: 24 }}>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Password</h4>
                                <p style={{ fontSize: '13px', color: '#6b778c', marginTop: 4 }}>
                                    Last changed: {currentUser?.updated_at ? new Date(currentUser.updated_at).toLocaleDateString() : (currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A')}
                                </p>
                            </div>
                            <button className="edit-profile-btn" onClick={() => setIsChangingPassword(true)}>
                                Change Password
                            </button>
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
        </div>
    );
};

export default ProfilePage;
