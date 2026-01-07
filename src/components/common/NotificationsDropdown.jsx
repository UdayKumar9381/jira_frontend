import React, { useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ notifications, isLoading, onMarkAsRead, onClose }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Format date relative to now (e.g., "2 hours ago")
    const timeAgo = (dateValue) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="jira-notification-dropdown" ref={dropdownRef}>
            <div className="jira-notification-header">
                <span>Notifications</span>
            </div>

            <div className="jira-notification-list">
                {isLoading ? (
                    <div className="jira-notification-loading">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="jira-notification-empty">
                        <Bell size={24} color="#6b778c" />
                        <span>No notifications yet</span>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`jira-notification-item ${!notification.is_read ? 'unread' : ''}`}
                            onClick={() => onMarkAsRead(notification.id)}
                        >
                            <div className="jira-notification-title">{notification.title}</div>
                            <div className="jira-notification-message">{notification.message}</div>
                            <div className="jira-notification-time">{timeAgo(notification.created_at)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsDropdown;
