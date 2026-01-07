import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { projectService } from '../../services/api';
import PropTypes from 'prop-types';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [prefix, setPrefix] = useState('');


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
            await projectService.create(name, prefix);
            onProjectCreated();
            onClose();
            // Reset form
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Project">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <Input
                        label="Project Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jira Clone"
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
                        />
                    </div>
                </div>

                {error && <div style={{ color: '#de350b', marginBottom: 16, fontSize: '12px' }}>{error}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button type="button" variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

CreateProjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onProjectCreated: PropTypes.func.isRequired,
};

export default CreateProjectModal;
