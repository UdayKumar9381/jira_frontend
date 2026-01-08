import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { modeSwitchService } from '../../services/api';
import { formatError } from '../../utils/renderUtils';
import './ModeSwitchRequestModal.css';

const ModeSwitchRequestModal = ({ requestedMode, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for the switch.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await modeSwitchService.requestSwitch(requestedMode, reason);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit request. You might already have a pending request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container mode-request-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Switch to {requestedMode} Mode</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p className="request-p">
                            Switching to <strong>{requestedMode}</strong> mode requires approval from the Master Admin.
                            Please explain why you need to switch modules.
                        </p>

                        <div className="form-group">
                            <label>Reason for switching *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. I need to create a new project for the Mobile team."
                                rows={4}
                                required
                            />
                        </div>

                        {error && <div className="error-message">{formatError(error)}</div>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModeSwitchRequestModal;
