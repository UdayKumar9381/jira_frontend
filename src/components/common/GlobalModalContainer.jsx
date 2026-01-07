import React, { useState, useEffect } from 'react';
import CreateIssueModal from '../../features/board/CreateIssueModal';
import CreateProjectModal from '../../features/project/CreateProjectModal';
import { useLocation } from 'react-router-dom';

const GlobalModalContainer = () => {
    const [isIssueOpen, setIsIssueOpen] = useState(false);
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const location = useLocation();

    // Attempt to extract projectId from URL if present
    const projectIdMatch = location.pathname.match(/\/projects\/(\d+)/);
    //if projectId is not found, it will return null
    const contextProjectId = projectIdMatch ? projectIdMatch[1] : null;

    useEffect(() => {
        const handleOpenIssue = () => setIsIssueOpen(true);
        const handleOpenProject = () => setIsProjectOpen(true);

        window.addEventListener('open-create-modal', handleOpenIssue);
        window.addEventListener('open-create-project-modal', handleOpenProject);

        return () => {
            window.removeEventListener('open-create-modal', handleOpenIssue);
            window.removeEventListener('open-create-project-modal', handleOpenProject);
        };
    }, []);

    const handleIssueCreated = () => {
        // Trigger refresh if on a board
        window.location.reload();
    };

    const handleProjectCreated = (newProject) => {
        setIsProjectOpen(false);
        // Optionally navigate to the new project or reload
        window.location.reload();
    };

    return (
        <>
            <CreateIssueModal
                isOpen={isIssueOpen}
                onClose={() => setIsIssueOpen(false)}
                projectId={contextProjectId} // Pass generic if null
                onIssueCreated={handleIssueCreated}
            />
            <CreateProjectModal
                isOpen={isProjectOpen}
                onClose={() => setIsProjectOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </>
    );
};

export default GlobalModalContainer;
