import React, { useState, useEffect } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import ManageTeamsModal from './ManageTeamsModal';
import './AdminProjects.css';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAll();
            setProjects(data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };



    const [selectedProjectForTeams, setSelectedProjectForTeams] = useState(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_prefix.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="admin-projects-loading">Loading projects list...</div>;

    return (
        <div className="admin-projects-container">
            <div className="admin-projects-controls">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="projects-table-container">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Key</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <div className="project-cell">
                                            <div className="project-icon" style={{
                                                background: `linear-gradient(135deg, #0052cc, #00b8d9)`
                                            }}>
                                                {project.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="project-name-text">{project.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="key-badge">{project.project_prefix}</span></td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn view"
                                            onClick={() => navigate(`/projects/${project.id}/summary`)}
                                            title="View Project"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                        <button
                                            className="action-btn teams"
                                            style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
                                            onClick={() => setSelectedProjectForTeams(project)}
                                            title="Manage Teams"
                                        >
                                            Manage Teams
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">No projects found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedProjectForTeams && (
                <ManageTeamsModal
                    project={selectedProjectForTeams}
                    onClose={() => setSelectedProjectForTeams(null)}
                />
            )}
        </div>
    );
};

export default AdminProjects;
