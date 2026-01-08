import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import './ListView.css';

const YourWork = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupBy, setGroupBy] = useState('status'); // 'status' or 'project'
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchMyWork();
    }, []);

    const fetchMyWork = async () => {
        try {
            setLoading(true);
            const data = await storyService.getMyWork();
            setStories(data);
        } catch (err) {
            console.error('Failed to fetch your work:', err);
            setError('Failed to load your assigned work');
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysLeft = (startDate, endDate) => {
        if (!startDate || !endDate) return null;

        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const groupStories = () => {
        if (groupBy === 'status') {
            const groups = {
                'To Do': [],
                'In Progress': [],
                'Review': [],
                'Done': []
            };

            stories.forEach(story => {
                const status = story.status || 'To Do';
                const normalized = status.toUpperCase().replace('_', ' ').trim();

                if (normalized.includes('PROGRESS')) {
                    groups['In Progress'].push(story);
                } else if (normalized.includes('REVIEW') || normalized.includes('VERIFY')) {
                    groups['Review'].push(story);
                } else if (normalized.includes('DONE') || normalized.includes('COMPLETED')) {
                    groups['Done'].push(story);
                } else {
                    groups['To Do'].push(story);
                }
            });

            return groups;
        } else {
            // Group by project
            const groups = {};
            stories.forEach(story => {
                const projectName = story.project_name || 'Unknown Project';
                if (!groups[projectName]) {
                    groups[projectName] = [];
                }
                groups[projectName].push(story);
            });
            return groups;
        }
    };

    const handleStoryClick = (story) => {
        navigate(`/projects/${story.project_id}/issues/${story.id}`);
    };

    const getStatusColor = (status) => {
        const normalized = status?.toUpperCase().replace('_', ' ').trim() || '';
        if (normalized.includes('PROGRESS')) return '#0052cc';
        if (normalized.includes('REVIEW')) return '#ffab00';
        if (normalized.includes('DONE')) return '#36b37e';
        return '#6b778c';
    };

    const getPriorityColor = (priority) => {
        const p = priority?.toUpperCase() || 'MEDIUM';
        if (p === 'HIGH' || p === 'CRITICAL') return '#de350b';
        if (p === 'MEDIUM') return '#ffab00';
        return '#0065ff';
    };

    if (loading) {
        return (
            <div className="list-view-container">
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5e6c84' }}>
                    Loading your work...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="list-view-container">
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#de350b' }}>
                    {error}
                </div>
            </div>
        );
    }

    const groupedStories = groupStories();

    if (user?.is_master_admin) {
        return <AdminDashboard />;
    }

    return (
        <div className="list-view-container">
            <div className="list-view-header">
                <div>
                    <h1>Your Work</h1>
                    <p style={{ color: '#5e6c84', fontSize: '14px', marginTop: '8px' }}>
                        Issues assigned to <strong>{user?.username}</strong> • {stories.length} work items
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: '#42526e', fontWeight: '500' }}>Group by:</label>
                        <select
                            className="jira-input"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            style={{
                                width: '160px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #dfe1e6',
                                backgroundColor: '#f4f5f7',
                                fontSize: '14px'
                            }}
                        >
                            <option value="status">Status</option>
                            <option value="project">Project</option>
                        </select>
                    </div>
                </div>
            </div>

            {stories.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    color: '#5e6c84',
                    backgroundColor: 'white',
                    margin: '0 32px 32px',
                    borderRadius: '8px',
                    border: '1px solid #dfe1e6'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <p style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '600', color: '#172b4d' }}>No work assigned</p>
                    <p>You're all caught up! You don't have any issues assigned to you yet.</p>
                </div>
            ) : (
                <div style={{ padding: '0 32px 40px', maxWidth: '1200px' }}>
                    {Object.entries(groupedStories).map(([groupName, groupStories]) => (
                        groupStories.length > 0 && (
                            <div key={groupName} style={{ marginBottom: '40px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '20px',
                                    paddingBottom: '10px',
                                    borderBottom: '2px solid #dfe1e6'
                                }}>
                                    <h2 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#172b4d',
                                        margin: 0
                                    }}>
                                        {groupName}
                                    </h2>
                                    <span style={{
                                        backgroundColor: '#dfe1e6',
                                        color: '#42526e',
                                        padding: '2px 10px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {groupStories.length}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                    {groupStories.map(story => {
                                        const daysLeft = calculateDaysLeft(story.start_date, story.end_date);
                                        const isOverdue = daysLeft !== null && daysLeft < 0;
                                        const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                                        return (
                                            <div
                                                key={story.id}
                                                onClick={() => handleStoryClick(story)}
                                                style={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #dfe1e6',
                                                    borderRadius: '8px',
                                                    padding: '20px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    height: '100%',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                                                    e.currentTarget.style.borderColor = '#4c9aff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                                                    e.currentTarget.style.borderColor = '#dfe1e6';
                                                }}
                                            >
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            color: '#5e6c84',
                                                            fontWeight: '700',
                                                            backgroundColor: '#ebecf0',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {story.story_pointer}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            color: 'white',
                                                            backgroundColor: getStatusColor(story.status),
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {story.status}
                                                        </span>
                                                    </div>

                                                    <h3 style={{
                                                        margin: '0 0 8px 0',
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#172b4d',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {story.title}
                                                    </h3>

                                                    {story.description && (
                                                        <p style={{
                                                            margin: '0',
                                                            fontSize: '13px',
                                                            color: '#5e6c84',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: '2',
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: '1.5'
                                                        }}>
                                                            {story.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'space-between',
                                                    marginTop: 'auto',
                                                    paddingTop: '16px',
                                                    borderTop: '1px solid #f4f5f7'
                                                }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                        {story.priority && (
                                                            <span style={{
                                                                fontSize: '11px',
                                                                color: getPriorityColor(story.priority),
                                                                backgroundColor: `${getPriorityColor(story.priority)}15`,
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                fontWeight: '600',
                                                                border: `1px solid ${getPriorityColor(story.priority)}40`
                                                            }}>
                                                                {story.priority}
                                                            </span>
                                                        )}
                                                        {groupBy === 'status' && story.project_name && (
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#6b778c',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <span style={{ fontSize: '14px' }}>📁</span> {story.project_name}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {daysLeft !== null && (
                                                        <div style={{
                                                            textAlign: 'right',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            backgroundColor: isOverdue ? '#ffebe6' : isUrgent ? '#fff0b3' : '#deebff'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '14px',
                                                                fontWeight: '700',
                                                                color: isOverdue ? '#bf2600' : isUrgent ? '#854600' : '#0747a6',
                                                            }}>
                                                                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default YourWork;
