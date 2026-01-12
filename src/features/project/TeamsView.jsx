import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, User, Loader2, ArrowRight, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { authService } from '../../services/authService';
import CreateTeamModal from './CreateTeamModal';
import './ProjectSettings.css'; // Leverage existing styles

const TeamsView = ({ projectId: propProjectId }) => {
    const { projectId: paramsProjectId } = useParams();
    const projectId = propProjectId || paramsProjectId;
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchTeams = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            console.log(`Fetching teams for project: ${projectId}`);
            const data = await teamService.getByProject(projectId);
            setTeams(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch teams", error);
            // Only show full-page error if we don't have existing teams
            if (teams.length === 0) {
                setError("The server encountered an error while loading teams. This may be due to a bug in the backend router.");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;

        try {
            await teamService.delete(teamId);
            setTeams(prev => prev.filter(t => t.id !== teamId));
        } catch (err) {
            console.error("Failed to delete team", err);
            const errorDetail = err.response?.data?.detail || err.message;
            alert(`Failed to delete team: ${errorDetail}`);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchUsers();

        // ⏱️ REAL-TIME POLLING: Refresh every 30 seconds
        const interval = setInterval(() => {
            fetchTeams(true); // Silent update in background
        }, 30000);

        return () => clearInterval(interval);
    }, [projectId]);

    if (loading) return <div className="settings-loading"><Loader2 className="animate-spin" /> Loading teams...</div>;

    return (
        <div className="teams-view animate-fade-in">
            <div className="section-header">
                <div>
                    <h3>Project Teams</h3>
                    <p>Manage teams and members for this project</p>
                    {lastUpdated && (
                        <span className="sync-indicator" style={{ fontSize: '11px', color: '#5e6c84', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <RefreshCw size={10} className={loading && !error ? 'animate-spin' : ''} />
                            Last sync: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
                <div className="header-button-group" style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn-upload"
                        onClick={() => fetchTeams()}
                        disabled={loading}
                        style={{ height: '36px', padding: '0 12px' }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                        Refresh
                    </button>
                    <button className="btn-save btn-primary" onClick={() => setShowCreateModal(true)} style={{ height: '36px' }}>
                        <Plus size={16} /> Create Team
                    </button>
                </div>
            </div>

            <div className="teams-grid">
                {error && (
                    <div className="error-banner" style={{ margin: '20px 0' }}>
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {!error && teams.length === 0 ? (
                    <div className="empty-teams glass">
                        <Users size={48} className="empty-icon" />
                        <p>No teams created yet for this project.</p>
                        <button className="btn-upload" onClick={() => setShowCreateModal(true)}>Add your first team</button>
                    </div>
                ) : (
                    !error && teams.map(team => (
                        <div
                            key={team.id}
                            className="team-card glass"
                            onClick={() => navigate(`/projects/${projectId}/teams/${team.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="team-card-header">
                                <div className="team-icon">
                                    <Users size={20} />
                                </div>
                                <div className="team-info">
                                    <h4>{team.name}</h4>
                                    <span className="team-meta">{team.members?.length || 0} members</span>
                                </div>
                            </div>

                            <div className="team-leader">
                                <Shield size={14} className="leader-icon" title="Team Lead" />
                                <span>{team.lead?.username || users.find(u => u.id === team.lead_id)?.username || 'No Leader'}</span>
                            </div>

                            <div className="team-members">
                                {team.members && team.members.slice(0, 5).map((member, idx) => (
                                    <div key={idx} className="member-avatar-mini" title={member.username}>
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {team.members && team.members.length > 5 && (
                                    <div className="member-avatar-mini more">
                                        +{team.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateTeamModal
                    projectId={projectId}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchTeams();
                    }}
                    users={users}
                />
            )}
        </div>
    );
};

export default TeamsView;
