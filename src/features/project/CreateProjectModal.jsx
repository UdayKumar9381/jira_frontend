import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { projectService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, onCreateTeam }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [prefix, setPrefix] = useState('');

    const isAdminMode = user?.view_mode === 'ADMIN';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createdProject, setCreatedProject] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !prefix) {
            setError("Name and prefix are required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Updated to pass 4 arguments
            const newProject = await projectService.create(name, prefix);
            onProjectCreated();
            // Instead of closing, show success state to prompt for team creation
            setCreatedProject(newProject);

            // Reset form fields
            setName('');
            setPrefix('');

        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                // Handle Pydantic validation errors
                setError(detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', '));
            } else if (typeof detail === 'object') {
                setError(JSON.stringify(detail));
            } else {
                setError(detail || 'Failed to create project');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setCreatedProject(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create Project">
            {createdProject ? (
                <div className="success-state" style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <h3 style={{ color: '#0052cc', marginBottom: '8px' }}>Project Created!</h3>
                    <p style={{ color: '#5e6c84', marginBottom: '24px' }}>
                        <strong>{createdProject.name}</strong> is ready.
                        Since no default team is created, you should create one now.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleClose(); // Close this modal
                                if (onCreateTeam) onCreateTeam(createdProject.id); // Trigger team creation
                            }}
                            className="w-full"
                        >
                            Create First Team
                        </Button>
                        <Button variant="subtle" onClick={handleClose}>
                            I'll do it later
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {!isAdminMode && (
                        <div className="mode-restriction-notice" style={{
                            background: '#fff0b3',
                            color: '#172b4d',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            borderLeft: '4px solid #ffab00',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>⚠️</span>
                            <span><strong>Developer mode is active.</strong> Only users in Admin mode can create projects.</span>
                        </div>
                    )}

                    <div style={{ marginBottom: 20, opacity: isAdminMode ? 1 : 0.6, pointerEvents: isAdminMode ? 'all' : 'none' }}>
                        <Input
                            label="Project Name *"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Jira Clone"
                            disabled={!isAdminMode}
                            onBlur={() => {
                                if (!prefix && name) {
                                    const generated = name.substring(0, 3).toUpperCase();
                                    setPrefix(generated);
                                }
                            }}
                        />
                        <div style={{ marginBottom: 20 }}>
                            <Input
                                label="Key *"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                                placeholder="e.g. JIRA"
                                maxLength={5}
                                disabled={!isAdminMode}
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: '#de350b', marginBottom: 16, fontSize: '12px' }}>{error}</div>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button type="button" variant="subtle" onClick={handleClose}>Cancel</Button>
                        {isAdminMode ? (
                            <Button type="submit" variant="primary" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Project'}
                            </Button>
                        ) : (
                            <div style={{ fontSize: '12px', color: '#5e6c84', alignSelf: 'center' }}>
                                Switch to Admin mode to create
                            </div>
                        )}
                    </div>
                </form>
            )}
        </Modal>
    );
};

CreateProjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onProjectCreated: PropTypes.func.isRequired,
    onCreateTeam: PropTypes.func
};

export default CreateProjectModal;
