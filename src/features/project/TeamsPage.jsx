import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import TeamsView from './TeamsView';
import './ProjectSettings.css';

const TeamsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const projects = await projectService.getAll();
                const found = projects.find(p => String(p.id) === String(projectId));
                setProject(found);
            } catch (error) {
                console.error("Failed to fetch project for Teams page", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

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
                    <h1 className="h3 mb-1">Teams {project ? `| ${project.name}` : ''}</h1>
                    <p className="text-secondary mb-0">Manage and organize teams for {project ? project.name : 'this project'}</p>
                </div>
            </header>

            {projectId ? (
                <TeamsView projectId={projectId} />
            ) : (
                <div className="empty-state glass p-5 text-center">
                    <Users size={48} className="mb-3 text-secondary" />
                    <h3>No Project Selected</h3>
                    <p>Please select a project to manage its teams.</p>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;