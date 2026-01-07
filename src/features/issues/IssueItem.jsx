import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { CheckSquare, Bookmark, AlertCircle, MoreHorizontal, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import './IssueItem.css';

const IssueItem = ({ issue, index, onClick, teams = [] }) => {
    const team = teams.find(t => String(t.id) === String(issue.team_id));
    const teamName = team ? team.name : null;

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'bug': return <AlertCircle size={14} color="#e5493a" />;
            case 'story': return <Bookmark size={14} color="#65ba43" />;
            case 'task': default: return <CheckSquare size={14} color="#4bade8" />;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return <ArrowUp size={14} color="#e5493a" />;
            case 'low': return <ArrowDown size={14} color="#2684ff" />;
            default: return <Minus size={14} color="#ffab00" />;
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <Draggable draggableId={String(issue.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`backlog-issue ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(issue)}
                    style={{ ...provided.draggableProps.style, cursor: 'pointer' }}
                >
                    <div className="issue-type-icon">
                        {getIcon(issue.issue_type)}
                    </div>

                    <div className="issue-key">
                        {issue.story_pointer || `ID-${issue.id}`}
                    </div>

                    <div className="issue-summary">
                        {issue.title}
                    </div>

                    <div className="issue-meta">
                        <div className={`issue-status ${issue.status?.toLowerCase().replace(' ', '')}`}>
                            {issue.status}
                        </div>

                        {teamName && (
                            <div className="issue-team-badge" title={`Team: ${teamName}`} style={{
                                backgroundColor: '#ebecf0',
                                color: '#42526e',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: '600',
                                marginLeft: '8px'
                            }}>
                                {teamName}
                            </div>
                        )}

                        <div className="issue-estimate" title="Story Points">
                            {issue.story_points || '-'}
                        </div>

                        <div className="issue-priority">
                            {getPriorityIcon(issue.priority)}
                        </div>

                        <div className="issue-assignee" title={issue.assignee}>
                            {getInitials(issue.assignee)}
                        </div>

                        <MoreHorizontal size={16} color="#42526e" style={{ marginLeft: '8px' }} />
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default IssueItem;
