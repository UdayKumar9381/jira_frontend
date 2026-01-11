import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, UserPlus, Trash2, Shield, Loader2, X, CheckCircle, Mail } from 'lucide-react';
import { teamService, authService } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';
import './TeamDetailsPage.css';

const TeamDetailsPage = () => {
    const { projectId, teamId } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = usePermissions();
    const { user } = useAuth();

    const [team, setTeam] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeamDetails();
        fetchAllUsers();
    }, [teamId]);

    const fetchTeamDetails = async () => {
        try {
            setLoading(true);
            const data = await teamService.getById(teamId);
            setTeam(data);
        } catch (err) {
            console.error("Failed to fetch team details", err);
            setError("Failed to load team details");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const users = await authService.getAllUsers();
            setAllUsers(users);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleAddMembers = async () => {
        if (selectedMembers.length === 0) return;

        setSaving(true);
        try {
            const currentMemberIds = team.members?.map(m => m.id) || [];
            const updatedMemberIds = [...new Set([...currentMemberIds, ...selectedMembers])];

            const updateData = {
                name: team.name,
                lead_id: team.lead_id,
                member_ids: updatedMemberIds,
                project_id: Number(projectId)
            };

            console.log("Updating team with data:", updateData);
            await teamService.update(teamId, updateData);

            setShowAddMemberModal(false);
            setSelectedMembers([]);
            await fetchTeamDetails();
        } catch (err) {
            console.error("Failed to add members", err);
            const errorDetail = err.response?.data?.detail || err.message;
            alert(`Failed to add members: ${errorDetail}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Remove this member from the team?")) return;

        setSaving(true);
        try {
            const updatedMemberIds = team.members
                .filter(m => m.id !== memberId)
                .map(m => m.id);

            const updateData = {
                name: team.name,
                lead_id: team.lead_id,
                member_ids: updatedMemberIds,
                project_id: Number(projectId)
            };

            console.log("Removing member, updating team with data:", updateData);
            await teamService.update(teamId, updateData);

            await fetchTeamDetails();
        } catch (err) {
            console.error("Failed to remove member", err);
            const errorDetail = err.response?.data?.detail || err.message;
            alert(`Failed to remove member: ${errorDetail}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm(`Delete team "${team.name}"? This action cannot be undone.`)) return;

        try {
            await teamService.delete(teamId);
            navigate(`/projects/${projectId}/teams`);
        } catch (err) {
            console.error("Failed to delete team", err);
            const errorDetail = err.response?.data?.detail || err.message;
            alert(`Failed to delete team: ${errorDetail}`);
        }
    };

    const toggleMemberSelection = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Check if current user can manage this team (admin or team lead)
    const canManageTeam = () => {
        if (!user || !team) return false;
        // Admin can always manage
        if (isAdmin()) return true;
        // Team lead can manage their own team
        return team.lead_id === user.id;
    };

    const availableUsers = allUsers.filter(user =>
        user.role !== 'ADMIN' && !team?.members?.some(member => member.id === user.id)
    );

    if (loading) {
        return (
            <div className="team-details-loading">
                <Loader2 className="spinner" size={40} />
                <p>Loading team details...</p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="team-details-error">
                <div className="error-content">
                    <h2>{error || "Team not found"}</h2>
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="team-details-page">
            {/* Header */}
            <div className="team-details-header">
                <button className="btn-back-icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-content">
                    <div className="team-icon-large">
                        <Users size={28} />
                    </div>
                    <div className="header-info">
                        <h1>{team.name}</h1>
                        <p className="team-meta">{team.members?.length || 0} team members</p>
                    </div>
                </div>
                {canManageTeam() && (
                    <button className="btn-delete-team" onClick={handleDeleteTeam}>
                        <Trash2 size={18} />
                        Delete Team
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="team-details-content">
                {/* Team Lead Card */}
                <div className="detail-card lead-card">
                    <div className="card-header">
                        <Shield size={20} />
                        <h2>Team Lead</h2>
                    </div>
                    <div className="lead-info">
                        <div className="user-avatar large">
                            {(team.lead?.username || allUsers.find(u => u.id === team.lead_id)?.username || 'N').charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <h3>{team.lead?.username || allUsers.find(u => u.id === team.lead_id)?.username || 'No Leader Assigned'}</h3>
                            {team.lead?.email && (
                                <p className="user-email">
                                    <Mail size={14} />
                                    {team.lead.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Members Card */}
                <div className="detail-card members-card">
                    <div className="card-header">
                        <Users size={20} />
                        <h2>Team Members</h2>
                        {canManageTeam() && (
                            <button className="btn-add-member" onClick={() => setShowAddMemberModal(true)}>
                                <UserPlus size={18} />
                                Add Members
                            </button>
                        )}
                    </div>

                    <div className="members-grid">
                        {team.members && team.members.length > 0 ? (
                            team.members.map(member => (
                                <div key={member.id} className="member-card">
                                    <div className="member-info">
                                        <div className="user-avatar">
                                            {member.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <h4>{member.username}</h4>
                                            <p className="user-email">
                                                <Mail size={12} />
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    {canManageTeam() && member.id !== team.lead_id && (
                                        <button
                                            className="btn-remove-member"
                                            onClick={() => handleRemoveMember(member.id)}
                                            disabled={saving}
                                            title="Remove member"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <Users size={48} />
                                <p>No members in this team yet</p>
                                {canManageTeam() && (
                                    <button className="btn-add-first" onClick={() => setShowAddMemberModal(true)}>
                                        <UserPlus size={16} />
                                        Add First Member
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Members Modal */}
            {showAddMemberModal && (
                <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <UserPlus size={22} />
                                <h3>Add Team Members</h3>
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowAddMemberModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {availableUsers.length > 0 ? (
                                <div className="users-selection-grid">
                                    {availableUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className={`user-select-card ${selectedMembers.includes(user.id) ? 'selected' : ''}`}
                                            onClick={() => toggleMemberSelection(user.id)}
                                        >
                                            <div className="user-avatar small">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info-compact">
                                                <h4>{user.username}</h4>
                                                <p>{user.email}</p>
                                            </div>
                                            {selectedMembers.includes(user.id) && (
                                                <CheckCircle className="check-icon" size={18} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-modal">
                                    <Users size={40} />
                                    <p>All users are already members of this team</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowAddMemberModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleAddMembers}
                                disabled={saving || selectedMembers.length === 0}
                            >
                                {saving ? 'Adding...' : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDetailsPage;
