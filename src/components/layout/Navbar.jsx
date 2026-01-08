import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Bell,
    Grid,
    ChevronDown,
    User,
    LogOut,
    Settings

} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { projectService, storyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import usePermissions from '../../hooks/usePermissions';
import logo from '../../assets/kiet-logo.png';
import NotificationsDropdown from '../../features/notifications/NotificationsDropdown';
import './Navbar.css';



const Navbar = ({ onCreateClick }) => {
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [recentProjects, setRecentProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { user, logout } = useAuth();
    const { canCreateIssue, canManageUsers } = usePermissions();
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProjectsOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isProjectsOpen) {
            projectService.getAll().then(projects => {
                setRecentProjects(projects.slice(0, 3));
            }).catch(err => console.error("Failed to fetch projects", err));
        }
    }, [isProjectsOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const searchTerm = searchQuery.toLowerCase().trim();
            if (searchTerm.length > 1) {
                try {
                    const results = await storyService.search(searchQuery);

                    // Smart Filter: If an exact match exists for the ID (story_pointer), prioritize it
                    const exactMatch = results.find(result =>
                        String(result.story_pointer).toLowerCase() === searchTerm ||
                        (result.story_pointer && String(result.story_pointer).toLowerCase().split('-').pop() === searchTerm)
                    );

                    if (exactMatch) {
                        setSearchResults([exactMatch]);
                    } else {
                        setSearchResults(results);
                    }
                    setIsSearching(true);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleCreateProject = () => {
        setIsProjectsOpen(false);
        window.dispatchEvent(new CustomEvent('open-create-project-modal'));
    };

    const handleProjectClick = (projectId) => {
        setIsProjectsOpen(false);
        navigate(`/projects/${projectId}/board`);
    };

    const handleResultClick = (result) => {
        setIsSearching(false);
        setSearchQuery('');
        navigate(`/projects/${result.project_id}/board`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="jira-navbar">
            <div className="jira-navbar-start">
                <div className="jira-logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="KIET Logo" className="jira-navbar-logo" style={{ height: '32px', marginRight: '8px' }} />
                    <span className="jira-logo-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>KIET</span>
                </div>
                <nav className="jira-main-nav">
                    <a href="#" className="jira-nav-link" onClick={(e) => { e.preventDefault(); navigate('/my-work'); }}>Your work</a>

                    {/* Projects Dropdown */}
                    <div className="jira-nav-item-container" ref={dropdownRef}>
                        <button
                            className={`jira-nav-link dropdown-trigger ${isProjectsOpen ? 'active' : ''}`}
                            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                        >
                            Projects <ChevronDown size={12} style={{ marginLeft: 4 }} />
                        </button>

                        {isProjectsOpen && (
                            <div className="jira-dropdown-menu">
                                {!user?.is_master_admin && (
                                    <>
                                        <div className="jira-dropdown-section">
                                            <div className="jira-dropdown-header">Recent</div>
                                            {recentProjects.length > 0 ? (
                                                recentProjects.map(project => (
                                                    <div
                                                        key={project.id}
                                                        className="jira-dropdown-item project-item"
                                                        onClick={() => handleProjectClick(project.id)}
                                                    >
                                                        <div className="jira-project-icon-sm">
                                                            {project.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="jira-project-details-sm">
                                                            <div className="name">{project.name}</div>
                                                            <div className="type">Software project</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="jira-dropdown-item disabled">No recent projects</div>
                                            )}
                                        </div>
                                        <div className="jira-dropdown-divider"></div>
                                    </>
                                )}
                                <div className="jira-dropdown-section">
                                    <div className="jira-dropdown-item" onClick={() => navigate('/projects')}>
                                        View all projects
                                    </div>
                                    {!user?.is_master_admin && (
                                        <div className="jira-dropdown-item" onClick={handleCreateProject}>
                                            Create project
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {user?.is_master_admin && (
                        <a href="#" className="jira-nav-link" onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }}>User Management</a>
                    )}
                </nav>
                {canCreateIssue() && !user?.is_master_admin && (
                    <Button variant="primary" onClick={onCreateClick}>Create</Button>
                )}
            </div>

            <div className="jira-navbar-end">
                <div className="jira-search-container" ref={searchRef}>
                    <Search size={16} className="jira-search-icon" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="jira-navbar-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setIsSearching(true)}
                    />
                    {isSearching && searchResults.length > 0 && (
                        <div className="jira-dropdown-menu search-results">
                            {searchResults.map(result => (
                                <div
                                    key={result.id}
                                    className="jira-dropdown-item search-result-item"
                                    onClick={() => handleResultClick(result)}
                                >
                                    <div className="search-result-info">
                                        <div className="search-result-title">{result.title}</div>
                                        <div className="search-result-meta">{result.story_pointer} • {result.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="jira-notifications-wrapper" ref={notificationsRef}>
                    <button
                        className={`jira-icon-btn ${isNotificationsOpen ? 'active' : ''}`}
                        title="Notifications"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    <NotificationsDropdown
                        userId={user?.id}
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        onUnreadCountChange={setUnreadCount}
                    />
                </div>



                <div className="jira-profile-wrapper" ref={profileRef}>
                    <div
                        className={`jira-profile-toggle ${isProfileOpen ? 'active' : ''}`}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="jira-avatar" title="View Profile">
                            {user?.profile_pic ? (
                                <img src={`/api${user.profile_pic}`} alt="" className="avatar-img-navbar" />
                            ) : (
                                user?.username?.charAt(0).toUpperCase() || <User size={16} />
                            )}
                        </div>
                        <div className="jira-dropdown-chevron" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    {isProfileOpen && (
                        <div className="jira-profile-dropdown jira-dropdown-menu">
                            <div className="jira-dropdown-header">
                                <div className="jira-dropdown-user-info">
                                    <div className="jira-avatar-large">
                                        {user?.profile_pic ? (
                                            <img src={`/api${user.profile_pic}`} alt="" className="avatar-img-navbar" />
                                        ) : (
                                            user?.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="jira-user-details">
                                        <div className="jira-username">{user?.username}</div>
                                        <div className="jira-email">{user?.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="jira-dropdown-divider" />

                            <div className="jira-dropdown-items">
                                <div
                                    className="jira-dropdown-item"
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsProfileOpen(false);
                                    }}
                                >
                                    <User size={16} />
                                    <span>Profile</span>
                                </div>
                                <div className="jira-dropdown-item">
                                    <Settings size={16} />
                                    <span>Personal Settings</span>
                                </div>
                            </div>

                            <div className="jira-dropdown-divider" />

                            <div className="jira-dropdown-items">
                                <div className="jira-dropdown-item" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Log out</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
