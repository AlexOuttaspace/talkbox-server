export const channel = `
  type Channel {
    id: Int!
    name: String!
    messages: [Message!]!
    public: Boolean!
    users: [User!]!
  }

  type ChannelResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
  }

  type Mutation {
    createChannel(name: String!, teamId: Int!, public: Boolean=false): ChannelResponse
  }
`
