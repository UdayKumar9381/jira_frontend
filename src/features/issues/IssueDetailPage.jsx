import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Trash2, CheckSquare, Bookmark, AlertCircle, Edit3, ChevronLeft,
    Paperclip, Calendar, User, Flag, Layers, Users
} from 'lucide-react';
import { storyService, teamService } from '../../services/api';
import usePermissions from '../../hooks/usePermissions';
import Button from '../../components/common/Button';
import IssueDetailModal from '../board/IssueDetailModal';
import ActivityLog from './ActivityLog';
import './IssueDetailPage.css';

const IssueDetailPage = () => {
    const { projectId, issueId } = useParams();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [teams, setTeams] = useState([]);
    const { canEditIssue, canDeleteIssue } = usePermissions();

    const fetchIssue = async () => {
        try {
            const data = await storyService.getById(issueId);
            setIssue(data);
        } catch (error) {
            console.error("Failed to fetch issue details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIssue();
        if (projectId) {
            teamService.getByProject(projectId)
                .then(setTeams)
                .catch(err => console.error("Failed to fetch teams", err));
        }
    }, [issueId, projectId]);

    const handleIssueUpdated = () => {
        fetchIssue();
        setRefreshKey(prev => prev + 1); // Increment key to trigger activity refresh
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await storyService.delete(parseInt(issueId));
            navigate(`/projects/${projectId}/board`);
        } catch (error) {
            console.error("Failed to delete issue", error);
            alert("Failed to delete issue");
        }
    };

    if (isLoading) return <div className="issue-detail-page">Loading...</div>;
    if (!issue) return <div className="issue-detail-page">Issue not found.</div>;

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'bug': return <AlertCircle size={16} color="#e5493a" />;
            case 'story': return <Bookmark size={16} color="#65ba43" />;
            case 'task': default: return <CheckSquare size={16} color="#4bade8" />;
        }
    };

    const getStatusClass = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('progress')) return 'status-inprogress';
        if (s.includes('done') || s.includes('complete')) return 'status-done';
        if (s.includes('review')) return 'status-review';
        return 'status-todo';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'None';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="issue-detail-page animate-fade-in">
            {/* Header */}
            <div className="issue-detail-header">
                <div className="header-left">
                    <div className="breadcrumb">
                        <Button variant="subtle" onClick={() => navigate(`/projects/${projectId}/board`)} style={{ padding: '0', height: 'auto', color: '#5e6c84' }}>
                            <ChevronLeft size={16} style={{ marginRight: 4 }} /> Board
                        </Button>
                        <span>/</span>
                        <span>{issue.project_name || 'Project'}</span>
                        <span>/</span>
                        <span>{issue.story_pointer}</span>
                    </div>
                    <h1 className="issue-title">{issue.title}</h1>
                </div>
                <div className="header-actions">
                    {canEditIssue(issue) && (
                        <Button variant="subtle" onClick={() => setIsEditModalOpen(true)}>
                            <Edit3 size={16} style={{ marginRight: '8px' }} />
                            Edit
                        </Button>
                    )}
                    {canDeleteIssue() && (
                        <Button variant="danger" onClick={handleDelete}>
                            <Trash2 size={16} style={{ marginRight: '8px' }} />
                        </Button>
                    )}
                </div>
            </div>

            {/* CLASSIC INFO GRID (3 Cols) */}
            <div className="classic-info-grid">

                {/* Column 1: Details */}
                <div className="info-column">
                    <div className="info-column-header">Details</div>

                    <div className="info-field">
                        <div className="field-label">Type:</div>
                        <div className="field-value">
                            {getIcon(issue.issue_type)}
                            {issue.issue_type || 'Task'}
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Priority:</div>
                        <div className="field-value">
                            <Flag size={14} color={issue.priority === 'High' ? '#ff5630' : '#42526e'} />
                            {issue.priority || 'Medium'}
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Points:</div>
                        <div className="field-value">
                            <div style={{ background: '#dfe1e6', borderRadius: '10px', padding: '2px 8px', fontSize: '12px' }}>
                                {issue.story_points || '-'}
                            </div>
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Sprint:</div>
                        <div className="field-value">
                            <Layers size={14} className="text-gray-500" />
                            {issue.sprint_number || 'None'}
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Release:</div>
                        <div className="field-value">
                            {issue.release_number || 'None'}
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Team:</div>
                        <div className="field-value">
                            <Users size={14} />
                            {teams.find(t => String(t.id) === String(issue.team_id))?.name || 'No Team'}
                        </div>
                    </div>
                </div>

                {/* Column 2: Status */}
                <div className="info-column">
                    <div className="info-column-header">Status</div>

                    <div className="info-field">
                        <div className="field-label">Status:</div>
                        <div className="field-value">
                            <div className={`status-badge ${getStatusClass(issue.status)}`}>
                                {issue.status}
                            </div>
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Resolution:</div>
                        <div className="field-value">
                            {issue.status?.toLowerCase() === 'done' ? 'Done' : 'Unresolved'}
                        </div>
                    </div>
                </div>

                {/* Column 3: People & Dates */}
                <div className="info-column">
                    <div className="info-column-header">People</div>

                    <div className="info-field">
                        <div className="field-label">Assignee:</div>
                        <div className="field-value">
                            <User size={14} />
                            <span style={{ color: '#0052cc' }}>{issue.assignee || 'Unassigned'}</span>
                        </div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">Reviewer:</div>
                        <div className="field-value">
                            <User size={14} />
                            {issue.reviewer || 'None'}
                        </div>
                    </div>

                    <div className="info-column-header" style={{ marginTop: 16, marginBottom: 12 }}>Dates</div>

                    <div className="info-field">
                        <div className="field-label">Start:</div>
                        <div className="field-value">{formatDate(issue.start_date)}</div>
                    </div>
                    <div className="info-field">
                        <div className="field-label">End:</div>
                        <div className="field-value">{formatDate(issue.end_date)}</div>
                    </div>
                </div>
            </div>

            {/* Main Content (Bottom) */}
            <div className="classic-main-content">
                <div>
                    <div className="section-header">Description</div>
                    <div className="description-text">
                        {issue.description || <span style={{ color: '#5e6c84', fontStyle: 'italic' }}>No description provided.</span>}
                    </div>
                </div>
                {issue.support_doc && (
                    <div>
                        <div className="section-header">Attachments</div>
                        <div className="attachment-box">
                            <Paperclip size={16} color="#5e6c84" />
                            <a
                                href={`/api/uploads/${issue.support_doc}`}
                                target="_blank"
                                rel="noreferrer"
                                className="attachment-link"
                            >
                                {issue.support_doc}
                            </a>
                        </div>
                    </div>
                )}

                {/* Activity Log Section */}
                <ActivityLog issueId={issueId} refreshTrigger={refreshKey} />
            </div>

            {/* Edit Modal (Popup) */}
            {isEditModalOpen && (
                <IssueDetailModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    issue={issue}
                    onIssueUpdated={handleIssueUpdated}
                    onIssueDeleted={() => navigate(`/projects/${projectId}/board`)}
                />
            )}
        </div>
    );
};

export default IssueDetailPage;
