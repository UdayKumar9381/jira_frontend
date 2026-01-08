import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { notificationService } from '../../services/api';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ userId, isOpen, onClose, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId && typeof userId === 'number') {
            fetchNotifications();
        }
    }, [isOpen, userId]);

    // Initial fetch to show badge count
    useEffect(() => {
        if (userId && typeof userId === 'number') {
            fetchNotifications(true);
        }
    }, [userId]);

    const fetchNotifications = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await notificationService.getNotifications(userId);
            setNotifications(data);
            const unreadCount = data.filter(n => !n.is_read).length;
            if (onUnreadCountChange) onUnreadCountChange(unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));

            // Update parent unread count
            const newNotifications = notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            );
            const unreadCount = newNotifications.filter(n => !n.is_read).length;
            if (onUnreadCountChange) onUnreadCountChange(unreadCount);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'Z'); // Ensure UTC parsing if standard ISO string
        // Fallback if Date is invalid
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="notifications-header">
                <h3>Notifications</h3>
                <span className="unread-badge-text">
                    {notifications.filter(n => !n.is_read).length} Unread
                </span>
            </div>

            <div className="notifications-list">
                {loading ? (
                    <div className="notifications-loading">
                        <div className="spinner"></div>
                        <span>Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notifications-empty">
                        <Bell size={48} className="empty-icon" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        >
                            <div className="notification-content">
                                <div className="notification-title">
                                    {notification.title}
                                    {!notification.is_read && <span className="unread-dot"></span>}
                                </div>
                                <div className="notification-message">
                                    {notification.message}
                                </div>
                                <div className="notification-time">
                                    <Clock size={12} />
                                    <span>{formatTime(notification.created_at)}</span>
                                </div>
                            </div>
                            {!notification.is_read && (
                                <button
                                    className="mark-read-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                    }}
                                    title="Mark as read"
                                >
                                    <Check size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="notifications-footer">
                <button className="view-all-btn">View all notifications</button>
            </div>
        </div>
    );
};

export default NotificationsDropdown;
