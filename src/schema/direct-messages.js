export const directMessages = `
  type DirectMessage {
    id: Int!
    text: String!
    sender: User!
    receiverId: Int
    channel: Channel!
    created_at: String!
  }

  type Query {
    directMessages: [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: Int!, text: String!): Boolean!
  }
`
