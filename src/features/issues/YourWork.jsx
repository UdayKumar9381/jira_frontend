import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService, projectService, statsService } from '../../services/api'; // Added statsService
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import { Briefcase, CheckSquare, Activity } from 'lucide-react';
import './ListView.css';

const YourWork = () => {
    const [stories, setStories] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]); // Store real activity
    const [loading, setLoading] = useState(true);
    const [projectCount, setProjectCount] = useState(0);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, [user.view_mode]); // Refetch when mode changes

    const fetchData = async () => {
        try {
            setLoading(true);

            // Parallel fetch
            const [storiesData, projectsData, activityData] = await Promise.all([
                storyService.getMyWork(),
                projectService.getAll(),
                statsService.getRecentActivity() // Fetch real activity
            ]);

            setStories(storiesData);
            setProjectCount(projectsData.length);
            setRecentActivity(activityData);

        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleStoryClick = (issue) => {
        navigate(`/projects/${issue.project_id}/issues/${issue.id}`);
    };

    const formatActivityDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';

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
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className="list-view-container">
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5e6c84' }}>
                    <div className="spinner"></div> Loading your dashboard...
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

    if (user?.is_master_admin) {
        return <AdminDashboard />;
    }

    return (
        <div className="list-view-container">
            <div className="list-view-header">
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ color: '#5e6c84', fontSize: '14px', marginTop: '8px' }}>
                        Welcome back, <strong>{user?.username}</strong>
                    </p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Stats Cubes */}
                <div className="stats-column">
                    <div className="stat-card cube">
                        <div className="stat-icon-wrapper" style={{ background: '#e6fcff', color: '#00b8d9' }}>
                            <Briefcase size={28} />
                        </div>
                        <div>
                            <h3>Active Projects</h3>
                            <div className="stat-value">{projectCount}</div>
                        </div>
                    </div>

                    <div className="stat-card cube">
                        <div className="stat-icon-wrapper" style={{ background: '#deebff', color: '#0052cc' }}>
                            <CheckSquare size={28} />
                        </div>
                        <div>
                            <h3>Assigned Issues</h3>
                            <div className="stat-value">{stories.length}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="activity-column">
                    <div className="stat-card" style={{ height: '100%' }}>
                        <div className="activity-card-header">
                            <Activity size={24} color="#0052cc" />
                            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Recent Activity</h2>
                        </div>

                        {recentActivity.length > 0 ? (
                            <div className="recent-activity-list">
                                {recentActivity.map(activity => (
                                    <div key={activity.id} className="recent-activity-item" onClick={() => handleStoryClick(activity.issue)}>
                                        <div className="activity-meta">
                                            <div>
                                                <span className="activity-user">{activity.actor.username}</span>
                                                <span className="activity-action">{activity.action.toLowerCase()}</span>
                                                an issue in
                                                <span className="activity-project" style={{ marginLeft: '4px', fontWeight: 500 }}>{activity.issue.project_name}</span>
                                            </div>
                                            <span>{formatActivityDate(activity.created_at)}</span>
                                        </div>

                                        <div className="activity-title">
                                            <span style={{ color: '#0052cc', marginRight: '8px' }}>{activity.issue.key}</span>
                                            {activity.issue.title}
                                        </div>

                                        <div className="activity-desc">
                                            {activity.changes.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b778c' }}>
                                <p>No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YourWork;
