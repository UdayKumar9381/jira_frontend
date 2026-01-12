import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import useFetch from '../../hooks/useFetch'; // Shared fetch logic
import { formatDateTime } from '../../utils/dateUtils'; // Shared date formatting
import { logError } from '../../utils/renderUtils'; // Standardized logging
import './NotificationsDropdown.css';
const NotificationsDropdown = ({ userId, isOpen, onClose, onUnreadCountChange }) => {
    const navigate = useNavigate();

    // Use shared hook for notification fetching
    const {
        data: notifications = [],
        loading,
        execute: fetchNotifications,
        setData: setNotifications
    } = useFetch(() => notificationService.getNotifications(userId));

    useEffect(() => {
        // Fetch when dropdown is opened
        if (isOpen && userId && typeof userId === 'number') {
            fetchNotifications();
        }
    }, [isOpen, userId, fetchNotifications]);

    useEffect(() => {
        // Initial fetch for count badge
        if (userId && typeof userId === 'number') {
            fetchNotifications();
        }
    }, [userId, fetchNotifications]);

    // Sync unread count with parent Navbar
    useEffect(() => {
        const unreadCount = (notifications || []).filter(n => !n.is_read).length;
        if (onUnreadCountChange) onUnreadCountChange(unreadCount);
    }, [notifications, onUnreadCountChange]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            // Optimistically update local state
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            logError('DropdownMarkRead', error); // Shared error logger
        }
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
                                    <span>{formatDateTime(notification.created_at)}</span> {/* Using shared date utility */}
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
                <button
                    className="view-all-btn"
                    onClick={() => {
                        navigate('/notifications');
                        onClose();
                    }}
                >
                    View all notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationsDropdown;
