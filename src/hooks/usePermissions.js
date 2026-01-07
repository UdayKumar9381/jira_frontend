import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for role-based permission checks
 * Roles: ADMIN, DEVELOPER, TESTER, OTHER
 */
export const usePermissions = () => {
    const { user } = useAuth();
    const userRole = user?.role?.toUpperCase() || 'OTHER';

    // Check if user can create projects
    const canCreateProject = () => {
        return userRole === 'ADMIN';
    };

    // Check if user can create issues
    const canCreateIssue = (issueType = null) => {
        if (userRole === 'ADMIN' || userRole === 'DEVELOPER') {
            return true;
        }
        if (userRole === 'TESTER') {
            // Testers can only create Bug type issues
            return !issueType || issueType.toUpperCase() === 'BUG';
        }
        return false;
    };

    // Check if user can edit an issue
    const canEditIssue = (issue) => {
        if (userRole === 'ADMIN') {
            return true; // Admin can edit any issue
        }
        if (userRole === 'DEVELOPER' || userRole === 'TESTER') {
            // Can only edit their own assigned issues
            return issue?.assignee_id === user?.id;
        }
        return false; // OTHER role cannot edit
    };

    // Check if user can delete issues
    const canDeleteIssue = () => {
        return userRole === 'ADMIN';
    };

    // Check if user can manage users
    const canManageUsers = () => {
        return userRole === 'ADMIN';
    };

    // Check if user can change sprint/release
    const canChangeSprintRelease = () => {
        return userRole === 'ADMIN' || userRole === 'DEVELOPER';
    };

    // Check if user can update status
    const canUpdateStatus = () => {
        return userRole === 'ADMIN' || userRole === 'DEVELOPER' || userRole === 'TESTER';
    };

    // Check if user can assign issues to others
    const canAssignIssues = () => {
        return userRole === 'ADMIN';
    };

    // Check if user can drag and drop issues
    const canDragDrop = () => {
        return userRole !== 'OTHER';
    };

    // Check if user has read-only access
    const isReadOnly = () => {
        return userRole === 'OTHER';
    };

    // Get available issue types for user
    const getAvailableIssueTypes = () => {
        if (userRole === 'TESTER') {
            return ['Bug'];
        }
        return ['Story', 'Task', 'Bug'];
    };

    // Check if user is admin
    const isAdmin = () => {
        return userRole === 'ADMIN';
    };

    // Check if team field is editable
    const canEditTeamField = () => {
        return userRole === 'ADMIN' || userRole === 'DEVELOPER';
    };

    // Check if user is a team lead (role-wise)
    const isTeamLead = () => {
        return userRole === 'ADMIN' || userRole === 'DEVELOPER';
    };

    // Check if issue is read-only
    const isIssueReadOnly = (issue) => {
        return !canEditIssue(issue);
    };

    return {
        userRole,
        isAdmin,
        canCreateProject,
        canCreateIssue,
        canEditIssue,
        canDeleteIssue,
        canManageUsers,
        canChangeSprintRelease,
        canUpdateStatus,
        canAssignIssues,
        canDragDrop,
        isReadOnly,
        getAvailableIssueTypes,
        canEditTeamField,
        isTeamLead,
        isIssueReadOnly,
    };
};

export default usePermissions;
