import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { storyService } from '../../services/storyService';
import { authService } from '../../services/authService';
import { teamService } from '../../services/teamService';
import { syncTeamMembership } from '../../utils/teamUtils';
import { useAuth } from '../../context/AuthContext';
import usePermissions from '../../hooks/usePermissions';
import PropTypes from 'prop-types';

const IssueDetailModal = ({ isOpen, onClose, issue, onIssueUpdated, onIssueDeleted }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const { canEditIssue, canDeleteIssue, canEditTeamField, isIssueReadOnly, isTeamLead: isRoleTeamLead } = usePermissions();

    // [NEW] Check if user is the lead of the currently selected team
    const selectedTeam = teams.find(t => t.id === (formData.team_id ? Number(formData.team_id) : (issue ? issue.team_id : null)));
    const isCurrentTeamLead = selectedTeam?.lead_id === user?.id;
    // Allow edit if standard permission OK OR if user is Team Lead of this team
    const isReadOnly = isIssueReadOnly(issue) && !isCurrentTeamLead;

    useEffect(() => {
        // Fetch users for assignee dropdown
        authService.getAllUsers()
            .then(setUsers)
            .catch(err => console.error('Failed to fetch users:', err));

        if (issue?.project_id) {
            teamService.getByProject(issue.project_id)
                .then(projectTeams => {
                    setTeams(projectTeams);
                    // If team_id is missing and user is Team Lead, pre-select if they lead only one team
                    if (!issue.team_id && isRoleTeamLead()) {
                        const ledTeams = projectTeams.filter(t => String(t.lead_id) === String(user?.id));
                        if (ledTeams.length === 1) {
                            setFormData(prev => ({ ...prev, team_id: ledTeams[0].id }));
                        }
                    }
                })
                .catch(err => console.error('Failed to fetch teams:', err));
        }
    }, [issue?.project_id, user?.id]);

    useEffect(() => {
        if (issue) {
            setFormData({
                title: issue.title,
                description: issue.description,
                assignee: issue.assignee,
                assignee_id: issue.assignee_id || '',
                reviewer: issue.reviewer || '',
                status: issue.status,
                priority: issue.priority || 'Medium',
                story_points: issue.story_points || '',
                start_date: issue.start_date || '',
                end_date: issue.end_date || '',
                release_number: issue.release_number || '',
                sprint_number: issue.sprint_number || '',
                team_id: issue.team_id || '',
            });
        }
    }, [issue]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssigneeChange = (e) => {
        const userId = e.target.value;
        const selectedUser = users.find(u => String(u.id) === userId);
        setFormData(prev => ({
            ...prev,
            assignee_id: userId || '',
            assignee: selectedUser ? selectedUser.username : ''
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Permission check
        const canEdit = canEditIssue(issue) || isCurrentTeamLead;
        if (!canEdit) {
            alert("You do not have permission to edit this issue.");
            return;
        }

        setIsLoading(true);
        try {
            // Merge existing issue data with form data
            const payload = {
                ...issue,
                ...formData
            };

            // Clean up payload
            if (!payload.reviewer || String(payload.reviewer).trim() === "") {
                payload.reviewer = null;
            }
            if (!payload.story_points || payload.story_points === "") {
                payload.story_points = null;
            }
            // Convert empty datetime strings to null
            if (!payload.start_date || payload.start_date === "") {
                payload.start_date = null;
            }
            if (!payload.end_date || payload.end_date === "") {
                payload.end_date = null;
            }

            console.log("Updating issue with payload:", payload);
            await storyService.update(issue.id, payload);

            // Sync team membership if assignee and team are selected
            if (payload.team_id && payload.assignee_id) {
                await syncTeamMembership(payload.team_id, payload.assignee_id);
            }

            onIssueUpdated();
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            const detail = err.response?.data?.detail;
            let errorMessage = 'Failed to update issue';

            if (detail) {
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map(d => `${d.loc ? d.loc.join('.') : 'Field'}: ${d.msg}`).join(', ');
                } else if (typeof detail === 'object') {
                    errorMessage = JSON.stringify(detail);
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!canDeleteIssue()) {
            alert("You do not have permission to delete this issue.");
            return;
        }

        if (!window.confirm('Are you sure you want to delete this issue?')) return;

        setIsLoading(true);
        try {
            await storyService.delete(issue.id);
            onIssueDeleted();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to delete issue');
            setIsLoading(false);
        }
    };

    if (!issue) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${issue.story_pointer} - Details`}>
            <form onSubmit={handleUpdate}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    {canDeleteIssue() && (
                        <Button type="button" variant="danger" onClick={handleDelete} disabled={isLoading}>
                            Delete Issue
                        </Button>
                    )}
                </div>

                <Input
                    label="Summary"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    required
                    disabled={isIssueReadOnly(issue)}
                />

                <div style={{ marginBottom: 12 }}>
                    <label className="jira-label" style={{ display: 'block', marginBottom: 4 }}>Description</label>
                    <textarea
                        className="jira-input"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        style={{ height: 100, width: '100%', resize: 'vertical' }}
                        required
                        disabled={isIssueReadOnly(issue)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div className="jira-input-group">
                        <label className="jira-label">Status</label>
                        <select
                            className="jira-input"
                            name="status"
                            value={formData.status || ''}
                            onChange={handleChange}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>

                    <div className="jira-input-group">
                        <label className="jira-label">Priority</label>
                        <select
                            className="jira-input"
                            name="priority"
                            value={formData.priority || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="jira-input-group">
                        <label className="jira-label">Assignee *</label>
                        <select
                            className="jira-input"
                            value={formData.assignee_id || ''}
                            onChange={handleAssigneeChange}
                            required
                            disabled={isReadOnly || user?.role === 'DEVELOPER'}
                            style={{ backgroundColor: (isReadOnly || user?.role === 'DEVELOPER') ? '#f4f5f7' : '#fff', color: (isReadOnly || user?.role === 'DEVELOPER') ? '#a5adba' : '#172b4d' }}
                        >
                            <option value="">Select assignee...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Reviewer"
                        name="reviewer"
                        value={formData.reviewer || ''}
                        onChange={handleChange}
                        disabled={isIssueReadOnly(issue)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 12 }}>
                    <Input
                        label="Story Points"
                        name="story_points"
                        type="number"
                        value={formData.story_points || ''}
                        onChange={handleChange}
                        disabled={isIssueReadOnly(issue)}
                    />
                    <div className="jira-input-group">
                        <label className="jira-label">Start Date</label>
                        <input
                            type="datetime-local"
                            className="jira-input"
                            name="start_date"
                            value={formData.start_date || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="jira-input-group">
                        <label className="jira-label">End Date</label>
                        <input
                            type="datetime-local"
                            className="jira-input"
                            name="end_date"
                            value={formData.end_date || ''}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                    <Input
                        label="Release / Fix Version"
                        name="release_number"
                        value={formData.release_number || ''}
                        onChange={handleChange}
                        placeholder="e.g. R-1.0"
                        disabled={isIssueReadOnly(issue)}
                    />
                    <div className="jira-input-group">
                        <label className="jira-label">Team</label>
                        <select
                            className="jira-input"
                            name="team_id"
                            value={formData.team_id || ''}
                            onChange={handleChange}
                            disabled={!canEditTeamField()}
                        >
                            <option value="">No Team</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {issue.support_doc && (
                    <div style={{ marginBottom: 12, marginTop: 16 }}>
                        <label className="jira-label">Attachment</label>
                        <div style={{ fontSize: 13 }}>
                            <a
                                href={`/api/uploads/${issue.support_doc}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#0052cc', textDecoration: 'underline' }}
                            >
                                {issue.support_doc}
                            </a>
                        </div>
                    </div>
                )}

                {error && <div style={{ color: '#de350b', marginBottom: 16, fontSize: '12px', marginTop: 16 }}>{error}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 24 }}>
                    <Button type="button" variant="subtle" onClick={onClose}>Cancel</Button>
                    {!isReadOnly && (
                        <Button type="submit" variant="primary" disabled={isLoading}>Save Changes</Button>
                    )}
                </div>
            </form>
        </Modal>
    );
};

IssueDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    issue: PropTypes.object,
    onIssueUpdated: PropTypes.func.isRequired,
    onIssueDeleted: PropTypes.func.isRequired,
};

export default IssueDetailModal;