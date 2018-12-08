export const user = `
  type User {
    id: Int!
    email: String!
    username: String!
    teams: [Team!]!
  }

  
  type Query {
    getUser(id: Int!): User!
    allUsers: [User!]!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User!
  }
`
