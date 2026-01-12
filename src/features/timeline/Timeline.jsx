import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Users,
    Calendar,
    ChevronDown,
    ChevronUp,
    Settings2,
    GanttChartSquare,
    Check,
    AlertCircle,
    TrendingUp,
    BarChart3,
    X,
    Plus
} from 'lucide-react';
import { storyService } from '../../services/storyService';
import { authService } from '../../services/authService';
import IssueDetailsDrawer from '../issues/IssueDetailsDrawer';
import './Timeline.css';

const Timeline = () => {
    const { projectId } = useParams();
    const [issues, setIssues] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [zoom, setZoom] = useState('Months');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [groupBy, setGroupBy] = useState('none'); // 'none', 'status', 'assignee', 'priority'
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());

    // Filters
    const [filters, setFilters] = useState({
        status: [],
        assignee: [],
        priority: []
    });

    const timelineRef = useRef(null);
    const sidebarRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [issuesData, usersData] = await Promise.all([
                storyService.getByProject(projectId),
                authService.getAllUsers()
            ]);
            console.log('Timeline - Fetched issues:', issuesData);
            console.log('Timeline - Issues with dates:', issuesData.filter(i => i.start_date || i.end_date));
            setIssues(issuesData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch timeline data", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate overall range
    const timelineRange = useMemo(() => {
        const issuesWithDates = issues.filter(i => i.start_date || i.end_date);
        if (issuesWithDates.length === 0) {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
            return { start, end };
        }

        const starts = issuesWithDates.map(i => new Date(i.start_date || i.end_date));
        const ends = issuesWithDates.map(i => new Date(i.end_date || i.start_date));

        const minDate = new Date(Math.min(...starts));
        const maxDate = new Date(Math.max(...ends));

        const start = new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1);
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 3, 0);

        return { start, end };
    }, [issues]);

    // Generate grid headers
    const timelineUnits = useMemo(() => {
        const units = [];
        let current = new Date(timelineRange.start);

        while (current <= timelineRange.end) {
            units.push(new Date(current));
            if (zoom === 'Weeks') {
                current.setDate(current.getDate() + 7);
            } else if (zoom === 'Months') {
                current.setMonth(current.getMonth() + 1);
            } else {
                current.setMonth(current.getMonth() + 3);
            }
        }
        return units;
    }, [timelineRange, zoom]);

    const getDayWidth = () => {
        if (zoom === 'Weeks') return 15;
        if (zoom === 'Months') return 4;
        return 1.5;
    };

    const calculatePosition = (dateStr) => {
        if (!dateStr) return 0;
        const date = new Date(dateStr);
        const diffTime = Math.abs(date - timelineRange.start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * getDayWidth();
    };

    const calculateWidth = (startStr, endStr) => {
        if (!startStr) return 100;
        const start = new Date(startStr);
        const end = endStr ? new Date(endStr) : start;
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays * getDayWidth();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'done': return '#36b37e';
            case 'review': return '#8777d9';
            case 'in progress': return '#0052cc';
            case 'to do': default: return '#42526e';
        }
    };

    const isOverdue = (issue) => {
        if (!issue.end_date || issue.status?.toLowerCase() === 'done') return false;
        return new Date(issue.end_date) < new Date();
    };

    // Filter and search
    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            // Search filter
            const matchesSearch = !searchQuery ||
                issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (issue.story_pointer && issue.story_pointer.toLowerCase().includes(searchQuery.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status.length === 0 ||
                filters.status.includes(issue.status);

            // Assignee filter
            const matchesAssignee = filters.assignee.length === 0 ||
                filters.assignee.includes(issue.assigned_to);

            // Priority filter
            const matchesPriority = filters.priority.length === 0 ||
                filters.priority.includes(issue.priority);

            return matchesSearch && matchesStatus && matchesAssignee && matchesPriority;
        });
    }, [issues, searchQuery, filters]);

    // Group issues
    const groupedIssues = useMemo(() => {
        if (groupBy === 'none') {
            return [{ name: 'All Issues', issues: filteredIssues }];
        }

        const groups = {};
        filteredIssues.forEach(issue => {
            let key;
            if (groupBy === 'status') {
                key = issue.status || 'No Status';
            } else if (groupBy === 'assignee') {
                const user = users.find(u => u.id === issue.assigned_to);
                key = user ? user.username : 'Unassigned';
            } else if (groupBy === 'priority') {
                key = issue.priority || 'No Priority';
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(issue);
        });

        return Object.entries(groups).map(([name, issues]) => ({ name, issues }));
    }, [filteredIssues, groupBy, users]);

    // Statistics
    const stats = useMemo(() => {
        const total = issues.length;
        const done = issues.filter(i => i.status?.toLowerCase() === 'done').length;
        const review = issues.filter(i => i.status?.toLowerCase() === 'review').length;
        const inProgress = issues.filter(i => i.status?.toLowerCase() === 'in progress').length;
        const todo = issues.filter(i => i.status?.toLowerCase() === 'to do').length;
        const overdue = issues.filter(isOverdue).length;
        const completion = total > 0 ? Math.round((done / total) * 100) : 0;

        return { total, done, review, inProgress, todo, overdue, completion };
    }, [issues]);

    const handleGridScroll = (e) => {
        if (sidebarRef.current) {
            sidebarRef.current.scrollTop = e.target.scrollTop;
        }
    };

    const handleSidebarScroll = (e) => {
        if (gridRef.current) {
            gridRef.current.scrollTop = e.target.scrollTop;
        }
    };

    const toggleGroup = (groupName) => {
        const newCollapsed = new Set(collapsedGroups);
        if (newCollapsed.has(groupName)) {
            newCollapsed.delete(groupName);
        } else {
            newCollapsed.add(groupName);
        }
        setCollapsedGroups(newCollapsed);
    };

    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            const newValues = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [type]: newValues };
        });
    };

    const clearFilters = () => {
        setFilters({ status: [], assignee: [], priority: [] });
    };

    // Calculate dimensions - must be before early return to maintain hook order
    const totalWidth = useMemo(() => {
        const diffTime = Math.abs(timelineRange.end - timelineRange.start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays * getDayWidth();
    }, [timelineRange, zoom]);

    const unitWidth = useMemo(() => {
        if (zoom === 'Weeks') return 7 * getDayWidth();
        if (zoom === 'Months') return 30 * getDayWidth();
        return 90 * getDayWidth();
    }, [zoom]);

    const activeFilterCount = filters.status.length + filters.assignee.length + filters.priority.length;

    if (loading) {
        return (
            <div className="timeline-loading">
                <div className="loading-spinner"></div>
                <p>Loading roadmap...</p>
            </div>
        );
    }

    return (
        <div className="timeline-container">
            {/* Header */}
            <header className="timeline-header glass">
                <div className="header-left">
                    <div className="timeline-title-group">
                        <GanttChartSquare className="title-icon" />
                        <h1>Timeline</h1>
                        <span className="issue-count">{filteredIssues.length} issues</span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="search-bar glass-subtle">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        className={`filter-btn glass-subtle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="filter-badge">{activeFilterCount}</span>
                        )}
                    </button>

                    <div className="group-selector glass-subtle">
                        <Users size={16} />
                        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                            <option value="none">No Grouping</option>
                            <option value="status">Group by Status</option>
                            <option value="assignee">Group by Assignee</option>
                            <option value="priority">Group by Priority</option>
                        </select>
                    </div>

                    <div className="zoom-switch glass-subtle">
                        {['Weeks', 'Months', 'Quarters'].map(z => (
                            <button
                                key={z}
                                className={zoom === z ? 'active' : ''}
                                onClick={() => setZoom(z)}
                            >{z}</button>
                        ))}
                    </div>

                    <button
                        className="stats-toggle glass-subtle"
                        onClick={() => setShowStats(!showStats)}
                    >
                        <BarChart3 size={16} />
                    </button>
                </div>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel glass animate-slide-down">
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <div className="filters-actions">
                            <button onClick={clearFilters} className="clear-btn">Clear All</button>
                            <button onClick={() => setShowFilters(false)} className="close-btn">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="filters-content">
                        <div className="filter-group">
                            <label>Status</label>
                            <div className="filter-options">
                                {['To Do', 'In Progress', 'Review', 'Done'].map(status => (
                                    <button
                                        key={status}
                                        className={`filter-chip ${filters.status.includes(status) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('status', status)}
                                    >
                                        <span className={`status-dot status-${status.toLowerCase().replace(/\s+/g, '-')}`}></span>
                                        {status}
                                        {filters.status.includes(status) && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Priority</label>
                            <div className="filter-options">
                                {['High', 'Medium', 'Low'].map(priority => (
                                    <button
                                        key={priority}
                                        className={`filter-chip ${filters.priority.includes(priority) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('priority', priority)}
                                    >
                                        {priority}
                                        {filters.priority.includes(priority) && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Panel */}
            {showStats && (
                <div className="stats-panel glass animate-fade-in">
                    <div className="stat-card">
                        <div className="stat-icon completion">
                            <TrendingUp size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.completion}%</div>
                            <div className="stat-label">Completion</div>
                        </div>
                        <div className="stat-progress">
                            <div className="progress-bar" style={{ width: `${stats.completion}%` }}></div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon done">
                            <Check size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.done}</div>
                            <div className="stat-label">Done</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon review" style={{ background: '#f2f0ff', color: '#8777d9' }}>
                            <Check size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.review}</div>
                            <div className="stat-label">Review</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon in-progress">
                            <Calendar size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.inProgress}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon todo">
                            <BarChart3 size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.todo}</div>
                            <div className="stat-label">To Do</div>
                        </div>
                    </div>

                    {stats.overdue > 0 && (
                        <div className="stat-card overdue-card">
                            <div className="stat-icon overdue">
                                <AlertCircle size={20} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.overdue}</div>
                                <div className="stat-label">Overdue</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Timeline Content */}
            <div className="timeline-content">
                {/* Sidebar */}
                <div className="timeline-sidebar-list">
                    <div className="sidebar-header">Issues</div>
                    <div className="sidebar-items-scroll" ref={sidebarRef} onScroll={handleSidebarScroll}>
                        {groupedIssues.map(group => (
                            <div key={group.name} className="issue-group">
                                {groupBy !== 'none' && (
                                    <div
                                        className="group-header"
                                        onClick={() => toggleGroup(group.name)}
                                    >
                                        <div className="group-info">
                                            {collapsedGroups.has(group.name) ?
                                                <ChevronRight size={16} /> :
                                                <ChevronDown size={16} />
                                            }
                                            <span className="group-name">{group.name}</span>
                                            <span className="group-count">{group.issues.length}</span>
                                        </div>
                                        <div className="group-progress">
                                            <div className="group-progress-bar">
                                                <div
                                                    className="group-progress-fill"
                                                    style={{
                                                        width: `${(group.issues.filter(i => i.status?.toLowerCase() === 'done').length / group.issues.length) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!collapsedGroups.has(group.name) && group.issues.map(issue => (
                                    <div
                                        key={issue.id}
                                        className={`sidebar-issue-item ${isOverdue(issue) ? 'overdue' : ''}`}
                                        onClick={() => setSelectedIssue(issue)}
                                    >
                                        <div className="sidebar-issue-info">
                                            <span className="issue-pointer">{issue.story_pointer}</span>
                                            <span className="issue-title">{issue.title}</span>
                                        </div>
                                        <div className="issue-indicators">
                                            {isOverdue(issue) && (
                                                <AlertCircle size={12} className="overdue-icon" />
                                            )}
                                            <div className={`status-dot status-${issue.status?.toLowerCase().replace(/\s+/g, '-')}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {filteredIssues.length === 0 && (
                            <div className="timeline-empty-state">
                                <Calendar size={48} />
                                <h3>No Issues Found</h3>
                                <p>
                                    {issues.length === 0
                                        ? "Create issues in your project to see them on the timeline."
                                        : "No issues match your current filters. Try adjusting your search or filters."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Grid */}
                <div className="timeline-grid-wrapper" ref={gridRef} onScroll={handleGridScroll}>
                    {/* Warning for issues without dates */}
                    {issues.length > 0 && issues.filter(i => i.start_date || i.end_date).length === 0 && (
                        <div className="timeline-no-dates-warning">
                            <AlertCircle size={20} />
                            <div className="timeline-no-dates-warning-content">
                                <h4>No Timeline Data Available</h4>
                                <p>
                                    Your project has {issues.length} issue{issues.length !== 1 ? 's' : ''}, but none have start or end dates set.
                                    Add dates to your issues to see them on the timeline.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="timeline-grid-header" style={{ width: `${totalWidth}px` }}>
                        {timelineUnits.map((unit, idx) => (
                            <div key={idx} className="grid-header-unit" style={{ width: `${unitWidth}px` }}>
                                {zoom === 'Weeks'
                                    ? `Week ${idx + 1}`
                                    : zoom === 'Months'
                                        ? unit.toLocaleString('default', { month: 'short', year: 'numeric' })
                                        : `Q${Math.floor(unit.getMonth() / 3) + 1} ${unit.getFullYear()}`
                                }
                            </div>
                        ))}
                    </div>

                    <div className="timeline-grid-body" style={{ width: `${totalWidth}px` }}>
                        {/* Today Line */}
                        <div
                            className="today-line"
                            style={{ left: `${calculatePosition(new Date().toISOString())}px` }}
                        >
                            <div className="today-label">Today</div>
                        </div>

                        {/* Issue Bars */}
                        {groupedIssues.map(group => (
                            <React.Fragment key={group.name}>
                                {groupBy !== 'none' && (
                                    <div className="timeline-group-row"></div>
                                )}
                                {!collapsedGroups.has(group.name) && group.issues.map((issue) => {
                                    const left = calculatePosition(issue.start_date || issue.end_date);
                                    const width = calculateWidth(issue.start_date, issue.end_date);
                                    const overdue = isOverdue(issue);

                                    return (
                                        <div key={issue.id} className="timeline-row">
                                            {(issue.start_date || issue.end_date) && (
                                                <div
                                                    className={`timeline-bar status-${issue.status?.toLowerCase().replace(/\s+/g, '-')} ${overdue ? 'overdue-bar' : ''}`}
                                                    style={{
                                                        left: `${left}px`,
                                                        width: `${Math.max(width, 24)}px`,
                                                    }}
                                                    onClick={() => setSelectedIssue(issue)}
                                                    title={`${issue.title}\n${issue.start_date || 'No start'} → ${issue.end_date || 'No end'}`}
                                                >
                                                    <div className="bar-content">
                                                        <span className="bar-label">{issue.title}</span>
                                                        {issue.status?.toLowerCase() === 'done' && (
                                                            <Check size={12} className="bar-icon" />
                                                        )}
                                                        {overdue && (
                                                            <AlertCircle size={12} className="bar-icon overdue-icon" />
                                                        )}
                                                    </div>
                                                    {/* Progress indicator for in-progress items */}
                                                    {issue.status?.toLowerCase() === 'in progress' && (
                                                        <div className="bar-progress">
                                                            <div className="bar-progress-fill" style={{ width: '60%' }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Issue Details Drawer */}
            {selectedIssue && (
                <div className="side-drawer-overlay animate-fade-in" onClick={() => setSelectedIssue(null)}>
                    <div className="side-drawer animate-slide-in" onClick={e => e.stopPropagation()}>
                        <IssueDetailsDrawer
                            issue={selectedIssue}
                            onClose={() => setSelectedIssue(null)}
                            onUpdate={(updated) => {
                                setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
                                setSelectedIssue(updated);
                            }}
                            onDelete={(id) => {
                                setIssues(prev => prev.filter(i => i.id !== id));
                                setSelectedIssue(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timeline;
