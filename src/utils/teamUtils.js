import { teamService } from '../services/teamService';

/**
 * Ensures that a user is a member of a team.
 * If the user is not a member, updates the team's membership.
 * 
 * @param {number|string} teamId - The ID of the team
 * @param {number|string} userId - The ID of the user to sync
 * @returns {Promise<boolean>} - True if synced (added or already present), false otherwise
 */
export const syncTeamMembership = async (teamId, userId) => {
    if (!teamId || !userId) return false;

    try {
        console.log(`Syncing membership for team ${teamId} and user ${userId}`);
        const team = await teamService.getById(teamId);

        if (!team) return false;

        const currentMemberIds = team.members?.map(m => m.id) || [];
        const userIdNum = Number(userId);

        if (!currentMemberIds.includes(userIdNum)) {
            console.log(`User ${userId} not in team ${teamId}. Adding...`);
            const updatedMemberIds = [...currentMemberIds, userIdNum];

            await teamService.update(teamId, {
                ...team,
                member_ids: updatedMemberIds,
                // Ensure lead_id and project_id are sent as scalars if they are objects
                lead_id: team.lead?.id || team.lead_id,
                project_id: team.project?.id || team.project_id
            });
            console.log(`User ${userId} successfully added to team ${teamId}`);
            return true;
        }

        return true;
    } catch (error) {
        console.error(`Failed to sync team membership for team ${teamId} and user ${userId}`, error);
        return false;
    }
};