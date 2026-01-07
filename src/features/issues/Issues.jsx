// import React, { useState, useEffect } from 'react';
// import { DragDropContext } from '@hello-pangea/dnd';
// import { useParams, useNavigate } from 'react-router-dom';
// import { endpoints, storyService, teamService } from '../../services/api';
// // Note: importing directly from api.js might need adjustment if default export is used differently.
// // Adjusting to import { storyService } assuming named export as per api.js content view.
// import SprintSection from './SprintSection';
// import CreateSprintModal from './CreateSprintModal';
// import { usePermissions } from '../../hooks/usePermissions';
// import './Issues.css';

// const Issues = () => {
//     const { projectId } = useParams();
//     const navigate = useNavigate();
//     const [backlogIssues, setBacklogIssues] = useState([]);
//     const [selectedIssue, setSelectedIssue] = useState(null);
//     const [sprints, setSprints] = useState([
//         { id: 'sprint-1', name: 'ESA Sprint 5', dates: '10 Feb - 24 Feb', issues: [] }
//     ]); // Mock sprint structure for now as backend doesn't seem to separate sprints yet?
//     // Actually backend has 'sprint_number'. We can group by that.

//     const [loading, setLoading] = useState(true);
//     const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
//     const [selectedSprint, setSelectedSprint] = useState('All');
//     const [selectedAssignee, setSelectedAssignee] = useState('All');
//     const [selectedTeam, setSelectedTeam] = useState('All');
//     const [allSprintsList, setAllSprintsList] = useState([]);
//     const [allAssigneesList, setAllAssigneesList] = useState([]);
//     const [teams, setTeams] = useState([]);
//     const [allStories, setAllStories] = useState([]);

//     useEffect(() => {
//         fetchStories();
//         if (projectId) {
//             teamService.getByProject(projectId)
//                 .then(setTeams)
//                 .catch(err => console.error("Failed to fetch teams", err));
//         }
//     }, [projectId]);

//     const fetchStories = async () => {
//         if (!projectId) return;
//         setLoading(true);
//         try {
//             const data = await storyService.getByProject(projectId);
//             setAllStories(data);

//             // Extract unique sprints and assignees
//             const uniqueSprints = [...new Set(data.map(i => i.sprint_number).filter(s => s && s !== 'Backlog'))].sort();
//             const uniqueAssignees = [...new Set(data.map(i => i.assignee).filter(a => a))].sort();

//             setAllSprintsList(uniqueSprints);
//             setAllAssigneesList(uniqueAssignees);

//             applyFilters(data, selectedSprint, selectedAssignee, selectedTeam);
//         } catch (error) {
//             console.error("Failed to fetch stories", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const applyFilters = (data, sprintFilter, assigneeFilter, teamFilter) => {
//         const backlog = [];
//         const sprintMap = {};

//         data.forEach(issue => {
//             const matchesSprint = sprintFilter === 'All' || String(issue.sprint_number) === sprintFilter;
//             const matchesAssignee = assigneeFilter === 'All' || issue.assignee === assigneeFilter;
//             const matchesTeam = teamFilter === 'All' || String(issue.team_id) === String(teamFilter);

//             if (matchesSprint && matchesAssignee && matchesTeam) {
//                 if (!issue.sprint_number || issue.sprint_number === 'Backlog') {
//                     backlog.push(issue);
//                 } else {
//                     if (!sprintMap[issue.sprint_number]) {
//                         sprintMap[issue.sprint_number] = {
//                             id: `sprint-${issue.sprint_number}`,
//                             name: `Sprint ${issue.sprint_number}`,
//                             issues: []
//                         };
//                     }
//                     sprintMap[issue.sprint_number].issues.push(issue);
//                 }
//             }
//         });

//         const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1 };
//         const sortIssues = (issues) => {
//             return [...issues].sort((a, b) => {
//                 const weightA = priorityWeight[(a.priority || 'medium').toLowerCase()] || 0;
//                 const weightB = priorityWeight[(b.priority || 'medium').toLowerCase()] || 0;
//                 return weightB - weightA;
//             });
//         };

//         setBacklogIssues(sortIssues(backlog));
//         setSprints(Object.values(sprintMap)
//             .map(s => ({ ...s, issues: sortIssues(s.issues) }))
//             .sort((a, b) => b.name.localeCompare(a.name)));
//     };

//     useEffect(() => {
//         if (allStories.length > 0) {
//             applyFilters(allStories, selectedSprint, selectedAssignee, selectedTeam);
//         }
//     }, [selectedSprint, selectedAssignee, selectedTeam]);

//     const handleIssueUpdate = (updatedIssue) => {
//         // Update local state
//         const updateList = (list) => list.map(i => i.id === updatedIssue.id ? updatedIssue : i);

