import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
    CheckSquare,
    Bookmark,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    Minus,
    Users
} from 'lucide-react';
import './IssueCard.css';

// Mappings for icons/colors can be moved to a shared utility
const IssueTypeIcon = ({ type }) => {
    switch (type?.toUpperCase()) {
        case 'BUG': return <AlertCircle size={14} color="#e5493a" />;
        case 'STORY': return <Bookmark size={14} color="#63ba3c" fill="#63ba3c" />;
        case 'TASK': return <CheckSquare size={14} color="#4bade8" fill="#4bade8" />;
        default: return <CheckSquare size={14} color="#4bade8" />;
    }
};

const PriorityIcon = ({ priority }) => {
    switch (priority?.toUpperCase()) {
        case 'HIGH':
        case 'CRITICAL': return <ChevronUp size={16} color="#ff5630" strokeWidth={3} />;
        case 'MEDIUM': return <Minus size={16} color="#ffab00" strokeWidth={3} />;
        case 'LOW': return <ChevronDown size={16} color="#0065ff" strokeWidth={3} />;
        default: return null;
    }
};

const IssueCard = ({ issue, index, onClick, teams = [] }) => {
    const team = teams.find(t => String(t.id) === String(issue.team_id));
    const teamName = team ? team.name : 'Team Assigned';

    return (
        <Draggable draggableId={String(issue.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`jira-issue-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    <div className="jira-issue-card-content">
                        <span className="jira-issue-title">{issue.title}</span>
                        <div className="jira-issue-meta">
                            <div className="jira-issue-metadata-left">
                                <IssueTypeIcon type={issue.issue_type || issue.type || 'STORY'} />
                                <span className="jira-issue-key">
                                    {issue.story_pointer || `${issue.project_prefix || 'JIRA'}-${issue.id}`}
                                </span>
                            </div>

                            <div className="jira-issue-metadata-right">
                                {issue.team_id && (
                                    <div className="jira-team-badge" title={teamName}>
                                        <Users size={10} />
                                        <span>{teamName}</span>
                                    </div>
                                )}
                                <PriorityIcon priority={issue.priority || 'MEDIUM'} />
                                <div className="jira-avatar-circle" title={issue.assignee || 'Unassigned'}>
                                    {issue.assignee ? issue.assignee.charAt(0).toUpperCase() : '?'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default IssueCard;
