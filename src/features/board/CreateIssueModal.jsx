import React, { useState, useEffect } from 'react';
import {
  X, Minus, Maximize2, Minimize2,
  CheckSquare, Bookmark, AlertCircle,
  ChevronDown, Plus
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { storyService } from '../../services/storyService';
import { authService } from '../../services/authService';
import { teamService } from '../../services/teamService';
import { syncTeamMembership } from '../../utils/teamUtils';
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
  const [fetchingParents, setFetchingParents] = useState(false);
  const [globalEpics, setGlobalEpics] = useState([]); // [NEW] For global mode
  const [isGlobalMode, setIsGlobalMode] = useState(false);

  // Determine mode
  useEffect(() => {
    setIsGlobalMode(!projectId);
  }, [projectId]);

  const activeProjectId = projectId ? parseInt(projectId) : null;

  // [NEW] Fetch Parent Options / Global Epics
  useEffect(() => {
    if (!isOpen) return;

    const fetchParents = async () => {
      setFetchingParents(true);
      try {
        // Case 1: Global Mode (Navbar) -> Fetch ALL Epics
        if (isGlobalMode) {
          const epics = await storyService.getAllEpics();
          setGlobalEpics(epics);
          // Also reset parent options for selector
          setParentOptions(epics);
        }
        // Case 2: Project Mode (Board) -> Fetch Context Options
        else if (activeProjectId && formData.issue_type) {
          if (formData.issue_type === 'Epic') {
            setParentOptions([]); // Epic has no parent
          } else {
            const parents = await storyService.getAvailableParents(activeProjectId, formData.issue_type);
            setParentOptions(Array.isArray(parents) ? parents : []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch parents/epics", err);
        setParentOptions([]);
      } finally {
        setFetchingParents(false);
      }
    };

    fetchParents();
  }, [formData.issue_type, activeProjectId, isOpen, isGlobalMode]);

  // [NEW] Handle Epic Selection in Global Mode to set context
  const handleParentChange = async (e) => {
    const parentId = e.target.value;

    // Update form data first
    setFormData(prev => ({ ...prev, parent_issue_id: parentId }));

    // If in Global Mode, finding the parent (Epic) sets the Project Context
    if (isGlobalMode && parentId) {
      const selectedEpic = globalEpics.find(ep => String(ep.id) === parentId);
      if (selectedEpic) {
        console.log("Global Mode: Selected Epic", selectedEpic);
        // Set implicit project ID
        setFormData(prev => ({
          ...prev,
          parent_issue_id: parentId,
          project_id: selectedEpic.project_id
        }));

        // Fetch Teams for this project
        try {
          const teamsData = await teamService.getByProject(selectedEpic.project_id);
          setTeams(Array.isArray(teamsData) ? teamsData : []);
        } catch (err) {
          console.error("Failed to fetch teams for derived project", err);
        }
      }
    } else {
      handleChange(e);
    }
  };


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

  // Determine permissions for the selected team
  const selectedTeam = teams.find(t => t.id == formData.team_id);
  const isTeamLead = (selectedTeam?.lead_id == user?.id) || (selectedTeam?.lead?.id == user?.id);

  // Check if user is a lead of ANY team in this project (Project Lead)
  const isProjectLead = teams.some(t => (t.lead_id == user?.id) || (t.lead?.id == user?.id));

  const isAdmin = user?.view_mode === 'ADMIN';

  // Logic: Allow assignment if Admin OR Team Lead OR Project Lead.
  const canAssignOthers = isAdmin || isTeamLead || isProjectLead;

  // Debug permissions
  useEffect(() => {
    // Only log if permissions are restrictive and user is present
    if (user) {
      console.log('[CreateIssueModal] Permission Check:', {
        activeProjectId,
        teamId: formData.team_id,
        userId: user.id,
        isTeamLead,
        isProjectLead,
        isAdmin,
        canAssignOthers
      });
    }
  }, [formData.team_id, isTeamLead, isProjectLead, isAdmin, user]);

  // Enforce self-assignment for non-leads when team is selected
  useEffect(() => {
    if (!isOpen) return;

    // If I'm not allowed to assign others, force assignee to myself
    if (!canAssignOthers && user) {
      setFormData(prev => {
        // Only update if not already set to self (to avoid infinite loop if user changes)
        if (prev.assignee_id !== user.id) {
          return {
            ...prev,
            assignee_id: user.id,
            assignee: user.username
          };
        }
        return prev;
      });
    }
  }, [formData.team_id, canAssignOthers, user, isOpen, isProjectLead]);


  const handleAssigneeChange = (e) => {
    const rawValue = e.target.value;
    const userId = rawValue ? parseInt(rawValue, 10) : '';
    const selected = users.find(u => u.id === userId);
    setFormData(prev => ({
      ...prev,
      assignee_id: userId || '',
      assignee: selected ? selected.username : ''
    }));

    console.debug('Assignee selected', { rawValue, parsedId: userId, selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const assigned_to_value = (typeof formData.assignee_id === 'number' && !Number.isNaN(formData.assignee_id))
        ? formData.assignee_id
        : (formData.assignee_id ? parseInt(formData.assignee_id, 10) : null);

      const payload = {
        ...formData,
        project_id: activeProjectId || (formData.project_id ? parseInt(formData.project_id) : null),
        assigned_to: assigned_to_value || null,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        story_pointer: 0,
        support_doc: file,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      // Ensure assignee is part of the team *before* creating the issue. Some backend logic
      // may reject or override assigned_to if the user is not a member of the selected team.
      if (payload.team_id && payload.assigned_to) {
        console.debug('Syncing team membership before create', { team_id: payload.team_id, assigned_to: payload.assigned_to });
        await syncTeamMembership(payload.team_id, payload.assigned_to);
      }

      console.debug('Create issue payload:', payload);
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

                <section className="form-section">
                  <div className="form-row-dates">
                    <div className="date-group">
                      <label className="jira-label">Start Date</label>
                      <input
                        type="date"
                        className="jira-input-premium"
                        name="start_date"
                        value={formData.start_date || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="date-group">
                      <label className="jira-label">End Date</label>
                      <input
                        type="date"
                        className="jira-input-premium"
                        name="end_date"
                        value={formData.end_date || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
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
                      {/* Show "Epic Link" for Story/Global, or "Parent" for others */}
                      {isGlobalMode ? "Epic Link" : (
                        formData.issue_type === 'Story' ? 'Epic Link' :
                          formData.issue_type === 'Subtask' ? 'Parent Task' :
                            'Parent Issue')}
                    </label>
                    <select
                      className="jira-select-premium"
                      name="parent_issue_id"
                      value={formData.parent_issue_id || ''}
                      onChange={handleParentChange}
                      disabled={fetchingParents}
                      required={formData.issue_type !== 'Epic'} // Enforce parent for non-Epics
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
                    disabled={!canAssignOthers} // Disable if not allowed to assign others
                  >
                    <option value="">{canAssignOthers ? "Unassigned" : "Assigned to me"}</option>
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
                  {teams.length === 0 && (
                    <div className="warning-box" style={{ padding: '8px', background: '#ffebe6', color: '#de350b', borderRadius: '3px', marginTop: '8px', fontSize: '11px', lineHeight: '1.4' }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                      No teams found in this project. You must create a team first.
                    </div>
                  )}
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
              disabled={isLoading || (teams.length === 0 && !fetchingParents)} // Disable if no teams
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