//         setBacklogIssues(prev => updateList(prev));
//         setSprints(prev => prev.map(s => ({
//             ...s,
//             issues: updateList(s.issues)
//         })));

//         if (selectedIssue?.id === updatedIssue.id) {
//             setSelectedIssue(updatedIssue);
//         }
//     };

//     const handleIssueDelete = (issueId) => {
//         const filterList = (list) => list.filter(i => i.id !== issueId);

//         setBacklogIssues(prev => filterList(prev));
//         setSprints(prev => prev.map(s => ({
//             ...s,
//             issues: filterList(s.issues)
//         })));

//         if (selectedIssue?.id === issueId) {
//             setSelectedIssue(null);
//         }
//     };

//     const onDragEnd = async (result) => {
//         const { source, destination, draggableId } = result;

//         if (!destination) return;

//         if (
//             source.droppableId === destination.droppableId &&
//             source.index === destination.index
//         ) {
//             return;
//         }

//         // Helper to find list by ID
//         const getList = (id) => {
//             if (id === 'backlog') return backlogIssues;
//             const sprint = sprints.find(s => s.id === id);
//             return sprint ? sprint.issues : [];
//         };

//         const sourceList = getList(source.droppableId);
//         const destList = getList(destination.droppableId);

//         // Remove from source
//         const [movedIssue] = sourceList.splice(source.index, 1);

//         // Add to destination
//         destList.splice(destination.index, 0, movedIssue);

//         // Update local state to be snappy
//         if (source.droppableId === 'backlog') {
//             setBacklogIssues([...sourceList]); // it was spliced in place, but need new ref for react? 
//             // Actually splice mutates. 
//             setBacklogIssues([...sourceList]); // Force update
//         } else {
//             // For sprints, we need to update the specific sprint in the sprints array
//             setSprints(sprints.map(s => {
//                 if (s.id === source.droppableId) return { ...s, issues: [...sourceList] };
//                 return s;
//             }));
//         }

//         if (destination.droppableId === 'backlog') {
//             setBacklogIssues(prev => {
//                 // Optimization: destList is mutated. 
//                 return [...destList];
//             });
//         } else {
//             setSprints(sprints.map(s => {
//                 if (s.id === destination.droppableId) return { ...s, issues: [...destList] };
//                 return s;
//             }));
//         }

//         // TODO: Call API to persist change
//         // We need to update the sprint_number of the moved issue.
//         let newSprintNumber = 'Backlog';
//         if (destination.droppableId !== 'backlog') {
//             // Extract number from id "sprint-X" or use name logic
//             const sprint = sprints.find(s => s.id === destination.droppableId);
//             if (sprint) {
//                 // Assuming sprint name is "Sprint X", just taking X. 
//                 // Or better, if we used real IDs.
//                 // For now, let's just say if dropping into "Sprint 1", we set sprint_number='1'.
//                 newSprintNumber = sprint.id.replace('sprint-', '');
//             }
//         }

//         // Calculate new priority based on position
//         let newPriority = movedIssue.priority || 'Medium';
//         if (destination.index === 0) {
//             newPriority = 'High';
//         } else if (destination.index === destList.length - 1 && destList.length > 1) {
//             newPriority = 'Low';
//         } else {
//             newPriority = 'Medium';
//         }

//         try {
//             // Update on backend
//             await storyService.update(movedIssue.id, {
//                 ...movedIssue,
//                 sprint_number: newSprintNumber,
//                 priority: newPriority
//             });

//             // Refresh local state to ensure sorting is correct if it changed
//             if (newPriority !== movedIssue.priority) {
//                 fetchStories();
//             }
//         } catch (error) {
//             console.error("Failed to update story position/priority", error);
//         }
//     };

//     const handleCreateSprint = async (sprintData) => {
//         try {
//             // Move ALL backlog issues to this sprint
//             const promises = backlogIssues.map(issue =>
//                 storyService.update(issue.id, {
//                     ...issue,
//                     sprint_number: sprintData.sprint_number
//                 })
//             );
//             await Promise.all(promises);
//             fetchStories(); // Refresh to see changes
//         } catch (error) {
//             console.error("Failed to create sprint/move issues", error);
//         }
//     };

//     if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
//     const { canDragDrop, canChangeSprintRelease } = usePermissions();

