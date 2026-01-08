import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, MessageSquare } from 'lucide-react';
import { modeSwitchService } from '../../services/api';
import './ModeSwitchResponses.css';

const ModeSwitchResponses = ({ onActionSuccess }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await modeSwitchService.getPendingRequests();
            setRequests(data);
        } catch (err) {
            setError('Failed to load switch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            if (action === 'APPROVE') {
                await modeSwitchService.approveRequest(id);
            } else {
                await modeSwitchService.rejectRequest(id);
            }
            setRequests(requests.filter(r => r.id !== id));
            if (onActionSuccess) onActionSuccess();
        } catch (err) {
            alert('Failed to process request');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="responses-loading">Loading requests...</div>;

    return (
        <div className="mode-switch-responses">
            {error && <div className="responses-error">{error}</div>}

            {requests.length === 0 ? (
                <div className="no-requests">
                    <MessageSquare size={48} color="#dfe1e6" />
                    <p>No pending mode switch requests</p>
                </div>
            ) : (
                <div className="responses-table-container">
                    <table className="responses-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Requested</th>
                                <th>Reason / Comment</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request.id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <span className="user-name">{request.username}</span>
                                            <span className="user-email">{request.email}</span>
                                            <span className="user-role-xs">{request.role}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`mode-badge ${request.requested_mode.toLowerCase()}`}>
                                            TO {request.requested_mode}
                                        </span>
                                    </td>
                                    <td className="reason-cell">
                                        <p title={request.reason}>{request.reason}</p>
                                    </td>
                                    <td className="date-cell">
                                        {new Date(request.created_at).toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="btn-approve"
                                                onClick={() => handleAction(request.id, 'APPROVE')}
                                                disabled={actionLoading === request.id}
                                            >
                                                {actionLoading === request.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                                Approve
                                            </button>
                                            <button
                                                className="btn-reject"
                                                onClick={() => handleAction(request.id, 'REJECT')}
                                                disabled={actionLoading === request.id}
                                            >
                                                {actionLoading === request.id ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ModeSwitchResponses;
