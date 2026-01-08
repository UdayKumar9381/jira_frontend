import React, { useState, useEffect } from 'react';
import {
  X, Minus, Maximize2, Minimize2,
  CheckSquare, Bookmark, AlertCircle,
  ChevronDown, Plus
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { storyService, authService, teamService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';
import './CreateIssueModal.css';

const CreateIssueModal = ({ isOpen, onClose, projectId, onIssueCreated, initialData = {} }) => {
  const defaultState = {
    title: '',
    description: '',
    assignee: '',
    assignee_id: '',
    reviewer: '',
    release_number: '',
    sprint_number: '',
    status: 'TODO',
    issue_type: 'Story',
    priority: 'Medium',
    start_date: '',
    end_date: '',
    parent_issue_id: '',
    team_id: ''
  };

  const [formData, setFormData] = useState({ ...defaultState, ...initialData });
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [createAnother, setCreateAnother] = useState(false);
  const [parentOptions, setParentOptions] = useState([]); 
  const [fetchingParents, setFetchingParents] = useState(false); // [NEW] Loading state

  const activeProjectId = projectId ? parseInt(projectId) : 1;

  // [NEW] Fetch Parent Options when Type changes and Project is active
  useEffect(() => {
    if (!formData.issue_type || !activeProjectId || !isOpen) {
        setParentOptions([]);
        return;
    }
    // Don't fetch for Epic as it has no parent
    if (formData.issue_type === 'Epic') {
        setParentOptions([]);
        return;
    }
    
    setFetchingParents(true);
    console.log(`Fetching parents for Project ${activeProjectId} Type ${formData.issue_type}`);
    
    storyService.getAvailableParents(activeProjectId, formData.issue_type)
        .then(data => {
            console.log("Parents fetched:", data);
            setParentOptions(Array.isArray(data) ? data : []);
        })
        .catch(err => {
            console.error("Failed to fetch parents", err);
            setParentOptions([]);
        })
        .finally(() => setFetchingParents(false));
        
  }, [formData.issue_type, activeProjectId, isOpen]);


  // Load initial data only once when modal opens
  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [isOpen]); // Only run when isOpen changes

  useEffect(() => {
    if (!isOpen) return;

    authService.getAllUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

    if (activeProjectId) {
      teamService.getByProject(activeProjectId)
        .then(data => setTeams(Array.isArray(data) ? data : []))
        .catch(() => setTeams([]));
    }
  }, [isOpen, activeProjectId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleAssigneeChange = (e) => {
    const userId = e.target.value;
    const selected = users.find(u => String(u.id) === userId);
    setFormData(prev => ({
      ...prev,
      assignee_id: userId || '',
      assignee: selected ? selected.username : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        project_id: parseInt(activeProjectId),
        assigned_to: formData.assignee_id ? parseInt(formData.assignee_id) : null,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        story_pointer: 0,
        support_doc: file,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      await storyService.create(payload);
      onIssueCreated();

      if (createAnother) {
        setFormData(prev => ({
          ...defaultState,
          assignee: prev.assignee,
          assignee_id: prev.assignee_id,
          team_id: prev.team_id,
          issue_type: prev.issue_type,
          priority: prev.priority
        }));
      } else {
        onClose();
        setFormData({ ...defaultState });
      }
    } catch (err) {
      console.error('Create issue failed', err);
      setError('Failed to create issue');
    } finally {
      setIsLoading(false);
    }
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'Epic': return <Bookmark size={16} color="#904ee2" fill="#904ee2" />; // Purple for Epic
      case 'Bug': return <AlertCircle size={16} color="#e5493a" />;
      case 'Story': return <Bookmark size={16} color="#65ba43" fill="#65ba43" />; // Green Story
      case 'Task': return <CheckSquare size={16} color="#4bade8" />;
      case 'Subtask': return <CheckSquare size={16} color="#4bade8" />; // Same for subtask for now
      default: return <CheckSquare size={16} color="#4bade8" />;
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="jira-create-minimized">
        <span>Create Issue</span>
        <div className="jira-create-controls">
          <button className="control-btn" onClick={() => setIsMinimized(false)}><Maximize2 size={14} /></button>
          <button className="control-btn close" onClick={onClose}><X size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="jira-create-overlay">
      <div className={`jira-create-modal ${isMaximized ? 'maximized' : ''} animate-slide-up`}>
        <div className="jira-create-header">
          <div className="header-title-group">
            <Plus size={20} color="#0052cc" />
            <h3>Create Issue</h3>
          </div>
          <div className="jira-create-controls">
            <button className="control-btn" onClick={() => setIsMinimized(true)} title="Minimize"><Minus size={18} /></button>
            <button className="control-btn" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Restore" : "Maximize"}>
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button className="control-btn close" onClick={onClose} title="Close"><X size={20} /></button>
          </div>
        </div>

        <div className="jira-create-scroll-area">
          <div className="jira-create-content">
            <form onSubmit={handleSubmit} id="create-issue-form" className="create-form-grid">
              <div className="form-main">
                <section className="form-section">
                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Summary"
                  />
                </section>

                <section className="form-section">
                  <label className="jira-label">Description</label>
                  <textarea
                    className="jira-textarea-premium"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                  />
                </section>

                <section className="form-section attachments-section">
                  <label className="jira-label">Attachments</label>
                  <div className="file-upload-zone">
                    <Plus size={24} color="#6b778c" />
                    <span>Click or drag file</span>
                    <input type="file" onChange={handleFileChange} className="file-input-hidden" />
                    {file && <div className="selected-file-badge">{file.name}</div>}
                  </div>
                </section>
              </div>

              <div className="form-sidebar">
                <div className="sidebar-field">
                  <label className="jira-label">Issue Type</label>
                  <div className="type-selector-wrapper">
                    <div className="jira-custom-select-premium" onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                      <div className="selected-type">
                        {getIssueTypeIcon(formData.issue_type)}
                        <span>{formData.issue_type}</span>
                      </div>
                      <ChevronDown size={14} />
                    </div>
                    {isTypeDropdownOpen && (
                      <div className="jira-dropdown-floating">
                        {['Epic', 'Story', 'Task', 'Bug', 'Subtask'].map(type => (
                          <div
                            key={type}
                            className={`dropdown-item ${formData.issue_type === type ? 'active' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, issue_type: type }));
                              setIsTypeDropdownOpen(false);
                            }}
                          >
                            {getIssueTypeIcon(type)}
                            <span>{type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* [NEW] Parent Issue Selector */}
                {/* Only show if not Epic and options exist (or at least type is not Epic) */}
                {formData.issue_type !== 'Epic' && (
                    <div className="sidebar-field">
                      <label className="jira-label">
                        {formData.issue_type === 'Story' ? 'Epic Link' : 
                         formData.issue_type === 'Subtask' ? 'Parent Task' : 
                         'Parent Issue'}
                      </label>
                      <select
                        className="jira-select-premium"
                        name="parent_issue_id"
                        value={formData.parent_issue_id || ''}
                        onChange={handleChange}
                        disabled={fetchingParents}
                      >
                        <option value="">
                            {fetchingParents ? "Loading..." : "None"}
                        </option>
                        {!fetchingParents && parentOptions.length === 0 && (
                             <option value="" disabled>No valid parents found</option>
                        )}
                        {parentOptions.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.story_code} - {p.title}
                            </option>
                        ))}
                      </select>
                    </div>
                )}

                <div className="sidebar-field">
                  <label className="jira-label">Assignee</label>
                  <select
                    className="jira-select-premium"
                    value={formData.assignee_id}
                    onChange={handleAssigneeChange}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                </div>

                <div className="sidebar-field">
                  <label className="jira-label">Team</label>
                  <select
                    className="jira-select-premium"
                    name="team_id"
                    value={formData.team_id}
                    onChange={handleChange}
                  >
                    <option value="">No Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="sidebar-field">
                  <label className="jira-label">Priority</label>
                  <select
                    className="jira-select-premium"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="sidebar-field">
                  <label className="jira-label">Sprint</label>
                  <input
                    type="text"
                    className="jira-input-premium"
                    name="sprint_number"
                    value={formData.sprint_number}
                    onChange={handleChange}
                    placeholder="Sprint 1"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="jira-create-footer">
          <div className="footer-left">
            <label className="create-another-checkbox">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={e => setCreateAnother(e.target.checked)}
              />
              <span>Create another</span>
            </label>
          </div>
          <div className="footer-right">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              form="create-issue-form"
              variant="primary"
              disabled={isLoading}
              className="create-submit-btn"
            >
              {isLoading ? 'Creating…' : (createAnother ? 'Create & Add Another' : 'Create')}
            </Button>
          </div>
        </div>
      </div>
      {error && <div className="error-toast">{error}</div>}
    </div>
  );
};

CreateIssueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.any,
  onIssueCreated: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default CreateIssueModal;
