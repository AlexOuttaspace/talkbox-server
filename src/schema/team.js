export const team = `
  type Team {
    id: Int!
    name: String!
    directMessageMembers: [User!]!
    channels: [Channel!]!
    admin: Boolean!
  }

  type CreateTeamResponse {
    ok: Boolean!
    team: Team
    errors: [Error!]
  }

  type Query {
    allTeams: [Team!]!
    inviteTeams: [Team!]!
    getTeamMembers(teamId: Int!): [User!]!
  }

  type addTeamMemberResponse {
    ok: Boolean!
    errors: [Error!]
    user: User
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: Int!): addTeamMemberResponse!
  }
`
