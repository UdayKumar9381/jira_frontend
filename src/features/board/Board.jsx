import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService, projectService, teamService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BoardColumn from './BoardColumn';
import CreateIssueModal from './CreateIssueModal';
import { usePermissions } from '../../hooks/usePermissions';
import { Search, Plus, Kanban } from 'lucide-react';
import './Board.css';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const normalizeStatus = (status) => {
    if (!status) return 'To Do';
    const s = status.toUpperCase().replace('_', ' ').trim();
    if (s.includes('PROGRESS')) return 'In Progress';
    if (s.includes('REVIEW') || s.includes('VERIFY')) return 'Review';
    if (s.includes('DONE') || s.includes('COMPLETED')) return 'Done';
    return 'To Do'; // Default fallback
};

const Board = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState({});
    const [selectedType, setSelectedType] = useState('All');
    const [selectedTeam, setSelectedTeam] = useState('All');
    const [teams, setTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [project, setProject] = useState(null);
    const { canCreateIssue, canDragDrop } = usePermissions();

    useEffect(() => {
        if (projectId) {
            teamService.getByProject(projectId)
                .then(setTeams)
                .catch(err => console.error("Failed to fetch teams", err));
        }
    }, [projectId]);

    const fetchIssues = async () => {
        try {
            const data = await storyService.getByProject(projectId);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        }
    };

    const fetchProject = async () => {
        try {
            // Ideally we should have a getById endpoint, but using getAll for now
            const projects = await projectService.getAll();
            const current = projects.find(p => String(p.id) === String(projectId));
            setProject(current);
        } catch (error) {
            console.error("Failed to fetch project", error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchIssues();
            fetchProject();
        }
    }, [projectId]);

    useEffect(() => {
        // Group issues by normalized status
        const grouped = {};
        COLUMNS.forEach(col => grouped[col] = []);

        issues.forEach(issue => {
            const normalized = normalizeStatus(issue.status);

            const queryMatch = !searchQuery ||
                issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.story_pointer.toLowerCase().includes(searchQuery.toLowerCase());

            const typeMatch = selectedType === 'All' ||
                (issue.issue_type || issue.type || 'STORY').toUpperCase() === selectedType.toUpperCase();

            const teamMatch = selectedTeam === 'All' || String(issue.team_id) === String(selectedTeam);

            if (queryMatch && typeMatch && teamMatch) {
                grouped[normalized].push(issue);
            }
        });
        setFilteredIssues(grouped);
    }, [issues, searchQuery, selectedType, selectedTeam]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        const oldStatus = source.droppableId;

        // Optimistic update
        const updatedIssues = issues.map(issue => {
            if (String(issue.id) === draggableId) {
                return { ...issue, status: newStatus };
            }
            return issue;
        });
        setIssues(updatedIssues);

        try {
            await storyService.updateStatus(parseInt(draggableId), newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert (not implemented for brevity)
        }
    };

    return (
        <div className="jira-board-container">
            <header className="jira-board-header glass">
                <div className="header-left">
                    <div className="board-title-group">
                        <Kanban className="title-icon" />
                        <h1>Kanban Board</h1>
                    </div>
                </div>

                <div className="header-right">
                    <div className="board-search glass-subtle">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="board-filters">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="jira-select"
                            >
                                <option value="All">All Types</option>
                                <option value="Story">Story</option>
                                <option value="Bug">Bug</option>
                                <option value="Task">Task</option>
                            </select>

                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="jira-select"
                            >
                                <option value="All">All Teams</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            {(selectedType !== 'All' || selectedTeam !== 'All' || searchQuery) && (
                                <button
                                    className="btn-clear-filters"
                                    onClick={() => { setSelectedType('All'); setSelectedTeam('All'); setSearchQuery(''); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#0052cc',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        padding: '0 8px',
                                        height: '32px'
                                    }}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                    {canCreateIssue() && (
                        <button className="create-issue-btn" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} />
                            <span>Create issue</span>
                        </button>
                    )}
                </div>
            </header>

            {project && project.description && (
                <div className="board-subtitle">
                    {project.description}
                </div>
            )}

            <main className="jira-board-canvas">
                <DragDropContext onDragEnd={onDragEnd}>
                    {COLUMNS.map(status => (
                        <BoardColumn
                            key={status}
                            id={status}
                            title={status}
                            isDragDisabled={!canDragDrop()}
                            issues={filteredIssues[status] || []}
                            teams={teams}
                            onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                        />
                    ))}
                </DragDropContext>
            </main>

            <CreateIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
                onIssueCreated={fetchIssues}
            />
        </div>
    );
};

export default Board;
