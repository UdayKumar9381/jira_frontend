import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Users,
    Calendar as CalendarIcon,
    ArrowRight,
    Search,
    User,
    Layout,
    CheckCircle,
    Clock,
    Zap,
    Plus,
    Activity
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { storyService } from '../../services/storyService';
import { statsService } from '../../services/statsService';
import { formatRelativeTime } from '../../utils/dateUtils'; // Shared date formatting
import { logError } from '../../utils/renderUtils'; // Standardized logging
import './ProjectSummary.css';

const ProjectSummary = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Batch fetch project details, issues, and activity logs
                const [projData, issuesData, activityData] = await Promise.all([
                    projectService.getAll().then(list => list.find(p => String(p.id) === String(projectId))),
                    storyService.getByProject(projectId),
                    statsService.getRecentActivity(projectId)
                ]);
                setProject(projData);
                setIssues(issuesData);
                setRecentActivity(activityData);
            } catch (err) {
                logError('ProjectSummaryLoad', err); // Using shared error logger
            } finally {
                setLoading(false); // Stop loading regardless of outcome
            }
        };
        loadData();
    }, [projectId]);

    const stats = useMemo(() => {
        const total = issues.length;
        const done = issues.filter(i => i.status?.toLowerCase() === 'done').length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, percent };
    }, [issues]);

    const handleIssueClick = (issueId) => {
        navigate(`/projects/${projectId}/issues/${issueId}`);
    };

    if (loading) return <div className="summary-loading">Gathering project insights...</div>;

    return (
        <div className="summary-page animate-fade-in">
            <header className="summary-header">
                <div className="project-breadcrumb">
                    <Link to="/projects">Projects</Link>
                    <span>/</span>
                    <span className="current">{project?.name || 'Loading...'}</span>
                </div>
                <div className="project-title-row">
                    <div className="project-icon-large">
                        {project?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="project-info-main">
                        <h1>{project?.name}</h1>
                        <p className="project-desc">{project?.project_prefix} project • Software</p>
                    </div>
                </div>
            </header>

            <div className="summary-grid">
                <div className="summary-main">
                    <div className="quick-actions-row">
                        <Link to={`/projects/${projectId}/board`} className="quick-action-card glass-subtle">
                            <Layout size={20} color="#0052cc" />
                            <span>Board</span>
                        </Link>
                        <Link to={`/projects/${projectId}/issues`} className="quick-action-card glass-subtle">
                            <Plus size={20} color="#36b37e" />
                            <span>All Issues</span>
                        </Link>
                    </div>

                    <section className="summary-section glass stats-container-new">
                        <div className="section-header">
                            <h2>Project Health</h2>
                            <div className="health-badge good">On Track</div>
                        </div>
                        <div className="health-content">
                            <div className="progress-ring-section">
                                <div className="percent">{stats.percent}%</div>
                                <div className="label">Complete</div>
                            </div>
                            <div className="health-details">
                                <div className="progress-bar-stack">
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }}></div>
                                    </div>
                                    <div className="progress-counts">
                                        <div className="count-item">
                                            <span className="dot done"></span>
                                            <span>{stats.done} Done</span>
                                        </div>
                                        <div className="count-item">
                                            <span className="dot remaining"></span>
                                            <span>{stats.total - stats.done} Remaining</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="summary-section glass">
                        <div className="section-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={20} color="#0052cc" />
                                <h2>Recent Activity</h2>
                            </div>
                            <Link to={`/projects/${projectId}/issues`} className="section-link">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="recent-list-modern">
                            {recentActivity.length > 0 ? (
                                recentActivity.slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="summary-activity-item" onClick={() => handleIssueClick(activity.issue.id)}>
                                        <div className="activity-meta">
                                            <div>
                                                <span className="activity-user">{activity.actor.username}</span>
                                                <span className="activity-action">{activity.action.toLowerCase()}</span>
                                                an issue
                                            </div>
                                            <span>{formatRelativeTime(activity.created_at)}</span> {/* Shared date formatting */}
                                        </div>

                                        <div className="activity-title">
                                            <span style={{ color: '#0052cc', marginRight: '8px' }}>{activity.issue.key}</span>
                                            {activity.issue.title}
                                        </div>

                                        <div className="activity-desc">
                                            {activity.changes.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#6b778c' }}>
                                    <p>No recent activity found in this project.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="summary-sidebar">
                    <section className="summary-section glass sidebar-section">
                        <h3>About this project</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <User size={16} />
                                <div>
                                    <span className="info-label">Lead</span>
                                    <span className="info-value">{project?.owner?.username || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Search size={16} />
                                <div>
                                    <span className="info-label">Key</span>
                                    <span className="info-value">{project?.project_prefix}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <CalendarIcon size={16} />
                                <div>
                                    <span className="info-label">Created on</span>
                                    <span className="info-value">
                                        {project?.created_at
                                            ? new Date(project.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                            : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="summary-section glass sidebar-section">
                        <h3>Quick Links</h3>
                        <div className="quick-links">
                            <Link to={`/projects/${projectId}/calendar`} className="quick-link-item">
                                <CalendarIcon size={16} />
                                <span>Calendar View</span>
                            </Link>
                            <Link to={`/projects/${projectId}/timeline`} className="quick-link-item">
                                <Layout size={16} />
                                <span>Project Roadmap</span>
                            </Link>
                            <Link to={`/projects/${projectId}/reports`} className="quick-link-item">
                                <FileText size={16} />
                                <span>Health Reports</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProjectSummary;
