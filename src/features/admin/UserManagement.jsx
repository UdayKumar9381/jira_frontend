import React, { useState, useEffect } from 'react';
import { Search, Edit2, User as UserIcon } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChangeRoleModal from './ChangeRoleModal';
import AdminProjects from './AdminProjects';
import ModeSwitchResponses from './ModeSwitchResponses';
import './UserManagement.css';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [activeTab, setActiveTab] = useState('USERS');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        setFilteredUsers(filtered);
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            setSuccessMessage('User role updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            await fetchUsers();
        } catch (err) {
            throw err;
        }
    };

    const getRoleBadgeClass = (role) => {
        const roleClasses = {
            ADMIN: 'role-badge-admin',
            DEVELOPER: 'role-badge-developer',
            TESTER: 'role-badge-tester'
        };
        return roleClasses[role] || 'role-badge-other';
    };

    if (loading && activeTab === 'USERS') {
        return <div className="user-management-loading">Loading users...</div>;
    }

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h1>Master Admin Dashboard</h1>
                <p className="user-management-subtitle">Manage workspace users and projects</p>

                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'USERS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('USERS')}
                    >
                        Users
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'PROJECTS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PROJECTS')}
                    >
                        Projects
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'RESPONSES' ? 'active' : ''}`}
                        onClick={() => setActiveTab('RESPONSES')}
                    >
                        Responses
                    </button>
                </div>
            </div>

            {error && <div className="user-management-error">{error}</div>}
            {successMessage && <div className="user-management-success">{successMessage}</div>}

            {activeTab === 'USERS' ? (
                <>
                    <div className="user-management-controls">
                        <div className="user-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search by username or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-box">
                            <label>Filter by role:</label>
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="DEVELOPER">Developer</option>
                                <option value="TESTER">Tester</option>
                            </select>
                        </div>
                    </div>

                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">
                                                        {user.profile_pic ? (
                                                            <img src={`/api${user.profile_pic}`} alt="" />
                                                        ) : (
                                                            user.username.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="user-name">{user.username}</span>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="change-role-btn"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <Edit2 size={14} />
                                                    Change Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-users">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : activeTab === 'PROJECTS' ? (
                <div className="admin-projects-wrapper">
                    <AdminProjects />
                </div>
            ) : (
                <div className="admin-responses-wrapper">
                    <ModeSwitchResponses onActionSuccess={fetchUsers} />
                </div>
            )}

            {selectedUser && (
                <ChangeRoleModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={handleRoleUpdate}
                />
            )}

        </div>
    );
};

export default UserManagement;
