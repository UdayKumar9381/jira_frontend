import React, { useState, useEffect } from 'react';
import { storyService } from '../../services/api';
import { Activity, User } from 'lucide-react';
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
        if (!dateStr) return 'Unknown date';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
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

    const getActionLabel = (actionType) => {
        switch (actionType) {
            case 'ISSUE_CREATED': return 'CREATED';
            case 'ISSUE_DELETED': return 'DELETED';
            case 'FIELD_UPDATED':
            case 'ISSUE_UPDATED': return 'UPDATED';
            default: return 'ACTION';
        }
    };

    const renderChanges = (activity) => {
        if (!activity.changes) return null;

        // Check if it's a creation event or something else without explicit changes
        if (activity.action === 'CREATED' || activity.action === 'ISSUE_CREATED') return 'Initial creation';

        // Split by newline or comma (handles different backend formats)
        // We use a lookahead/regex to try and split intelligently
        const rawLines = activity.changes.split(/,|\n/).map(l => l.trim()).filter(l => l.length > 0);

        const parsedLines = rawLines.map((line, idx) => {
            // Match pattern: "Field: Old -> New" or "Field: Old → New"
            // Captures: 1=Field, 2=Old, 3=New
            const match = line.match(/^(.*?):\s*(.*?)\s*(?:→|->)\s*(.*)$/);

            if (match) {
                const field = match[1].trim();
                const oldVal = match[2].trim() || 'Empty';
                const newVal = match[3].trim() || 'Empty';

                return (
                    <div key={idx} className="activity-change-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, color: '#44546f' }}>{field}:</span>
                        <span style={{ color: '#ebecf0', textDecoration: 'line-through', fontSize: '12px' }}>{oldVal}</span>
                        <span style={{ color: '#5e6c84', fontSize: '10px' }}>➜</span>
                        <span style={{ fontWeight: 500, color: '#0052cc' }}>{newVal}</span>
                    </div>
                );
            } else {
                // Fallback for lines that don't match the Arrow format
                return <div key={idx}>{line}</div>;
            }
        });

        return <div className="activity-desc-box">{parsedLines}</div>;
    };

    if (isLoading) {
        return (
            <div className="activity-log-section">
                <div style={{ textAlign: 'center', padding: '20px', color: '#5e6c84' }}>
                    Loading activities...
                </div>
            </div>
        );
    }

    return (
        <div className="activity-log-section">
            <h3 className="activity-log-title">
                <Activity size={20} color="#0052cc" />
                Activity
            </h3>

            <div className="activity-timeline">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="activity-item animate-fade-in">
                            <div className="activity-header">
                                <div className="activity-user-container">
                                    <span className="activity-user">{activity.username}</span>
                                    <span className="activity-action">{getActionLabel(activity.action)}</span>
                                    <span style={{ color: '#5e6c84' }}>an issue</span>
                                </div>
                                <span className="activity-time">{formatRelativeTime(activity.created_at)}</span>
                            </div>

                            <div className="activity-detail">
                                {activity.action === 'CREATED' ? 'Initial creation of the issue' : renderChanges(activity)}
                            </div>

                            <div className="activity-date-detail">
                                {formatFullTime(activity.created_at)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-activity">No activity history yet.</div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
