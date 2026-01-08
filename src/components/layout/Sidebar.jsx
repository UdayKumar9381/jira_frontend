import React, { useEffect, useState } from 'react';
import {
    Layout,
    Settings,
    Plus,
    List,
    Calendar,
    FileText,
    Code,
    Box, // Components
    ChevronLeft,
    ChevronRight,
    GanttChartSquare, // Timeline
    ListTodo, // Backlog
    GalleryVertical, // Active sprints
    BarChart2, // Reports
    Target, // Goals
    Briefcase, // Work items
    File, // Project pages
    Rocket, // Releases
    FormInput, // Forms
    Users // Teams
} from 'lucide-react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { projectService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { projectId } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const isProjectContext = location.pathname.includes('/projects/') && projectId;

    const [project, setProject] = useState(null);

    useEffect(() => {
        if (isProjectContext) {
            projectService.getAll().then(projects => {
                const found = projects.find(p => String(p.id) === String(projectId));
                setProject(found);
            }).catch(err => console.error("Failed to load project info", err));
        }
    }, [projectId, isProjectContext]);

    if (!isProjectContext) {
        return (
            <aside className={`jira-sidebar global-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="jira-sidebar-header" style={{ borderBottom: 'none' }}>
                    <div className="jira-logo" style={{ color: '#0052cc', fontWeight: 'bold' }}>
                    </div>
                </div>
                <div className="jira-sidebar-section" style={{ marginTop: '16px' }}>
                    {!isCollapsed && <div className="jira-section-title">MANAGEMENT</div>}
                    <nav className="jira-sidebar-nav">
                        <NavLink to="/projects" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <Layout size={20} title="View all projects" />
                            {!isCollapsed && <span>All Projects</span>}
                        </NavLink>
                        {user?.is_master_admin && (
                            <NavLink to="/admin/users" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                                <Settings size={20} title="User Management" />
                                {!isCollapsed && <span>User Management</span>}
                            </NavLink>
                        )}
                    </nav>
                </div>
            </aside>
        );
    }

    return (
        <aside className={`jira-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="jira-sidebar-content-scrollable">
                <div className="jira-sidebar-project-header">
                    <div className="jira-project-icon-lg">
                        {project ? project.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    {!isCollapsed && (
                        <div className="jira-project-info">
                            <div className="jira-project-name">
                                {project ? project.name : 'Loading...'}
                            </div>
                            <div className="jira-project-type">{project ? `${project.project_prefix} project` : 'Software project'}</div>
                        </div>
                    )}
                </div>

                <div className="jira-sidebar-section">
                    {!isCollapsed && <div className="jira-section-title">PLANNING</div>}
                    <nav className="jira-sidebar-nav">
                        <NavLink to={`/projects/${projectId}/board`} title="Board" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <Layout size={20} />
                            {!isCollapsed && <span>Board</span>}
                        </NavLink>

                        <NavLink to={`/projects/${projectId}/timeline`} title="Timeline" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <GanttChartSquare size={20} />
                            {!isCollapsed && <span>Timeline</span>}
                        </NavLink>
                        <NavLink to={`/projects/${projectId}/issues`} title="Issues" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <ListTodo size={20} />
                            {!isCollapsed && <span>Issues</span>}
                        </NavLink>
                        <NavLink to={`/projects/${projectId}/active-sprints`} title="Active sprints" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <GalleryVertical size={20} />
                            {!isCollapsed && <span>Active sprints</span>}
                        </NavLink>
                        <NavLink to={`/projects/${projectId}/calendar`} title="Calendar" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <Calendar size={20} />
                            {!isCollapsed && <span>Calendar</span>}
                        </NavLink>
                        <NavLink to={`/projects/${projectId}/reports`} title="Reports" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <BarChart2 size={20} />
                            {!isCollapsed && <span>Reports</span>}
                        </NavLink>
                        <NavLink to={`/projects/${projectId}/teams`} title="Teams" className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`}>
                            <Users size={20} />
                            {!isCollapsed && <span>Teams</span>}
                        </NavLink>
                    </nav>
                </div>

                <div className="jira-sidebar-group">
                    <NavLink to={`/projects/${projectId}/summary`} className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`} title="Summary">
                        <FileText size={20} />
                        {!isCollapsed && <span>Summary</span>}
                        {!isCollapsed && <span className="jira-badge-new">NEW</span>}
                    </NavLink>
                    <NavLink to={`/projects/${projectId}/list`} className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`} title="List">
                        <List size={20} />
                        {!isCollapsed && <span>List</span>}
                    </NavLink>

                    <NavLink to={`/projects/${projectId}/settings`} className={({ isActive }) => `jira-nav-item ${isActive ? 'active' : ''}`} title="Project settings">
                        <Settings size={20} />
                        {!isCollapsed && <span>Project settings</span>}
                    </NavLink>
                </div>
            </div>

            <div className="jira-sidebar-footer">
                {!isCollapsed && (
                    <div className="jira-sidebar-footer-text">
                        You're in a company-managed project
                    </div>
                )}
                <div className="jira-sidebar-footer-collapse">
                    <div className="jira-nav-item" onClick={onToggle} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        {!isCollapsed && <span>Collapse sidebar</span>}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
