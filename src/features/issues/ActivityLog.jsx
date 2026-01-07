import React, { useState, useEffect } from 'react';
import { storyService } from '../../services/api';
import './ActivityLog.css';

const ActivityLog = ({ issueId, refreshTrigger }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivity = async () => {
        try {
            const data = await storyService.getActivity(issueId);
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activity logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchActivity();
        }
    }, [issueId, refreshTrigger]);

    const formatRelativeTime = (dateStr) => {
        // User requested absolute date format: "Jan 2, 2026"
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatFullTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (username) => {
        if (!username) return '?';
        return username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const renderAction = (activity) => {
        const user = <span className="activity-user">{activity.username}</span>;

        switch (activity.action_type) {
            case 'ISSUE_CREATED':
                return <span>{user} created the issue</span>;
            case 'ISSUE_DELETED':
                return <span>{user} deleted the issue</span>;
            case 'FIELD_UPDATED':
                let fieldName = activity.field_changed?.replace('_', ' ');
                // Sanitization
                if (fieldName?.toLowerCase() === 'assignee id') fieldName = 'assignee';

                return (
                    <span>
                        {user} updated <span className="field-name">{fieldName}</span>
                        {activity.old_value && activity.old_value !== 'None' && activity.old_value !== 'null' && (
                            <> from <span className="old-value">{activity.old_value}</span></>
                        )}
                        <span className="change-arrow">→</span>
                        <span className="new-value">{activity.new_value}</span>
                    </span>
                );
            case 'ISSUE_UPDATED':
                // Backend sends summary in new_value: "Title: Old -> New, Status: Old -> New"
                if (activity.new_value && activity.new_value.includes('->')) {
                    // Parse the summary string
                    const changes = activity.new_value.split(', ').map((change, idx) => {
                        const parts = change.split(': ');
                        if (parts.length < 2) return null;

                        let field = parts[0].trim();
                        // Sanitize field names if needed
                        if (field.toLowerCase() === 'assignee id') field = 'assignee';

                        const valParts = parts[1].split(' -> ');
                        if (valParts.length < 2) return null;

                        const oldVal = valParts[0].trim();
                        const newVal = valParts[1].trim();

                        return (
                            <span key={idx}>
                                {idx > 0 ? ' and ' : ' '}
                                <span className="field-name">{field}</span> from <span className="old-value">{oldVal}</span> <span className="change-arrow">→</span> <span className="new-value">{newVal}</span>
                            </span>
                        );
                    });

                    return <span>{user} updated {changes}</span>;
                }
                return <span>{user} updated this issue</span>;
            default:
                return <span>{user} performed an action: {activity.action_type}</span>;
        }
    };

    if (isLoading) return <div className="activity-log-section">Loading activities...</div>;

    return (
        <div className="activity-log-section">
            <h3 className="activity-log-title">Activity</h3>
            <div className="activity-timeline">
                {activities.length > 0 ? (
                    (() => {
                        const grouped = [];
                        activities.forEach((act) => {
                            if (grouped.length > 0) {
                                const last = grouped[grouped.length - 1];
                                const timeDiff = new Date(act.created_at) - new Date(last.created_at);
                                const isSameUser = last.username === act.username;
                                // Group FIELD_UPDATED events if they act on single fields rapidly
                                const isUpdate = (last.action_type === 'FIELD_UPDATED' && act.action_type === 'FIELD_UPDATED');

                                if (isSameUser && isUpdate && Math.abs(timeDiff) < 60000) {
                                    last.updates.push(act);
                                    return;
                                }
                            }
                            // New group or non-mergeable activity
                            grouped.push({
                                ...act,
                                updates: [act]
                            });
                        });

                        return grouped.map((group) => (
                            <div key={group.id} className="activity-item animate-fade-in">
                                <div className="activity-avatar" title={group.username}>
                                    {getInitials(group.username)}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-time" title={formatFullTime(group.created_at)}>
                                            {formatRelativeTime(group.created_at)}
                                        </span>
                                    </div>
                                    <div className="activity-detail">
                                        {group.action_type === 'FIELD_UPDATED' && group.updates.length > 1 ? (
                                            <span>
                                                <span className="activity-user">{group.username}</span> updated
                                                {group.updates.map((u, i) => {
                                                    let fieldName = u.field_changed?.replace('_', ' ');
                                                    if (fieldName?.toLowerCase() === 'assignee id') fieldName = 'assignee';

                                                    return (
                                                        <span key={i}>
                                                            {i > 0 && i === group.updates.length - 1 ? ' and ' : i > 0 ? ', ' : ' '}
                                                            <span className="field-name">{fieldName}</span>
                                                            {u.old_value && u.old_value !== 'None' && u.old_value !== 'null' && (
                                                                <> from <span className="old-value">{u.old_value}</span></>
                                                            )}
                                                            <span className="change-arrow">→</span>
                                                            <span className="new-value">{u.new_value}</span>
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        ) : (
                                            renderAction(group)
                                        )}
                                    </div>
                                    <div className="activity-date-detail">
                                        {formatFullTime(group.created_at)}
                                    </div>
                                </div>
                            </div>
                        ));
                    })()
                ) : (
                    <div className="no-activity">No activity history yet.</div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
