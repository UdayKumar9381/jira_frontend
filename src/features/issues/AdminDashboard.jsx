import React, { useState, useEffect } from 'react';
import {
    Users,
    Layers,
    TrendingUp,
    History,
    ArrowRight,
    Loader2,
    Calendar,
    Shield
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { statsService } from '../../services/statsService';
import useFetch from '../../hooks/useFetch'; // Shared fetch logic
import { logError } from '../../utils/renderUtils'; // Standardized logging
import { formatDateTime } from '../../utils/dateUtils'; // Shared date formatting
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Centralized dashboard data fetching using shared hook
    const { loading, execute: fetchDashboardData, data } = useFetch(async () => {
        const [summary, history] = await Promise.all([
            statsService.getAdminSummary({ month: selectedMonth, year: selectedYear }),
            statsService.getModeSwitchHistory()
        ]);
        return { summary, history };
    });

    const summary = data?.summary || null;
    const history = data?.history || [];

    useEffect(() => {
        fetchDashboardData(); // Trigger fetch on setup or date change
    }, [fetchDashboardData, selectedMonth, selectedYear]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateCurrentMonths = () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const options = [];

        // Generate dropdown options for current year up to current month
        for (let i = 0; i <= currentMonth; i++) {
            options.push({ value: i + 1, label: `${months[i]} ${currentYear}` });
        }
        return options.reverse();
    };

    if (loading && !summary) return (
        <div className="admin-dashboard-loading">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading Workspace Intel...</p>
        </div>
    );

    const COLORS = ['#0052cc', '#00b8d9', '#36b37e', '#ffab00'];

    return (
        <div className="admin-dashboard-container animate-fade-in">
            <div className="admin-dashboard-grid">

                <div className="admin-dashboard-card admin-stat-card">
                    <div className="card-icon projects-icon">
                        <Layers size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Total Projects</h3>
                        <div className="stat-value">{summary?.total_projects || 0}</div>
                        <p>Active workspaces system-wide</p>
                    </div>
                </div>

                <div className="admin-dashboard-card chart-card">
                    <div className="card-header">
                        <div className="header-left">
                            <TrendingUp size={20} />
                            <h3>Weekly Project creation</h3>
                        </div>
                        <select
                            className="week-dropdown"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {generateCurrentMonths().map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary?.weekly_stats || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f5f7" />
                                <XAxis
                                    dataKey="week"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b778c', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b778c', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f4f5f7' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="projects" radius={[4, 4, 0, 0]} barSize={40}>
                                    {(summary?.weekly_stats || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === (summary?.weekly_stats?.length - 1) ? '#0052cc' : '#4c9aff'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-dashboard-card admin-creators-card">
                    <div className="card-header">
                        <div className="header-left">
                            <Users size={20} />
                            <h3>Admin Creators</h3>
                        </div>
                    </div>
                    <div className="admins-list">
                        {(summary?.admin_breakdown || []).map((admin, idx) => (
                            <div key={idx} className="admin-project-row">
                                <div className="admin-avatar-sm">
                                    {admin.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="admin-info">
                                    <div className="name">{admin.username}</div>
                                    <div className="email">{admin.email}</div>
                                </div>
                                <div className="projects-count-badge">
                                    {admin.count} {admin.count === 1 ? 'Project' : 'Projects'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-dashboard-card history-card full-row">
                    <div className="card-header">
                        <div className="header-left">
                            <History size={20} />
                            <h3>Mode Switch History</h3>
                        </div>
                        <p className="header-subtitle">Audit log of all role & access changes</p>
                    </div>
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Requested Mode</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Reason / Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="user-cell">
                                                <strong>{item.username}</strong>
                                                <span>{item.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`mode-badge ${item.requested_mode.toLowerCase()}`}>
                                                {item.requested_mode}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={12} />
                                                {formatDateTime(item.created_at)} {/* Standardized date display */}
                                            </div>
                                        </td>
                                        <td className="reason-cell">
                                            <p title={item.reason}>{item.reason}</p>
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="empty-history">No mode switch history found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
