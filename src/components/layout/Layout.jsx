import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const isFullWidthPage = location.pathname.includes('/timeline') ||
        location.pathname.includes('/board') ||
        location.pathname.includes('/active-sprints');

    return (
        <div className="jira-layout">
            <Navbar onCreateClick={() => window.dispatchEvent(new CustomEvent('open-create-modal'))} />
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <main className={`jira-main-content ${isSidebarCollapsed ? 'collapsed' : ''} ${isFullWidthPage ? 'full-width' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
