import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';

const DashboardRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkProjects = async () => {
            try {
                const projects = await projectService.getAll();
                if (projects && projects.length > 0) {
                    // Redirect to the first project's board
                    navigate(`/projects/${projects[0].id}/board`);
                } else {
                    // If no projects, stay here (which will render the layout but empty content, 
                    // actually better to go to project list so they can create one)
                    navigate('/projects');
                }
            } catch (error) {
                console.error("Failed to fetch projects for redirect", error);
                navigate('/projects');
            }
        };
        checkProjects();
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
            Loading your workspace...
        </div>
    );
};

export default DashboardRedirect;
