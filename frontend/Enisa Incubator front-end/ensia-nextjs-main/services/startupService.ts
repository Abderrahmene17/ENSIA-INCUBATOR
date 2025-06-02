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
  // Create a startup with team members
  createStartupWithTeam: async (data: CreateStartupWithTeam) => {
    try {
      // Create the startup first
      const startupData = {
        name: data.name,
        description: data.description,
        industry: data.industry || "",
        stage: data.stage || "",
        status: "pending",
        // Don't set user here, we'll handle team members separately
      }

      const startupResponse = await api.post("/startups/", startupData)
      const startup = startupResponse.data

      // Find user ID for team leader
      const usersResponse = await api.get("/users/")
      console.log("Users response:", usersResponse.data) // Debug log

      // Check if the response is an array or has results
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.results || []

      // If no users found, we need to create them first
      if (users.length === 0) {
        console.error("No users found in the database")
        throw new Error("No users found in the database. Please create users first.")
      }

      const teamLeader = users.find((user: User) => user.full_name === data.teamLeaderName)

      if (!teamLeader) {
        console.error(
          "Available users:",
          users.map((u: User) => u.full_name),
        ) // Debug log
        throw new Error(
          `User with name ${data.teamLeaderName} not found. Available users: ${users.map((u: User) => u.full_name).join(", ")}`,
        )
      }

      // Add team leader as team member with Team Leader role
      const teamLeaderResponse = await api.post(`/startups/${startup.id}/team/`, {
        user: teamLeader.id,
        role_in_team: "Team Leader",
        startup: startup.id,
      })

      // Add other team members
      const teamMemberPromises = data.teamMemberNames.map(async (memberName) => {
        const member = users.find((user: User) => user.full_name === memberName)
        if (!member) {
          throw new Error(`User with name ${memberName} not found`)
        }
        await api.post(`/startups/${startup.id}/team/`, {
          user: member.id,
          role_in_team: "Team Member",
          startup: startup.id,
        })
      })

      await Promise.all(teamMemberPromises)

      // Return the updated startup with team members
      return await api.get(`/startups/${startup.id}/`)
    } catch (error) {
      console.error("Error creating startup:", error)
      throw error
    }
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
    console.log(`Updating startup ${id} with data:`, data)
    try {
      // Update startup details if provided
      if (data.startup) {
        console.log(`Updating startup ${id} details:`, data.startup)
        const startupResponse = await api.put(`/startups/${id}/`, data.startup)
        console.log("Update startup response:", startupResponse.data)
      }

      // If team leader is changing, update it
      if (data.teamLeaderName) {
        console.log(`Updating team leader for startup ${id} to ${data.teamLeaderName}`)

        // Get current team members
        console.log(`Fetching current team members for startup ${id}`)
        const currentMembers = await startupService.getTeamMembers(id)
        console.log("Current team members:", currentMembers)

        // Find current team leader
        const currentLeader = currentMembers.find((m: TeamMember) => m.role_in_team === "Team Leader")
        console.log("Current team leader:", currentLeader)

        // Get all users to find the team leader
        console.log("Fetching all users")
        const usersResponse = await api.get("/users/")
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.results || []
        console.log("Users:", users)

        const teamLeader = users.find((user: User) => user.full_name === data.teamLeaderName)
        console.log("Found team leader:", teamLeader)

        if (!teamLeader) {
          throw new Error(`User with name ${data.teamLeaderName} not found`)
        }

        if (currentLeader) {
          // Update the existing team leader
          console.log(`Updating existing team leader ${currentLeader.id}`)
          const updateResponse = await api.put(`/startups/${id}/team/${currentLeader.id}/`, {
            user: teamLeader.id,
            role_in_team: "Team Leader",
            startup: id,
          })
          console.log("Update team leader response:", updateResponse.data)
        } else {
          // No current leader, add new one
          console.log("No current leader, adding new one")
          const addResponse = await api.post(`/startups/${id}/team/`, {
            user: teamLeader.id,
            role_in_team: "Team Leader",
            startup: id,
          })
          console.log("Add team leader response:", addResponse.data)
        }
      }

      // Update team members if provided
      if (data.teamMembers) {
        console.log(`Updating team members for startup ${id}:`, data.teamMembers)

        // Get current team members
        console.log(`Fetching current team members for startup ${id}`)
        const currentMembers: TeamMember[] = await startupService.getTeamMembers(id)
        console.log("Current team members:", currentMembers)

        // Remove all non-leader members
        const membersToRemove = currentMembers.filter((m: TeamMember) => m.role_in_team !== "Team Leader")
        console.log("Members to remove:", membersToRemove)

        for (const member of membersToRemove) {
          console.log(`Removing team member ${member.id}`)
          await api.delete(`/startups/${id}/team/${member.id}/`)
        }

        // Get all users to find the team members
        console.log("Fetching all users")
        const usersResponse = await api.get("/users/")
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.results || []
        console.log("Users:", users)

        // Add new members
        for (const member of data.teamMembers) {
          console.log(`Adding team member ${member.name}`)
          const user = users.find((u: User) => u.full_name === member.name)
          console.log("Found user:", user)

          if (!user) {
            throw new Error(`User with name ${member.name} not found`)
          }

          const addResponse = await api.post(`/startups/${id}/team/`, {
            user: user.id,
            role_in_team: member.role_in_team,
            startup: id,
          })
          console.log("Add team member response:", addResponse.data)
        }
      }

      // Return updated startup
      console.log(`Fetching updated startup ${id}`)
      const updatedStartup = await startupService.getStartup(id)
      console.log("Updated startup:", updatedStartup)
      return updatedStartup
    } catch (error) {
      console.error(`Error updating startup ${id}:`, error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
      }
      throw error
    }
  },

  getStartup: async (id: number) => {
    const response = await api.get(`/startups/${id}/`)
    return response.data
  },

  // Get team members for a startup
  getTeamMembers: async (startupId: number) => {
    console.log(`Fetching team members for startup ${startupId} from URL: /startups/${startupId}/team/`)
    try {
      const response = await api.get(`/startups/${startupId}/team/`)
      console.log("Team members response:", response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching team members for startup ${startupId}:`, error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
      }
      throw error
    }
  },

  // Add a team member to a startup
  addTeamMember: async (startupId: number, data: Partial<TeamMember> & { member_name?: string }) => {
    console.log(`Adding team member to startup ${startupId} with data:`, data)
    try {
      const response = await api.post(`/startups/${startupId}/team/`, data)
      console.log("Add team member response:", response.data)
      return response.data
    } catch (error) {
      console.error(`Error adding team member to startup ${startupId}:`, error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
      }
      throw error
    }
  },

  // Remove a team member from a startup
  removeTeamMember: async (startupId: number, memberId: number) => {
    console.log(`Removing team member ${memberId} from startup ${startupId}`)
    try {
      const response = await api.delete(`/startups/${startupId}/team/${memberId}/`)
      console.log("Remove team member response:", response)
      return response.data
    } catch (error) {
      console.error(`Error removing team member ${memberId} from startup ${startupId}:`, error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
      }
      throw error
    }
  },
}

export default startupService
