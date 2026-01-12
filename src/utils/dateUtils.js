/**
 * Centralized date and time formatting utilities to prevent repetition.
 */

/**
 * Formats a date string into a standard, readable format.
 * Example: Jan 12, 2026, 03:00 PM
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    // Append 'Z' to ensure UTC parsing if it's a standard ISO-like string from backend
    const date = new Date(dateString.includes('Z') ? dateString : dateString + 'Z');

    if (isNaN(date.getTime())) return dateString; // Fallback to raw string if invalid

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Formats a date string into a relative human-readable format.
 * Example: "Just now", "2h ago", "Yesterday"
 */
export const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown date';

    try {
        const date = new Date(dateString.includes('Z') ? dateString : dateString + 'Z');
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Invalid date'; // Error fallback
    }
};
