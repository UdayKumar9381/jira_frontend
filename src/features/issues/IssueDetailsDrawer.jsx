import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckSquare, Bookmark, AlertCircle, ChevronUp, ChevronDown, Minus, Clock, User, Calendar as CalendarIcon, Info } from 'lucide-react';
import { storyService, teamService } from '../../services/api';
import { syncTeamMembership } from '../../utils/teamUtils';
import usePermissions from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './IssueDetailsDrawer.css';

const IssueDetailsDrawer = ({ issue, onClose, onUpdate, onDelete }) => {
    // Local state for form fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        story_points: '',
        assignee: '',
        reviewer: '',
        start_date: '',
        end_date: '',
        team_id: ''
    });
    const { user } = useAuth();
    const { canUpdateStatus, canEditIssue, canDeleteIssue, canEditTeamField, isIssueReadOnly } = usePermissions();
    const [teams, setTeams] = useState([]);

    // [NEW] Check if user is a Team Lead for this issue's team
    const selectedTeam = teams.find(t => t.id === (formData.team_id ? Number(formData.team_id) : (issue ? issue.team_id : null)));
    const isTeamLead = selectedTeam?.lead_id === user?.id; // Assumes user.id and team.lead_id are comparable
    // Allow edit if standard permission OK OR if user is Team Lead
    const isReadOnly = isIssueReadOnly(issue) && !isTeamLead;

    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (issue) {
            setFormData({
                title: issue.title || '',
                description: issue.description || '',
                status: issue.status || 'To Do',
                priority: issue.priority || 'Medium',
                story_points: issue.story_points || '',
                assignee: issue.assignee || '',
                reviewer: issue.reviewer || '',
                start_date: issue.start_date || '',
                end_date: issue.end_date || '',
                team_id: issue.team_id || ''
            });
            setIsDirty(false);

            if (issue.project_id) {
                teamService.getByProject(issue.project_id)
                    .then(setTeams)
                    .catch(err => console.error("Failed to fetch teams", err));
            }
        }
    }, [issue]);

    if (!issue) return <div className="issue-panel-container" style={{ justifyContent: 'center', alignItems: 'center', color: '#5e6c84' }}>Select an issue to view details</div>;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Merge original issue with form data, excluding complex objects like 'project' if needed,
            // but FormData in api.js will stringify them. 
            // Better to only send scalar fields from issue that might be missing in formData.
            // Actually, for FormData, we should probably construct a clean object.
            // But let's rely on backend ignoring extra fields or handling them.
            // Important: We must send 'project_id' if PUT requires it. 
            // The issue object likely has it.

            // Construct payload manually to be safe about what we send
            const payload = {
                ...issue,
                ...formData
            };

            // Remove 'project' object to avoid string "[object Object]" in FormData being sent as value
            if (payload.project && typeof payload.project === 'object') {
                delete payload.project;
            }

            const updatedIssue = await storyService.update(issue.id, payload);

            // Sync team membership if assignee and team are selected
            // Note: IssueDetailsDrawer might need to resolve assignee_id if it's not in formData
            const assigneeId = formData.assignee_id || updatedIssue.assignee_id || issue.assignee_id;
            const teamId = formData.team_id || updatedIssue.team_id || issue.team_id;

            if (teamId && assigneeId) {
                await syncTeamMembership(teamId, assigneeId);
            }

            onUpdate(updatedIssue);
            setIsDirty(false);
        } catch (error) {
            console.error("Failed to update issue", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            setIsLoading(true);
            try {
                await storyService.delete(issue.id);
                onDelete(issue.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete issue", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getIcon = (type) => {
        switch (type?.toUpperCase()) {
            case 'BUG': return <AlertCircle size={16} color="#e5493a" />;
            case 'STORY': return <Bookmark size={16} color="#63ba3c" fill="#63ba3c" />;
            case 'TASK': return <CheckSquare size={16} color="#4bade8" fill="#4bade8" />;
            default: return <CheckSquare size={16} color="#4bade8" />;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL': return <ChevronUp size={16} color="#ff5630" strokeWidth={3} />;
            case 'MEDIUM': return <Minus size={16} color="#ffab00" strokeWidth={3} />;
            case 'LOW': return <ChevronDown size={16} color="#0065ff" strokeWidth={3} />;
            default: return null;
        }
    };

    return (
        <div className="issue-panel-container">
            <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5e6c84', fontSize: '13px' }}>
                    {getIcon(issue.issue_type)}
                    <span>{issue.story_pointer || `ID-${issue.id}`}</span>
                </div>
                <div className="drawer-header-actions">
                    {canDeleteIssue() && (
                        <Button variant="subtle" onClick={handleDelete} title="Delete">
                            <Trash2 size={18} />
                        </Button>
                    )}
                    <Button variant="subtle" onClick={onClose} title="Close">
                        <X size={24} />
                    </Button>
                </div>
            </div>

            <div className="drawer-body">
                <main className="drawer-main-content">
                    <div className="drawer-title-section">
                        <textarea
                            className="drawer-title-textarea"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="What needs to be done?"
                            rows={1}
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className="drawer-section">
                        <h3 className="section-title">Description</h3>
                        <textarea
                            className="drawer-description-textarea"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Add a more detailed description..."
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className="drawer-meta-bottom">
                        <div className="timestamp-info">
                            <Clock size={12} />
                            <span>Created {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'recently'}</span>
                        </div>
                        <div className="timestamp-info">
                            <Info size={12} />
                            <span>Updated {issue.updated_at ? new Date(issue.updated_at).toLocaleDateString() : 'recently'}</span>
                        </div>
                    </div>
                </main>

                <aside className="drawer-sidebar">
                    <div className="sidebar-group">
                        <label className="sidebar-label">Status</label>
                        <div className={`status-container status-${formData.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                            <select
                                className="sidebar-select"
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                disabled={!canUpdateStatus(issue)}
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="sidebar-group">
                        <label className="sidebar-label">Details</label>
                        <div className="details-list">
                            <div className="detail-item">
                                <span className="detail-label">Assignee</span>
                                <div className="detail-value">
                                    <User size={14} />
                                    <input
                                        className="detail-input"
                                        value={formData.assignee}
                                        onChange={(e) => handleChange('assignee', e.target.value)}
                                        placeholder="Unassigned"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Priority</span>
                                <div className="detail-value">
                                    {getPriorityIcon(formData.priority)}
                                    <select
                                        className="detail-select"
                                        value={formData.priority}
                                        onChange={(e) => handleChange('priority', e.target.value)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Team</span>
                                <div className="detail-value">
                                    <select
                                        className="detail-select"
                                        value={formData.team_id}
                                        onChange={(e) => handleChange('team_id', e.target.value)}
                                        disabled={!canEditTeamField()}
                                    >
                                        <option value="">No Team</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Story Points</span>
                                <input
                                    type="number"
                                    className="detail-input compact"
                                    value={formData.story_points}
                                    onChange={(e) => handleChange('story_points', e.target.value)}
                                    placeholder="None"
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-group">
                        <label className="sidebar-label">Dates</label>
                        <div className="details-list">
                            <div className="detail-item">
                                <span className="detail-label"><CalendarIcon size={12} /> Start</span>
                                <input
                                    type="date"
                                    className="detail-date"
                                    value={formData.start_date}
                                    onChange={(e) => handleChange('start_date', e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="detail-item">
                                <span className="detail-label"><CalendarIcon size={12} /> End</span>
                                <input
                                    type="date"
                                    className="detail-date"
                                    value={formData.end_date}
                                    onChange={(e) => handleChange('end_date', e.target.value)}
                                    disabled={isIssueReadOnly(issue)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-actions">
                        <button
                            className="save-btn"
                            onClick={handleSave}
                            disabled={isLoading || !isDirty}
                        >
                            {isLoading ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                            className="cancel-btn"
                            onClick={() => {
                                setFormData({
                                    title: issue.title || '',
                                    description: issue.description || '',
                                    status: issue.status || 'To Do',
                                    priority: issue.priority || 'Medium',
                                    story_points: issue.story_points || '',
                                    assignee: issue.assignee || '',
                                    reviewer: issue.reviewer || '',
                                    start_date: issue.start_date || '',
                                    end_date: issue.end_date || '',
                                    team_id: issue.team_id || ''
                                });
                                setIsDirty(false);
                            }}
                            disabled={!isDirty}
                        >
                            Cancel
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default IssueDetailsDrawer;