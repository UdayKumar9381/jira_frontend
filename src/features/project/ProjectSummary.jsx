import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    Plus
} from 'lucide-react';
import { projectService, storyService } from '../../services/api';
import './ProjectSummary.css';

const ProjectSummary = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projData, issuesData] = await Promise.all([
                    projectService.getAll().then(list => list.find(p => String(p.id) === String(projectId))),
                    storyService.getByProject(projectId)
                ]);
                setProject(projData);
                setIssues(issuesData);
            } catch (err) {
                console.error("Failed to load summary data", err);
            } finally {
                setLoading(false);
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
                            <h2>Recent Activity</h2>
                            <Link to={`/projects/${projectId}/issues`} className="section-link">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="recent-list-modern">
                            {issues.slice(0, 5).map(issue => (
                                <div key={issue.id} className="summary-issue-card">
                                    <div className={`status-border ${issue.status?.toLowerCase().replace(/\s+/g, '-')}`}></div>
                                    <div className="issue-content-row">
                                        <div className="issue-main-info">
                                            <span className="issue-key">{issue.story_pointer}</span>
                                            <span className="issue-title-text">{issue.title}</span>
                                        </div>
                                        <div className={`status-pill status-${issue.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {issue.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                    <span className="info-value">Alex Rivers</span>
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
                                    <span className="info-value">Nov 24, 2024</span>
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
