import React, { useState } from 'react';
import { X, Users, Shield, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { teamService } from '../../services/api';

const CreateTeamModal = ({ projectId, onClose, onSuccess, users }) => {
    const [formData, setFormData] = useState({
        name: '',
        lead_id: '',
        member_ids: [],
        project_id: projectId
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const dataToSubmit = {
                name: formData.name,
                project_id: Number(projectId),
                lead_id: formData.lead_id ? Number(formData.lead_id) : null,
                member_ids: formData.member_ids.map(id => Number(id))
            };

            console.log("Submitting Team Data:", dataToSubmit);
            await teamService.create(dataToSubmit);

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1800);
        } catch (err) {
            console.error("Failed to create team", err);
            const detail = err.response?.data?.detail;
            let errorMessage = "Failed to create team. Please try again.";

            if (detail) {
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map(d => `${d.loc ? d.loc.join('.') : 'Error'}: ${d.msg}`).join(', ');
                } else if (typeof detail === 'object') {
                    errorMessage = JSON.stringify(detail);
                }
            }
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const toggleMember = (userId) => {
        setFormData(prev => {
            const member_ids = prev.member_ids.includes(userId)
                ? prev.member_ids.filter(id => id !== userId)
                : [...prev.member_ids, userId];
            return { ...prev, member_ids };
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass animate-slide-up" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <div className="header-title-group">
                        <Users className="title-icon" size={20} />
                        <h3>Create New Team</h3>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {success ? (
                            <div className="success-banner animate-fade-in" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px 20px',
                                textAlign: 'center'
                            }}>
                                <CheckCircle size={60} color="#36b37e" className="animate-bounce" />
                                <h3 style={{ marginTop: '20px', color: '#172b4d' }}>Team Created Successfully!</h3>
                                <p style={{ color: '#5e6c84' }}>Refreshing your team list...</p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="error-banner">
                                        <AlertTriangle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="jira-label">Team Name</label>
                                    <input
                                        className="jira-input-premium"
                                        type="text"
                                        placeholder="e.g. Frontend Squad"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="jira-label">Team Leader</label>
                                    <select
                                        className="jira-input-premium"
                                        value={formData.lead_id}
                                        onChange={e => setFormData({ ...formData, lead_id: e.target.value })}
                                    >
                                        <option value="">Select a leader</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.username} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="field-hint">The person responsible for team decisions</p>
                                </div>

                                <div className="form-group">
                                    <label className="jira-label">Members (Select multiple)</label>
                                    <div className="members-select-grid">
                                        {users.map(user => (
                                            <div
                                                key={user.id}
                                                className={`member-select-item ${formData.member_ids.includes(user.id) ? 'selected' : ''}`}
                                                onClick={() => toggleMember(user.id)}
                                            >
                                                <div className="member-avatar-mini">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.username}</span>
                                                {formData.member_ids.includes(user.id) && <CheckCircle size={14} className="check-icon" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {!success && (
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-save btn-primary" disabled={saving}>
                                {saving ? 'Creating...' : 'Create Team'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateTeamModal;
