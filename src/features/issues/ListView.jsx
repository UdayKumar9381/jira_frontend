import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService } from '../../services/storyService';
import { teamService } from '../../services/teamService';
import { AlertCircle, Bookmark, CheckSquare, ChevronUp, ChevronDown, Minus, Search, List, Filter } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import './ListView.css';

const ListView = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('All');
    const [teams, setTeams] = useState([]);
    const { canUpdateStatus, canEditIssue, isIssueReadOnly, canEditTeamField } = usePermissions();

    useEffect(() => {
        fetchIssues();
        if (projectId) {
            teamService.getByProject(projectId)
                .then(setTeams)
                .catch(err => console.error("Failed to fetch teams", err));
        }
    }, [projectId]);

    const fetchIssues = async () => {
        try {
            const data = await storyService.getByProject(projectId);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (issueId, field, value) => {
        const issue = issues.find(i => i.id === issueId);
        if (!issue) return;

        try {
            const updatedIssue = { ...issue, [field]: value };
            await storyService.update(issueId, updatedIssue);
            setIssues(prev => prev.map(i => i.id === issueId ? updatedIssue : i));
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
            alert(`Failed to update ${field}`);
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedIssues = [...issues].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    }).filter(issue => {
        const queryMatch = !searchQuery ||
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (issue.story_pointer && issue.story_pointer.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (issue.assignee && issue.assignee.toLowerCase().includes(searchQuery.toLowerCase()));

        const teamMatch = selectedTeam === 'All' || String(issue.team_id) === String(selectedTeam);

        return queryMatch && teamMatch;
    });

    const getIcon = (type) => {
        switch (type?.toUpperCase()) {
            case 'BUG': return <AlertCircle size={14} color="#e5493a" />;
            case 'STORY': return <Bookmark size={14} color="#63ba3c" fill="#63ba3c" />;
            case 'TASK': return <CheckSquare size={14} color="#4bade8" fill="#4bade8" />;
            default: return <CheckSquare size={14} color="#4bade8" />;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL': return <ChevronUp size={16} color="#ff5630" strokeWidth={3} />;
            case 'MEDIUM': return <Minus size={16} color="#ffab00" strokeWidth={3} />;
            case 'LOW': return <ChevronDown size={16} color="#0065ff" strokeWidth={3} />;
            default: return null;
        }
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

    return (
        <div className="list-view-container animate-fade-in">
            <header className="list-view-header glass">
                <div className="header-top">
                    <div className="breadcrumb">Projects / Issues</div>
                    <div className="title-group">
                        <List className="title-icon" />
                        <h1>Issues List</h1>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="search-box glass-subtle">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <select
                            className="jira-input"
                            style={{ height: '36px', width: '150px' }}
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            <option value="All">All Teams</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className="filter-btn glass-subtle">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>
                </div>
            </header>

            <table className="spreadsheet-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('story_pointer')}>Key</th>
                        <th onClick={() => requestSort('title')}>Summary</th>
                        <th onClick={() => requestSort('status')}>Status</th>
                        <th onClick={() => requestSort('assignee')}>Assignee</th>
                        <th onClick={() => requestSort('team_id')}>Team</th>
                        <th onClick={() => requestSort('priority')}>Priority</th>
                        <th onClick={() => requestSort('story_points')}>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedIssues.map(issue => (
                        <tr key={issue.id}>
                            <td
                                onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                                style={{ cursor: 'pointer', color: '#0052cc', whiteSpace: 'nowrap' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {getIcon(issue.issue_type)}
                                    {issue.story_pointer}
                                </div>
                            </td>
                            <td onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)} style={{ cursor: 'pointer' }}>
                                {issue.title}
                            </td>
                            <td>
                                <div className={`status-tag status-${issue.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                    <select
                                        className="inline-edit-select"
                                        value={issue.status}
                                        onChange={(e) => handleUpdate(issue.id, 'status', e.target.value)}
                                        disabled={!canUpdateStatus(issue)}
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </td>
                            <td>
                                <input
                                    className="inline-edit-select"
                                    value={issue.assignee || ''}
                                    onChange={(e) => setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, assignee: e.target.value } : i))}
                                    onBlur={(e) => handleUpdate(issue.id, 'assignee', e.target.value)}
                                    placeholder="Unassigned"
                                    disabled={isIssueReadOnly(issue)}
                                />
                            </td>
                            <td>
                                <select
                                    className="inline-edit-select"
                                    value={issue.team_id || ''}
                                    onChange={(e) => handleUpdate(issue.id, 'team_id', e.target.value)}
                                    disabled={!canEditTeamField()}
                                >
                                    <option value="">No Team</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="priority-cell">
                                <div className="priority-wrapper">
                                    {getPriorityIcon(issue.priority)}
                                    <select
                                        className="inline-edit-select"
                                        value={issue.priority || 'Medium'}
                                        onChange={(e) => handleUpdate(issue.id, 'priority', e.target.value)}
                                        disabled={isIssueReadOnly(issue)}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="inline-edit-select"
                                    value={issue.story_points || ''}
                                    onChange={(e) => setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, story_points: e.target.value } : i))}
                                    onBlur={(e) => handleUpdate(issue.id, 'story_points', e.target.value)}
                                    placeholder="-"
                                    style={{ width: '60px' }}
                                    disabled={isIssueReadOnly(issue)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {sortedIssues.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#5e6c84' }}>
                    No issues found matching your search.
                </div>
            )}
        </div>
    );
};

export default ListView;
