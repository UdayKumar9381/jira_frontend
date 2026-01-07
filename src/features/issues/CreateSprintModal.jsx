import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import './Issues.css';

const CreateSprintModal = ({ isOpen, onClose, onCreate, backlogIssues = [] }) => {
    const [sprintSelection, setSprintSelection] = useState('S1');
    const [customSprint, setCustomSprint] = useState('');
    const [duration, setDuration] = useState('2w');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sprintGoal, setSprintGoal] = useState('');

    // Selection state
    const [selectedStoryIds, setSelectedStoryIds] = useState([]);

    useEffect(() => {
        if (isOpen) {
            // Default to selection of nothing or maybe everything?
            // User said "if only i select all stories then only it has to create sprint for all"
            // So let's default to empty or just let them pick.
            setSelectedStoryIds([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleToggleStory = (id) => {
        setSelectedStoryIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedStoryIds.length === backlogIssues.length) {
            setSelectedStoryIds([]);
        } else {
            setSelectedStoryIds(backlogIssues.map(i => i.id));
        }
    };

    const handleSubmit = () => {
        const finalSprint = sprintSelection === 'Custom' ? customSprint : sprintSelection;
        if (!finalSprint) return alert('Please specify a sprint');
        if (selectedStoryIds.length === 0) return alert('Please select at least one story');

        onCreate({
            sprint_number: finalSprint,
            duration,
            start_date: startDate,
            end_date: endDate,
            goal: sprintGoal,
            selectedStoryIds // Pass the selected IDs back
        });
        onClose();
    };

    return (
        <div className="jira-modal-overlay">
            <div className="jira-modal-content" style={{ width: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '500' }}>Start Sprint</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div className="jira-field" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5e6c84', marginBottom: '4px' }}>Sprint *</label>
                    <select
                        className="jira-input"
                        value={sprintSelection}
                        onChange={(e) => setSprintSelection(e.target.value)}
                        style={{ width: '100%', height: '40px' }}
                    >
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                        <option value="S4">S4</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>

                {sprintSelection === 'Custom' && (
                    <div className="jira-field" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5e6c84', marginBottom: '4px' }}>Sprint Name *</label>
                        <input
                            className="jira-input"
                            placeholder="e.g. Sprint 5"
                            value={customSprint}
                            onChange={(e) => setCustomSprint(e.target.value)}
                            style={{ width: '100%', height: '40px' }}
                        />
                    </div>
                )}

                {/* Backlog Selection List */}
                <div className="jira-field" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#5e6c84' }}>Select Backlog Stories *</label>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#0052cc',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {selectedStoryIds.length === backlogIssues.length ? 'Deselect All' : 'Select All Backlog'}
                        </button>
                    </div>

                    <div style={{
                        border: '1px solid #dfe1e6',
                        borderRadius: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: '#f4f5f7'
                    }}>
                        {backlogIssues.length === 0 ? (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#5e6c84' }}>No stories in backlog</div>
                        ) : (
                            backlogIssues.map(issue => (
                                <div
                                    key={issue.id}
                                    onClick={() => handleToggleStory(issue.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        borderBottom: '1px solid #dfe1e6',
                                        cursor: 'pointer',
                                        background: selectedStoryIds.includes(issue.id) ? '#deebff' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '3px',
                                        border: '2px solid #0052cc',
                                        marginRight: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: selectedStoryIds.includes(issue.id) ? '#0052cc' : 'white'
                                    }}>
                                        {selectedStoryIds.includes(issue.id) && <Check size={14} color="white" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '11px', color: '#5e6c84', fontWeight: '700' }}>{issue.story_pointer}</div>
                                        <div style={{ fontSize: '14px', color: '#172b4d' }}>{issue.title}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5e6c84', marginTop: '4px' }}>
                        Selected: <strong>{selectedStoryIds.length}</strong> issues
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div className="jira-field">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5e6c84', marginBottom: '4px' }}>Start date</label>
                        <input
                            type="datetime-local"
                            className="jira-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: '100%', height: '40px' }}
                        />
                    </div>
                    <div className="jira-field">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5e6c84', marginBottom: '4px' }}>End date</label>
                        <input
                            type="datetime-local"
                            className="jira-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ width: '100%', height: '40px' }}
                        />
                    </div>
                </div>

                <div className="jira-field" style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5e6c84', marginBottom: '4px' }}>Sprint goal</label>
                    <textarea
                        className="jira-input"
                        rows="3"
                        value={sprintGoal}
                        onChange={(e) => setSprintGoal(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>Start</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateSprintModal;