//     const renderContent = () => (
//         <div className="backlog-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
//             <div className="backlog-header" style={{ padding: '24px 40px 0 40px', flexShrink: 0 }}>
//                 <div className="backlog-breadcrumbs">Projects / Website / Issues</div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                     <h1 style={{ margin: 0 }}>Issues</h1>
//                     <div style={{ display: 'flex', gap: '12px' }}>
//                         <div className="filter-group">
//                             <label style={{ fontSize: '12px', color: '#5e6c84', fontWeight: 600, display: 'block', marginBottom: '4px' }}>SPRINT</label>
//                             <select
//                                 className="jira-input"
//                                 style={{ width: '150px', height: '32px', padding: '0 8px' }}
//                                 value={selectedSprint}
//                                 onChange={(e) => setSelectedSprint(e.target.value)}
//                             >
//                                 <option value="All">All Sprints</option>
//                                 {allSprintsList.map(s => (
//                                     <option key={s} value={s}>Sprint {s}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="filter-group">
//                             <label style={{ fontSize: '12px', color: '#5e6c84', fontWeight: 600, display: 'block', marginBottom: '4px' }}>ASSIGNEE</label>
//                             <select
//                                 className="jira-input"
//                                 style={{ width: '150px', height: '32px', padding: '0 8px' }}
//                                 value={selectedAssignee}
//                                 onChange={(e) => setSelectedAssignee(e.target.value)}
//                             >
//                                 <option value="All">All Assignees</option>
//                                 {allAssigneesList.map(a => (
//                                     <option key={a} value={a}>{a}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="filter-group">
//                             <label style={{ fontSize: '12px', color: '#5e6c84', fontWeight: 600, display: 'block', marginBottom: '4px' }}>TEAM</label>
//                             <select
//                                 className="jira-input"
//                                 style={{ width: '150px', height: '32px', padding: '0 8px' }}
//                                 value={selectedTeam}
//                                 onChange={(e) => setSelectedTeam(e.target.value)}
//                             >
//                                 <option value="All">All Teams</option>
//                                 {teams.map(t => (
//                                     <option key={t.id} value={t.id}>{t.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         {(selectedSprint !== 'All' || selectedAssignee !== 'All' || selectedTeam !== 'All') && (
//                             <button
//                                 className="jira-nav-link"
//                                 onClick={() => { setSelectedSprint('All'); setSelectedAssignee('All'); setSelectedTeam('All'); }}
//                                 style={{ height: '32px', marginTop: 'auto', alignSelf: 'flex-end', fontSize: '13px' }}
//                             >
//                                 Clear all
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
//                 <div className="backlog-list area" style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
//                     {/* Sprints Section */}
//                     {sprints.map(sprint => (
//                         <SprintSection
//                             key={sprint.id}
//                             sprintId={sprint.id}
//                             title={sprint.name}
//                             issues={sprint.issues}
//                             dates={sprint.dates}
//                             teams={teams}
//                             onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
//                         />
//                     ))}

//                     {/* Backlog Section */}
//                     <div className="backlog-section">
//                         <div className="backlog-section-header">
//                             <div className="backlog-title">Backlog ({backlogIssues.length} issues)</div>
//                             {canChangeSprintRelease() && (
//                                 <button className="create-sprint-btn" onClick={() => setIsSprintModalOpen(true)}>Create sprint</button>
//                             )}
//                         </div>

//                         <SprintSection
//                             key="backlog"
//                             sprintId="backlog"
//                             title="Backlog"
//                             issues={backlogIssues}
//                             isBacklog={true}
//                             teams={teams}
//                             onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             <CreateSprintModal
//                 isOpen={isSprintModalOpen}
//                 onClose={() => setIsSprintModalOpen(false)}
//                 issueCount={backlogIssues.length}
//                 onCreate={handleCreateSprint}
//             />
//         </div>
//     );

//     if (canDragDrop()) {
//         return (
//             <DragDropContext onDragEnd={onDragEnd}>
//                 {renderContent()}
//             </DragDropContext>
//         );
//     }

//     return renderContent();
// };

// export default Issues;
import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService, teamService } from '../../services/api';

import SprintSection from './SprintSection';
import CreateSprintModal from './CreateSprintModal';
import { usePermissions } from '../../hooks/usePermissions';

import './Issues.css';


