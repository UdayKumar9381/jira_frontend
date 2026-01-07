import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Calendar as CalendarIcon,
    Users,
    Activity,
    Maximize2,
    Minimize2,
    Search,
    ChevronDown,
    Check
} from 'lucide-react';
import { storyService, projectService } from '../../services/api';
import IssueDetailsDrawer from '../issues/IssueDetailsDrawer';
import './Calendar.css';

import CreateIssueModal from '../board/CreateIssueModal';

const Calendar = () => {
    const { projectId } = useParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // 'month', 'week', or 'day'
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createInitialDate, setCreateInitialDate] = useState('');

    // Filters
    const [assigneeFilter, setAssigneeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchIssues();
    }, [projectId]);

    const fetchIssues = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await storyService.getByProject(projectId);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues for calendar", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Logic
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = [];

        if (view === 'month') {
            const totalDays = daysInMonth(year, month);
            const startDay = firstDayOfMonth(year, month);

            // Previous month days
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            for (let i = startDay - 1; i >= 0; i--) {
                days.push({
                    day: prevMonthLastDay - i,
                    month: month - 1,
                    year: month === 0 ? year - 1 : year,
                    currentMonth: false
                });
            }

            // Current month days
            for (let i = 1; i <= totalDays; i++) {
                days.push({
                    day: i,
                    month: month,
                    year: year,
                    currentMonth: true
                });
            }

            // Next month days
            const remainingDays = 42 - days.length;
            for (let i = 1; i <= remainingDays; i++) {
                days.push({
                    day: i,
                    month: month + 1,
                    year: month === 11 ? year + 1 : year,
                    currentMonth: false
                });
            }
        } else if (view === 'week') {
            // Get current week (Sun-Sat)
            const dayOfWeek = currentDate.getDay();
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                days.push({
                    day: d.getDate(),
                    month: d.getMonth(),
                    year: d.getFullYear(),
                    currentMonth: d.getMonth() === currentDate.getMonth()
                });
            }
        } else if (view === 'day') {
            days.push({
                day: currentDate.getDate(),
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
                currentMonth: true
            });
        }

        return days;
    }, [currentDate, view]);

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            const matchesAssignee = assigneeFilter === 'All' || issue.assignee === assigneeFilter;
            const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || (issue.priority || 'Medium') === priorityFilter;
            const matchesType = typeFilter === 'All' || (issue.issue_type || 'Task') === typeFilter;
            const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (issue.story_pointer && issue.story_pointer.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesAssignee && matchesStatus && matchesPriority && matchesType && matchesSearch && (issue.start_date || issue.end_date);
        });
    }, [issues, assigneeFilter, statusFilter, priorityFilter, typeFilter, searchQuery]);

    const uniqueAssignees = useMemo(() => [...new Set(issues.map(i => i.assignee).filter(Boolean))], [issues]);
    const uniqueStatuses = useMemo(() => [...new Set(issues.map(i => i.status).filter(Boolean))], [issues]);
    const uniquePriorities = useMemo(() => [...new Set(issues.map(i => i.priority).filter(Boolean))], [issues]);
    const uniqueTypes = useMemo(() => [...new Set(issues.map(i => i.issue_type).filter(Boolean))], [issues]);

    const getIssuesForDay = (dayObj) => {
        const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
        return filteredIssues.filter(issue => {
            const start = issue.start_date;
            const end = issue.end_date || issue.start_date;
            return dateStr >= start && dateStr <= end;
        });
    };

    const handlePrev = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (view === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 7);
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 1);
            setCurrentDate(newDate);
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (view === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 7);
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 1);
            setCurrentDate(newDate);
        }
    };

    const getIssueGridPosition = (issue) => {
        if (!issue.start_date) return null;

        const start = new Date(issue.start_date);
        const end = issue.end_date ? new Date(issue.end_date) : start;

        const startIndex = calendarDays.findIndex(d =>
            d.year === start.getFullYear() && d.month === start.getMonth() && d.day === start.getDate()
        );

        const endIndex = calendarDays.findIndex(d =>
            d.year === end.getFullYear() && d.month === end.getMonth() && d.day === end.getDate()
        );

        if (startIndex === -1 && endIndex === -1) return null;

        const actualStart = startIndex === -1 ? 0 : startIndex;
        const actualEnd = endIndex === -1 ? calendarDays.length - 1 : endIndex;

        if (actualEnd < 0 || actualStart >= calendarDays.length) return null;

        return {
            start: actualStart + 1,
            span: (actualEnd - actualStart) + 1,
            row: view === 'month' ? Math.floor(actualStart / 7) + 1 : 1
        };
    };

    // For a simpler implementation that still feels premium, we'll keep the discrete bars 
    // but add a "spanning" indicator logic or just focus on the layout.
    // Actually, true spanning is better. Let's group issues by row to prevent overlap.
    const rowIssues = useMemo(() => {
        const rowCount = view === 'month' ? 6 : 1;
        const rows = Array.from({ length: rowCount }, () => []);

        filteredIssues.forEach(issue => {
            const pos = getIssueGridPosition(issue);
            if (pos && pos.row <= rowCount) {
                rows[pos.row - 1].push({ ...issue, pos });
            }
        });

        return rows;
    }, [filteredIssues, calendarDays, view]);

    const handleQuickCreate = (dateObj) => {
        // Format date as YYYY-MM-DDTHH:MM for datetime-local input
        const dateStr = `${dateObj.year}-${String(dateObj.month + 1).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}T09:00`;
        setCreateInitialDate(dateStr);
        setIsCreateModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'done': return '#36b37e';
            case 'in progress': return '#0052cc';
            case 'to do': default: return '#42526e';
        }
    };

    if (loading) return <div className="calendar-loading">Loading excellence...</div>;

    return (
        <div className="calendar-container">
            <header className="calendar-header glass">
                <div className="header-left">
                    <div className="calendar-title-group">
                        <CalendarIcon className="title-icon" />
                        <h1>Calendar View</h1>
                    </div>
                    <div className="navigation-controls">
                        <button className="nav-btn" onClick={handlePrev}><ChevronLeft size={20} /></button>
                        <button className="today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
                        <button className="nav-btn" onClick={handleNext}><ChevronRight size={20} /></button>
                        <h2 className="current-period">
                            {view === 'month'
                                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                                : view === 'week'
                                    ? `Week of ${calendarDays[0]?.day} ${monthNames[calendarDays[0]?.month]}`
                                    : `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`}
                        </h2>
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
                    <div className="view-switch glass-subtle">
                        <button
                            className={view === 'month' ? 'active' : ''}
                            onClick={() => setView('month')}
                        >Month</button>
                        <button
                            className={view === 'week' ? 'active' : ''}
                            onClick={() => setView('week')}
                        >Week</button>
                        <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
                    </div>
                    <button
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="calendar-filters glass-subtle animate-fade-in">
                    <div className="filter-item">
                        <label><Users size={14} /> Assignee</label>
                        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                            <option value="All">All People</option>
                            {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Activity size={14} /> Status</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><ChevronDown size={14} /> Priority</label>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="All">All Priorities</option>
                            {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><ChevronDown size={14} /> Type</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="All">All Types</option>
                            {['Story', 'Task', 'Bug'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <main className="calendar-grid-container">
                <div className={`calendar-grid ${view}`}>
                    <div className="day-headers">
                        {view === 'day' ? (
                            <div className="day-header">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()]}</div>
                        ) : (
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="day-header">{day}</div>
                            ))
                        )}
                    </div>
                    <div className="calendar-body-relative">
                        <div className="days-grid">
                            {calendarDays.map((dateObj, idx) => {
                                const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();
                                const dayIssues = getIssuesForDay(dateObj);
                                const maxVisibleIssues = view === 'month' ? 3 : 10;

                                return (
                                    <div
                                        key={idx}
                                        className={`day-cell ${!dateObj.currentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                                    >
                                        <div className="day-cell-header">
                                            <span className="day-number">{dateObj.day}</span>
                                            <button
                                                className="create-cell-btn"
                                                title="Create Issue"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleQuickCreate(dateObj);
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="day-issues-list">
                                            {dayIssues.slice(0, maxVisibleIssues).map(issue => (
                                                <div
                                                    key={issue.id}
                                                    className={`calendar-issue-card status-${issue.status?.toLowerCase().replace(/\s+/g, '-')}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedIssue(issue);
                                                    }}
                                                >
                                                    <span className="issue-key">{issue.story_pointer}</span>
                                                    <span className="issue-summary">{issue.title}</span>
                                                    {issue.status?.toLowerCase() === 'done' && <Check size={12} className="done-icon" />}
                                                </div>
                                            ))}
                                            {dayIssues.length > maxVisibleIssues && (
                                                <div className="more-indicator">
                                                    + {dayIssues.length - maxVisibleIssues} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

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

            <CreateIssueModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={projectId}
                onIssueCreated={fetchIssues}
                initialData={{ start_date: createInitialDate }}
            />
        </div>
    );
};

export default Calendar;
