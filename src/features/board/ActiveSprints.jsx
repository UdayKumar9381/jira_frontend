import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService } from '../../services/storyService';
import { projectService } from '../../services/projectService';
import Button from '../../components/common/Button';
import './Board.css';

const calculateDaysLeft = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

const ActiveSprints = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [inProgressIssues, setInProgressIssues] = useState([]);
    const [search, setSearch] = useState('');
    const [project, setProject] = useState(null);

    const fetchIssues = async () => {
        try {
            const data = await storyService.getByProject(projectId);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        }
    };

    const fetchProject = async () => {
        try {
            const projects = await projectService.getAll();
            const current = projects.find(p => String(p.id) === String(projectId));
            setProject(current);
        } catch (error) {
            console.error("Failed to fetch project", error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchIssues();
            fetchProject();
        }
    }, [projectId]);

    useEffect(() => {
        // Filter only "In Progress" issues
        const filtered = issues.filter(issue => {
            const status = issue.status?.toUpperCase().replace('_', ' ').trim() || '';
            const isInProgress = status.includes('PROGRESS');

            // Apply search filter
            const matchesSearch = !search ||
                issue.title.toLowerCase().includes(search.toLowerCase()) ||
                issue.story_pointer.toLowerCase().includes(search.toLowerCase());

            return isInProgress && matchesSearch;
        });

        setInProgressIssues(filtered);
    }, [issues, search]);

    const handleIssueClick = (issue) => {
        navigate(`/projects/${projectId}/issues/${issue.id}`);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="jira-board-container">
            <div className="jira-board-header">
                <div>
                    <h1 style={{ marginBottom: 8 }}>Active Sprints</h1>
                    {project && (
                        <div style={{ color: '#5e6c84', fontSize: '14px', marginBottom: '12px' }}>
                            <strong>{project.name}</strong> • Active Sprint • {inProgressIssues.length} issues in progress
                        </div>
                    )}
                    <input
                        className="jira-input"
                        placeholder="Search issues..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>
                <Button onClick={() => navigate(`/projects/${projectId}/board`)}>
                    View Board
                </Button>
            </div>

            <div style={{
                backgroundColor: '#0052cc',
                padding: '16px 24px',
                borderRadius: '3px',
                marginBottom: '16px',
                color: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px' }}>📋</span>
                        <span>{project?.name || 'Project'}</span>
                    </div>
                    <span>Active Sprint • {inProgressIssues.length} issues in progress</span>
                </div>
            </div>

            {inProgressIssues.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#5e6c84',
                    fontSize: '14px'
                }}>
                    <p style={{ marginBottom: '8px', fontSize: '16px' }}>No issues in progress</p>
                    <p>Start working on issues to see them here with their timeline.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {inProgressIssues.map(issue => {
                        const daysLeft = calculateDaysLeft(issue.start_date, issue.end_date);
                        const isOverdue = daysLeft !== null && daysLeft < 0;
                        const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                        return (
                            <div
                                key={issue.id}
                                onClick={() => handleIssueClick(issue)}
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #dfe1e6',
                                    borderLeft: `4px solid ${isOverdue ? '#de350b' : isUrgent ? '#ffab00' : '#0052cc'}`,
                                    borderRadius: '3px',
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f4f5f7';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#5e6c84',
                                                fontWeight: '600',
                                                backgroundColor: '#f4f5f7',
                                                padding: '2px 8px',
                                                borderRadius: '3px'
                                            }}>
                                                {issue.story_pointer || `${project?.project_prefix || 'JIRA'}-${issue.id}`}
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#0052cc',
                                                backgroundColor: '#deebff',
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontWeight: '500'
                                            }}>
                                                📌 {issue.issue_type || 'Story'}
                                            </span>
                                        </div>
                                        <h3 style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            color: '#172b4d'
                                        }}>
                                            {issue.title}
                                        </h3>
                                        {issue.description && (
                                            <p style={{
                                                margin: 0,
                                                fontSize: '13px',
                                                color: '#5e6c84',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '600px'
                                            }}>
                                                {issue.description}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        {daysLeft !== null && (
                                            <div style={{
                                                textAlign: 'center',
                                                minWidth: '80px'
                                            }}>
                                                <div style={{
                                                    fontSize: '24px',
                                                    fontWeight: '700',
                                                    color: isOverdue ? '#de350b' : isUrgent ? '#ffab00' : '#0052cc',
                                                    lineHeight: '1'
                                                }}>
                                                    {isOverdue ? Math.abs(daysLeft) : daysLeft}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#5e6c84',
                                                    marginTop: '4px',
                                                    fontWeight: '500'
                                                }}>
                                                    {isOverdue ? 'DAYS OVERDUE' : 'DAYS LEFT'}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: '#0052cc',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            {getInitials(issue.assignee)}
                                        </div>

                                        <div style={{ fontSize: '20px', color: '#42526e' }}>
                                            -
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActiveSprints;
