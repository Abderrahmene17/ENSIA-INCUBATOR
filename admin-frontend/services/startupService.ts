import api from "./api"
import userService from "./userService"

export interface Startup {
  id: number
  name: string
  description: string
  status: "pending" | "approved" | "rejected"
  user: number | null
  created_at: string
  updated_at: string
  team_members?: TeamMember[]
  team_leader?: User
  industry?: string
  stage?: string
}

export interface TeamMember {
  id: number
  role_in_team: string
  startup: number
  user: number
  user_details?: User
}

export interface User {
  id: number
  full_name: string
  email: string
  role: number
  role_name?: string
  is_active?: boolean
  status?: string
}

// Modified to use string names instead of user IDs
export interface CreateStartupWithTeam {
  name: string;
  description: string;
  industry: string;
  stage: string;
  teamLeaderName: string;
  teamMemberNames: string[];
}

export const startupService = {
  // Get all startups
  getStartups: async () => {
    const response = await api.get("/startups/");
    return response.data;
  },

  // Get a single startup
  getStartup: async (id: number) => {
    const response = await api.get(`/startups/${id}/`);
    return response.data;
  },

  // Create a startup with team members
createStartupWithTeam: async (data: CreateStartupWithTeam) => {
  try {
    // Step 1: Create the startup
    const startupData = {
      name: data.name,
      description: data.description,
      industry: data.industry || '',
      stage: data.stage || '',
      status: 'approved',
      user: null, // no user assigned to startup directly
    };

    const startupResponse = await api.post("/startups/", startupData);
    const startup = startupResponse.data;

    // Step 2: Fetch users
    const usersResponse = await api.get("/users/");
    const users = Array.isArray(usersResponse.data)
      ? usersResponse.data
      : usersResponse.data.results || [];

    // Step 3: Find team leader
    const teamLeader = users.find((user: User) => user.full_name === data.teamLeaderName);
    if (!teamLeader) {
      console.error('Available users:', users.map((u: User) => u.full_name));
      throw new Error(`User with name ${data.teamLeaderName} not found`);
    }

    // Step 4: Add team leader to the team
    await api.post(`/startups/${startup.id}/team/`, {
      user: teamLeader.id,
      role_in_team: "Team Leader",
      startup: startup.id,
    });

    // ✅ Step 5: Filter out the leader from the team members list
    const filteredTeamMembers = data.teamMemberNames.filter(
      (name) => name !== data.teamLeaderName
    );

    // Step 6: Add remaining team members
    const teamMemberPromises = filteredTeamMembers.map(async (memberName) => {
      const member = users.find((user: User) => user.full_name === memberName);
      if (!member) {
        throw new Error(`User with name ${memberName} not found`);
      }
      await api.post(`/startups/${startup.id}/team/`, {
        user: member.id,
        role_in_team: "Team Member",
        startup: startup.id,
      });
    });

    await Promise.all(teamMemberPromises);

    // Step 7: Return updated startup with members
    return await api.get(`/startups/${startup.id}/`);
  } catch (error) {
    console.error("Error creating startup:", error);
    throw error;
  }
},


  // Update a startup
  updateStartup: async (id: number, data: Partial<Startup>) => {
    const response = await api.put(`/startups/${id}/`, data)
    return response.data
  },

  // Update a startup with team members
  updateStartupWithTeam: async (
    id: number,
    data: {
      startup?: Partial<Startup>
      teamLeaderName?: string
      teamMembers?: { name: string; role_in_team: string }[]
    },
  ) => {
    // Update startup details if provided
    if (data.startup) {
      await api.put(`/startups/${id}/`, data.startup)
    }

    // If team leader is changing, update it
    if (data.teamLeaderName) {
      // Get current team members
      const currentMembers = await startupService.getTeamMembers(id)

      // Find current team leader
      const currentLeader = currentMembers.find((m: TeamMember) => m.role_in_team === "Team Leader")

      if (currentLeader) {
        // Update the existing team leader
        await api.put(`/startups/${id}/team-members/${currentLeader.id}/`, {
          user: 1, // Default user ID
          role_in_team: "Team Leader",
          startup: id,
          team_leader_name: data.teamLeaderName,
        })
      } else {
        // No current leader, add new one
        await api.post(`/startups/${id}/team-members/`, {
          user: 1, // Default user ID
          role_in_team: "Team Leader",
          startup: id,
          team_leader_name: data.teamLeaderName,
        })
      }
    }

    // Update team members if provided
    if (data.teamMembers) {
      // Get current team members
      const currentMembers: TeamMember[] = await startupService.getTeamMembers(id)

      // Remove all non-leader members
      const membersToRemove = currentMembers.filter((m: TeamMember) => m.role_in_team !== "Team Leader")

      for (const member of membersToRemove) {
        await api.delete(`/startups/${id}/team-members/${member.id}/`)
      }

      // Add new members
      for (const member of data.teamMembers) {
        await api.post(`/startups/${id}/team-members/`, {
          user: 1, // Default user ID
          role_in_team: member.role_in_team,
          startup: id,
          member_name: member.name,
        })
      }
    }

    // Return updated startup
    return await startupService.getStartup(id)
  },

  // Delete a startup
  deleteStartup: async (id: number) => {
    return await api.delete(`/startups/${id}/`)
  },

  // Get team members for a startup
  getTeamMembers: async (startupId: number) => {
    const response = await api.get(`/startups/${startupId}/team/`)
    return response.data
  },

  // Add a team member to a startup
  addTeamMember: async (startupId: number, data: Partial<TeamMember> & { member_name?: string }) => {
    const response = await api.post(`/startups/${startupId}/team/`, data)
    return response.data
  },

  // Remove a team member from a startup
  removeTeamMember: async (startupId: number, memberId: number) => {
    return await api.delete(`/startups/${startupId}/team/${memberId}/`)
  },
}

export default startupService
