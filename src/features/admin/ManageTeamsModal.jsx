import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Save, Users } from 'lucide-react';
import { teamService, adminService } from '../../services/api';
import './ManageTeamsModal.css';

const ManageTeamsModal = ({ project, onClose }) => {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [selectedLead, setSelectedLead] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [project.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teamsData, usersData] = await Promise.all([
                teamService.getByProject(project.id),
                adminService.getAllUsers()
            ]);
            setTeams(teamsData);
            setUsers(usersData);
        } catch (err) {
            console.error("Failed to load data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (team) => {
        setEditingTeamId(team.id);
        setSelectedLead(team.lead_id || '');
    };

    const handleSave = async (teamId) => {
        try {
            setSaving(true);
            await teamService.update(teamId, {
                lead_id: selectedLead ? parseInt(selectedLead) : null
            });

            // Update local state
            setTeams(teams.map(t =>
                t.id === teamId
                    ? { ...t, lead_id: selectedLead ? parseInt(selectedLead) : null }
                    : t
            ));
            setEditingTeamId(null);
        } catch (err) {
            console.error("Failed to update team lead", err);
            alert("Failed to update team lead");
        } finally {
            setSaving(false);
        }
    };

    const getLeadName = (leadId) => {
        if (!leadId) return "Unassigned";
        const user = users.find(u => u.id === leadId);
        return user ? user.username : "Unknown";
    };

    if (!project) return null;

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content manage-teams-modal animate-slide-up">
                <div className="modal-header">
                    <div className="header-left">
                        <Users className="header-icon" />
                        <div>
                            <h2>Manage Teams</h2>
                            <p className="modal-subtitle">Project: {project.name}</p>
                        </div>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">Loading teams...</div>
                    ) : teams.length === 0 ? (
                        <div className="empty-state">No teams found in this project.</div>
                    ) : (
                        <div className="teams-list">
                            {teams.map(team => (
                                <div key={team.id} className="team-item glass-panel">
                                    <div className="team-info">
                                        <h4>{team.name}</h4>
                                        <div className="team-meta">
                                            <span className="current-lead-label">Current Lead:</span>
                                            <span className="current-lead-value">
                                                <UserIcon size={14} />
                                                {getLeadName(team.lead_id)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="team-actions">
                                        {editingTeamId === team.id ? (
                                            <div className="edit-lead-controls">
                                                <select
                                                    value={selectedLead}
                                                    onChange={(e) => setSelectedLead(e.target.value)}
                                                    className="jira-select"
                                                >
                                                    <option value="">Select Lead...</option>
                                                    {users
                                                        .filter(u => u.role !== 'ADMIN')
                                                        .map(user => (
                                                            <option key={user.id} value={user.id}>
                                                                {user.username} ({user.role})
                                                            </option>
                                                        ))}
                                                </select>
                                                <button
                                                    className="btn-save-sm"
                                                    onClick={() => handleSave(team.id)}
                                                    disabled={saving}
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    className="btn-cancel-sm"
                                                    onClick={() => setEditingTeamId(null)}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn-text"
                                                onClick={() => handleEditClick(team)}
                                            >
                                                Change Lead
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTeamsModal;
