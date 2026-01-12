import { Bell, Check, Clock, Filter, CheckCircle2, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import useFetch from '../../hooks/useFetch'; // Shared fetch logic
import { formatDateTime } from '../../utils/dateUtils'; // Shared date formatting
import { logError } from '../../utils/renderUtils'; // Standardized logging
import './NotificationsPage.css';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all'); // Filter state: 'all' or 'unread'

    // Centralized fetch logic using custom hook
    const {
        data: notifications = [],
        loading,
        execute: fetchNotifications,
        setData: setNotifications
    } = useFetch(() => notificationService.getNotifications(user?.id));

    useEffect(() => {
        if (user?.id) fetchNotifications(); // Load data on mount
    }, [user, fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            // Optimistically update local state
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            logError('MarkRead', error); // Standardized error reporting
        }
    };

    const handleMarkAllAsRead = async () => {
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;

        try {
            await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
            // Mark everything as read in one go
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            logError('MarkAllRead', error); // Standardized error reporting
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    if (loading && notifications.length === 0) {
        return (
            <div className="notifications-page-loading">
                <Bell className="animate-bounce" size={48} />
                <p>Catching up on your updates...</p>
            </div>
        );
    }

    return (
        <div className="notifications-page-container animate-fade-in">
            <header className="notifications-page-header">
                <div className="header-left">
                    <Bell size={24} className="header-icon" />
                    <h1>Notifications</h1>
                </div>
                <div className="header-actions">
                    <button
                        className="mark-all-read-btn"
                        onClick={handleMarkAllAsRead}
                        disabled={notifications.filter(n => !n.is_read).length === 0}
                    >
                        <CheckCircle2 size={16} />
                        Mark all as read
                    </button>
                </div>
            </header>

            <div className="notifications-body">
                <div className="notifications-tabs">
                    <button
                        className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                        <span className="count">{notifications.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                        <span className="count">{notifications.filter(n => !n.is_read).length}</span>
                    </button>
                </div>

                <div className="notifications-content">
                    {filteredNotifications.length === 0 ? (
                        <div className="empty-notifications">
                            <Inbox size={64} className="empty-icon" />
                            <h3>All caught up!</h3>
                            <p>You have no {filter === 'unread' ? 'unread' : ''} notifications at the moment.</p>
                        </div>
                    ) : (
                        <div className="notifications-full-list">
                            {filteredNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-page-item ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="item-indicator"></div>
                                    <div className="item-main">
                                        <div className="item-header">
                                            <span className="item-title">{notification.title}</span>
                                            <span className="item-time">
                                                <Clock size={12} />
                                                {formatDateTime(notification.created_at)} {/* Using shared utility */}
                                            </span>
                                        </div>
                                        <div className="item-message">{notification.message}</div>
                                    </div>
                                    {!notification.is_read && (
                                        <button
                                            className="item-mark-read"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                            }}
                                            title="Mark as read"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
