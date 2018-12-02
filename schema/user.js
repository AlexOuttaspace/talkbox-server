export const user = `
  type User {
    id: Int!
    email: String!
    username: String!
    teams: [Team!]!
  }

  
  type Query {
    getUser(id: Int!): User!
    allUsers(id: Int!): [User!]!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User!
  }
`
