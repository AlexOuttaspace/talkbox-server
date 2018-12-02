export const channel = `
  type Channel {
    id: Int!
    name: String!
    messages: [Message!]!
    public: Boolean!
    users: [User!]!
  }
`
