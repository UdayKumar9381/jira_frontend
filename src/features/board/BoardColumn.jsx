import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';
import './BoardColumn.css';

const BoardColumn = ({ id, title, issues, onIssueClick, teams = [] }) => {
    return (
        <div className="jira-board-column">
            <div className="jira-column-header">
                <h2 className="jira-column-title">
                    {title} <span className="jira-column-count">{issues.length}</span>
                </h2>
            </div>
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        className={`jira-column-content ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {issues.map((issue, index) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                index={index}
                                teams={teams}
                                onClick={() => onIssueClick(issue)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default BoardColumn;
