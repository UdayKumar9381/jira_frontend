import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import IssueItem from './IssueItem';

const SprintSection = ({ title, sprintId, issues, dates, isBacklog = false, onIssueClick, teams = [] }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Calculate stats
    const todo = issues.filter(i => i.status === 'To Do').length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    const done = issues.filter(i => i.status === 'Done').length;

    return (
        <div className={`sprint-container ${isBacklog ? 'backlog-section' : ''}`}>
            <div className="sprint-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="sprint-info">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="sprint-name">{title}</span>
                    {!isBacklog && dates && <span className="sprint-dates">{dates}</span>}
                    <span className="sprint-dates">({issues.length} issues)</span>
                </div>

                <div className="sprint-meta">
                    {!isBacklog && (
                        <div className="sprint-stats">
                            <span className="stat-badge todo" title="To Do">{todo}</span>
                            <span className="stat-badge inprogress" title="In Progress">{inProgress}</span>
                            <span className="stat-badge done" title="Done">{done}</span>
                        </div>
                    )}

                    {!isBacklog && (
                        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                            Complete sprint
                        </button>
                    )}
                    <MoreHorizontal size={16} />
                </div>
            </div>

            {isExpanded && (
                <Droppable droppableId={sprintId}>
                    {(provided, snapshot) => (
                        <div
                            className={`sprint-issue-list ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {issues.map((issue, index) => (
                                <IssueItem
                                    key={issue.id}
                                    issue={issue}
                                    index={index}
                                    teams={teams}
                                    onClick={onIssueClick}
                                />
                            ))}
                            {provided.placeholder}
                            {issues.length === 0 && !snapshot.isDraggingOver && (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#6b778c', fontSize: '13px', border: '1px dashed #dfe1e6', margin: '0 8px' }}>
                                    Plan a sprint by dragging issues here
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    );
};

export default SprintSection;
