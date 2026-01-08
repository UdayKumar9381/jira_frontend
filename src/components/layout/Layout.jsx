import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const isProjectContext = /\/projects\/\d+/.test(location.pathname);
    const shouldHideSidebar = user?.is_master_admin && !isProjectContext;

    const isFullWidthPage = location.pathname.includes('/timeline') ||
        location.pathname.includes('/board') ||
        location.pathname.includes('/active-sprints') ||
        shouldHideSidebar;

    return (
        <div className="jira-layout">
            <Navbar onCreateClick={() => window.dispatchEvent(new CustomEvent('open-create-modal'))} />
            {!shouldHideSidebar && (
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            )}
            <main className={`jira-main-content ${isSidebarCollapsed || shouldHideSidebar ? 'collapsed' : ''} ${isFullWidthPage ? 'full-width' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
