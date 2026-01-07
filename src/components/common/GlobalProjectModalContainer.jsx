import React, { useState, useEffect } from 'react';
import CreateProjectModal from '../../features/project/CreateProjectModal';

const GlobalProjectModalContainer = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-create-project-modal', handleOpen);
        return () => window.removeEventListener('open-create-project-modal', handleOpen);
    }, []);

    const handleCreated = () => {
        window.location.reload();
        // Force reload to update UI/Sidebar with new project
    };

    return (
        <CreateProjectModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onProjectCreated={handleCreated}
        />
    );
};

export default GlobalProjectModalContainer;
