import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    BarChart2,
    PieChart,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    ChevronUp,
    ChevronDown,
    Minus
} from 'lucide-react';
import { storyService } from '../../services/api';
import './Reports.css';

const Reports = () => {
    const { projectId } = useParams();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const data = await storyService.getByProject(projectId);
                setIssues(data);
            } catch (error) {
                console.error("Failed to fetch issues for reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, [projectId]);

    const stats = useMemo(() => {
        const total = issues.length;
        const done = issues.filter(i => i.status?.toLowerCase() === 'done').length;
        const inProgress = issues.filter(i => i.status?.toLowerCase() === 'in progress').length;
        const todo = issues.filter(i => i.status?.toLowerCase() === 'to do' || !i.status).length;

        const typeCount = issues.reduce((acc, i) => {
            const type = i.issue_type || 'Story';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const priorityCount = issues.reduce((acc, i) => {
            const priority = i.priority || 'Medium';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});

        return { total, done, inProgress, todo, typeCount, priorityCount };
    }, [issues]);

    const handleDownloadPDF = async () => {
        const element = document.querySelector('.reports-container');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`project-reports-${projectId}.pdf`);
        } catch (err) {
            console.error("Failed to export PDF", err);
        }
    };

    if (loading) return <div className="reports-loading">Analyzing project data...</div>;

    return (
        <div className="reports-container animate-fade-in">
            <header className="reports-header glass">
                <div className="header-left">
                    <BarChart2 className="title-icon" />
                    <h1>Project Reports</h1>
                </div>
                <div className="header-right">
                </div>
            </header>

            <div className="reports-content">
                <div className="stats-grid">
                    <div className="stat-card glass-subtle">
                        <div className="stat-icon todo"><Clock size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">To Do</span>
                            <span className="stat-value">{stats.todo}</span>
                        </div>
                    </div>
                    <div className="stat-card glass-subtle">
                        <div className="stat-icon progress"><TrendingUp size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">In Progress</span>
                            <span className="stat-value">{stats.inProgress}</span>
                        </div>
                    </div>
                    <div className="stat-card glass-subtle">
                        <div className="stat-icon done"><CheckCircle2 size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{stats.done}</span>
                        </div>
                    </div>
                    <div className="stat-card glass-subtle">
                        <div className="stat-icon total"><AlertCircle size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">Total Issues</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Issue Type Distribution</h3>
                            <div className="chart-subtitle">Breakdown by issue category</div>
                        </div>
                        <div className="chart-container circle-outer">
                            <div className="donut-wrapper">
                                <svg viewBox="0 0 100 100" className="donut-chart-svg">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f4f5f7" strokeWidth="10" />
                                    {Object.entries(stats.typeCount).map(([type, count], idx, arr) => {
                                        let offset = 0;
                                        for (let i = 0; i < idx; i++) offset += (arr[i][1] / stats.total) * 100;
                                        const percent = (count / stats.total) * 100;
                                        const colors = ['#0052cc', '#36b37e', '#ffab00', '#ff5630', '#6554c0'];
                                        return (
                                            <circle
                                                key={type}
                                                cx="50" cy="50" r="42"
                                                fill="transparent"
                                                stroke={colors[idx % colors.length]}
                                                strokeWidth="10"
                                                strokeDasharray={`${percent} ${100 - percent}`}
                                                strokeDashoffset={-offset}
                                                strokeLinecap="round"
                                                transform="rotate(-90 50 50)"
                                                className="donut-segment"
                                            />
                                        );
                                    })}
                                </svg>
                                <div className="donut-center">
                                    <span className="total-num">{stats.total}</span>
                                    <span className="total-label">Issues</span>
                                </div>
                            </div>
                            <div className="chart-legend-modern">
                                {Object.entries(stats.typeCount).map(([type, count], idx) => (
                                    <div key={type} className="legend-item-v2">
                                        <span className="dot" style={{ background: ['#0052cc', '#36b37e', '#ffab00', '#ff5630', '#6554c0'][idx % 5] }}></span>
                                        <div className="legend-info">
                                            <span className="label">{type}</span>
                                            <span className="percent">{Math.round((count / stats.total) * 100)}%</span>
                                        </div>
                                        <span className="count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Priority Distribution</h3>
                            <div className="chart-subtitle">Breakdown of issues by importance (High/Medium/Low)</div>
                        </div>
                        <div className="priority-grid">
                            {['High', 'Medium', 'Low'].map((p) => {
                                const count = stats.priorityCount[p] || 0;
                                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={p} className={`priority-card priority-${p.toLowerCase()}`}>
                                        <div className="priority-icon-wrapper">
                                            {p === 'High' && <ChevronUp size={24} />}
                                            {p === 'Medium' && <Minus size={24} />}
                                            {p === 'Low' && <ChevronDown size={24} />}
                                        </div>
                                        <div className="priority-info">
                                            <span className="priority-count">{count}</span>
                                            <span className="priority-label">{p} Priority</span>
                                        </div>
                                        <div className="priority-indicator">
                                            <div className="p-bar" style={{ height: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
