import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './ChangeRoleModal.css';

const ChangeRoleModal = ({ user, onClose, onUpdate }) => {
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onUpdate(user.id, selectedRole);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update user role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Update User Role</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" value={user.username} disabled />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={user.email} disabled />
                        </div>

                        <div className="form-group">
                            <label>Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="role-select"
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="DEVELOPER">Developer</option>
                                <option value="TESTER">Tester</option>
                            </select>
                        </div>

                        {selectedRole === 'ADMIN' && (
                            <div className="admin-warning">
                                <AlertTriangle size={16} />
                                <span>Admins have full system access.</span>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangeRoleModal;