const Issues = () => {

  const { projectId } = useParams();
  const navigate = useNavigate();

  const [backlogIssues, setBacklogIssues] = useState([]);
  const [sprints, setSprints] = useState([]);

  const [allStories, setAllStories] = useState([]);

  const [selectedSprint, setSelectedSprint] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');

  const [allSprintsList, setAllSprintsList] = useState([]);
  const [allAssigneesList, setAllAssigneesList] = useState([]);

  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);


  useEffect(() => {
    fetchStories();

    if (projectId) {
      teamService.getByProject(projectId)
        .then(setTeams)
        .catch(() => setTeams([]));
    }

  }, [projectId]);


  const fetchStories = async () => {
    if (!projectId) return;

    setLoading(true);

    try {

      const data = await storyService.getByProject(projectId);
      setAllStories(data);

      const uniqueSprints = [...new Set(
        data.map(i => i.sprint_number).filter(s => s && s !== 'Backlog')
      )];

      const uniqueAssignees = [...new Set(
        data.map(i => i.assigned_to).filter(a => a)
      )];

      setAllSprintsList(uniqueSprints);
      setAllAssigneesList(uniqueAssignees);

      applyFilters(data, selectedSprint, selectedAssignee, selectedTeam);

    } finally {
      setLoading(false);
    }
  };


  const applyFilters = (data, sprintFilter, assigneeFilter, teamFilter) => {

    const backlog = [];
    const sprintMap = {};

    data.forEach(issue => {

      const matchesSprint =
        sprintFilter === 'All' ||
        String(issue.sprint_number) === sprintFilter;

      const matchesAssignee =
        assigneeFilter === 'All' ||
        String(issue.assigned_to) === String(assigneeFilter);

      const matchesTeam =
        teamFilter === 'All' ||
        String(issue.team_id) === String(teamFilter);

      if (!(matchesSprint && matchesAssignee && matchesTeam)) return;

      if (!issue.sprint_number || issue.sprint_number === 'Backlog') {
        backlog.push(issue);
      } else {
        if (!sprintMap[issue.sprint_number]) {
          sprintMap[issue.sprint_number] = {
            id: `sprint-${issue.sprint_number}`,
            name: `Sprint ${issue.sprint_number}`,
            issues: []
          };
        }
        sprintMap[issue.sprint_number].issues.push(issue);
      }
    });

    const weight = { high: 3, medium: 2, low: 1 };

    const sortIssues = arr =>
      [...arr].sort((a, b) =>
        (weight[(b.priority || 'medium').toLowerCase()] ?? 0) -
        (weight[(a.priority || 'medium').toLowerCase()] ?? 0)
      );

    setBacklogIssues(sortIssues(backlog));

    setSprints(
      Object.values(sprintMap)
        .map(s => ({ ...s, issues: sortIssues(s.issues) }))
        .sort((a, b) => b.name.localeCompare(a.name))
    );
  };


  useEffect(() => {
    if (allStories.length)
      applyFilters(allStories, selectedSprint, selectedAssignee, selectedTeam);
  }, [selectedSprint, selectedAssignee, selectedTeam]);


  const onDragEnd = async (result) => {

    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const getList = id => {
      if (id === 'backlog') return backlogIssues;
      return (sprints.find(s => s.id === id) || {}).issues || [];
    };

    const sourceList = getList(source.droppableId);
    const destList = getList(destination.droppableId);

    const [moved] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, moved);

    let newSprint = 'Backlog';

    if (destination.droppableId !== 'backlog') {
      newSprint = destination.droppableId.replace('sprint-', '');
    }

    try {
      await storyService.update(moved.id, {
        ...moved,
        sprint_number: newSprint
      });

      fetchStories();
    } catch (err) {
      console.error('Drag update failed', err);
    }
  };


  const handleCreateSprint = async sprintData => {
    try {
      if (!sprintData.selectedStoryIds || sprintData.selectedStoryIds.length === 0) {
        alert("No stories selected for this sprint.");
        return;
      }

      await Promise.all(
        sprintData.selectedStoryIds.map(issueId => {
          const issue = allStories.find(i => i.id === issueId);
          return storyService.update(issueId, {
            ...issue,
            sprint_number: sprintData.sprint_number
          });
        })
      );

      fetchStories();

    } catch (err) {
      console.error('Sprint create failed', err);
    }
  };


  const { canDragDrop, canChangeSprintRelease } = usePermissions();

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;


  return (
    <DragDropContext onDragEnd={canDragDrop() ? onDragEnd : undefined}>

      <div className="backlog-container">

        <div className="backlog-header">

          <h1>Issues</h1>

          <div className="filters">

            <select value={selectedSprint} onChange={e => setSelectedSprint(e.target.value)}>
              <option value="All">All Sprints</option>
              {allSprintsList.map(s => <option key={s} value={s}>Sprint {s}</option>)}
            </select>

            <select value={selectedAssignee} onChange={e => setSelectedAssignee(e.target.value)}>
              <option value="All">All Assignees</option>
              {allAssigneesList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
              <option value="All">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

          </div>

        </div>


        {sprints.map(sprint => (
          <SprintSection
            key={sprint.id}
            sprintId={sprint.id}
            title={sprint.name}
            issues={sprint.issues}
            teams={teams}
            onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
          />
        ))}


        <div className="backlog-section">

          <div className="backlog-section-header">
            <div>Backlog ({backlogIssues.length})</div>

            {canChangeSprintRelease() && (
              <button onClick={() => setIsSprintModalOpen(true)}>
                Create Sprint
              </button>
            )}
          </div>

          <SprintSection
            sprintId="backlog"
            title="Backlog"
            issues={backlogIssues}
            isBacklog
            teams={teams}
            onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
          />

        </div>


        <CreateSprintModal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          backlogIssues={backlogIssues}
          onCreate={handleCreateSprint}
        />

      </div>
    </DragDropContext>
  );
};

export default Issues;
