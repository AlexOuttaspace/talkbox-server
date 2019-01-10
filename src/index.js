import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import { createServer } from 'http'
import cors from 'cors'

import { schema } from './schema/'
import { resolvers } from './resolvers/'
import { models } from './models'
import { SECRET, SECRET2 } from './secrets'
import { extractUser } from './extractUser'

const app = express()

app.use(cors('*'))

app.use(extractUser)

const PORT = process.env.PORT || 3020

const server = new ApolloServer({
  typeDefs: gql(schema),
  resolvers,
  context: ({ req }) => ({
    SECRET,
    SECRET2,
    models,
    user: req.user
  })
})

server.applyMiddleware({ app })

const httpServer = createServer(app)

server.installSubscriptionHandlers(httpServer)

models
  .sequelize
  .sync()
  .then(() => {
    httpServer.listen(
      { port: PORT },
      () => {
        console.log(`\nServer ready at  http://localhost:${PORT}${server.graphqlPath}`)
        console.log(`Subscriptions ready at  http://localhost:${PORT}${server.subscriptionsPath}`)
      }
    )
  })

