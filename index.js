require('dotenv').config()

const express = require('express')
const { Server } = require('http')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const {
  execute,
  subscribe,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} = require('graphql')
const GraphHTTP = require('express-graphql')
const app = express()

const PORT = process.env.PORT || 3020

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      message: {
        type: GraphQLString,
        resolve() {
          return 'Hello World!'
        }
      }
    }
  })
})
    
app.use('/api/ql', GraphHTTP({
  schema,
  graphiql: true
}))

const server = Server(app)

SubscriptionServer.create({
  schema,
  execute,
  subscribe
}, {
  server,
  path: '/api/ws'
})

server.listen(PORT, console.log(`Server started on port ${PORT}`))
