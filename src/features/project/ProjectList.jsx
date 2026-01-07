import React, { useEffect, useState } from 'react';
import { projectService, storyService } from '../../services/api';
import CreateProjectModal from './CreateProjectModal';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import './ProjectList.css';
import {
    Hash,
    ChevronRight,
    Users,
    Layers,
    Search,
    Filter,
    MoreHorizontal
} from 'lucide-react';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [projectStats, setProjectStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchStats = async (projectsData) => {
        try {
            const stats = {};
            await Promise.all(projectsData.map(async (project) => {
                const stories = await storyService.getByProject(project.id);
                const total = stories.length;
                const done = stories.filter(s => ['Done', 'DONE', 'COMPLETED'].includes(s.status)).length;
                stats[project.id] = {
                    total,
                    done,
                    percent: total > 0 ? Math.round((done / total) * 100) : 0,
                    todo: stories.filter(s => ['To Do', 'TODO'].includes(s.status)).length,
                    inProgress: stories.filter(s => ['In Progress', 'IN_PROGRESS'].includes(s.status)).length,
                };
            }));
            setProjectStats(stats);
        } catch (error) {
            console.error("Failed to fetch project stats", error);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAll();
            setProjects(data);
            await fetchStats(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_prefix.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="project-list-loading">Loading your workspace...</div>;

    return (
        <div className="project-list-page animate-fade-in">
            <header className="project-list-header glass">
                <div className="header-left">
                    <h1>Projects</h1>
                    <div className="breadcrumb">Manage and switch between your active workspaces</div>
                </div>
                <div className="header-actions">
                    <div className="search-box glass-subtle">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Find a project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} variant="primary">Create Project</Button>
                </div>
            </header>

            <div className="project-list-content">
                <div className="project-grid">
                    {filteredProjects.map((project) => {
                        const stats = projectStats[project.id] || { total: 0, done: 0, percent: 0 };

                        return (
                            <div
                                key={project.id}
                                className="project-card glass-hover"
                                onClick={() => navigate(`/projects/${project.id}/summary`)}
                            >
                                <div className="card-top">
                                    <div className="project-avatar" style={{
                                        background: `linear-gradient(135deg, #0052cc, #00b8d9)`,
                                        boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)'
                                    }}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="project-info">
                                        <h3 className="project-name">{project.name}</h3>
                                        <span className="project-key">{project.project_prefix} Project</span>
                                    </div>
                                    <button className="more-btn"><MoreHorizontal size={18} /></button>
                                </div>

                                <div className="card-body">
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Issues</span>
                                            <span className="stat-value">{stats.total}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Progress</span>
                                            <span className="stat-value">{stats.percent}%</span>
                                        </div>
                                    </div>

                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${stats.percent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="footer-left">
                                    </div>
                                    <ChevronRight className="arrow-icon" size={18} />
                                </div>
                            </div>
                        );
                    })}

                    {filteredProjects.length === 0 && (
                        <div className="no-projects-empty">
                            <Layers size={48} color="#dfe1e6" />
                            <h3>No projects found</h3>
                            <p>Get started by creating your first project.</p>
                            <Button onClick={() => setIsModalOpen(true)} variant="primary">New Project</Button>
                        </div>
                    )}
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={fetchProjects}
            />
        </div>
    );
};

export default ProjectList;
