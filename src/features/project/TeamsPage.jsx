import React, { useState, useEffect } from 'react';
import { Users, Loader2, RefreshCw } from 'lucide-react';
import { teamService, authService, projectService } from '../../services/api';
import TeamsView from './TeamsView';
import './ProjectSettings.css';

const TeamsPage = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, usersData] = await Promise.all([
                    projectService.getAll(),
                    authService.getAllUsers()
                ]);
                setProjects(projectsData);
                setUsers(usersData);
                if (projectsData.length > 0) {
                    setSelectedProjectId(projectsData[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch data for Teams page", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="settings-loading" style={{ height: 'calc(100vh - 64px)' }}>
                <Loader2 className="animate-spin" /> Loading teams context...
            </div>
        );
    }

    return (
        <div className="teams-page-container container-fluid p-4">
            <header className="teams-page-header mb-4 glass p-4 rounded-3 d-flex justify-content-between align-items-center">
                <div>
                    <h1 className="h3 mb-1">Teams</h1>
                    <p className="text-secondary mb-0">Manage and organize your project teams across the organization</p>
                </div>
                <div className="project-selector d-flex align-items-center gap-3">
                    <label className="jira-label mb-0">Select Project:</label>
                    <select
                        className="jira-select-premium"
                        style={{ width: '250px' }}
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {selectedProjectId ? (
                <TeamsView projectId={selectedProjectId} />
            ) : (
                <div className="empty-state glass p-5 text-center">
                    <Users size={48} className="mb-3 text-secondary" />
                    <h3>No Projects Available</h3>
                    <p>You need to create a project before you can manage teams.</p>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;
