import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import { createServer } from 'http'
import cors from 'cors'

import { schema } from './schema/'
import { resolvers } from './resolvers/'
import { models } from './models'
import { SECRET, SECRET2 } from './secrets'
import { extractUser } from './extractUser'
import { refreshTokens } from './auth'

const app = express()

app.use(cors('*'))

app.use(extractUser)

const PORT = process.env.PORT || 3020

const server = new ApolloServer({
  typeDefs: gql(schema),
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      return { ...connection.context, models }
    }

    return ({
      SECRET,
      SECRET2,
      models,
      user: req.user
    })
  },
  subscriptions: {
    onConnect: async ({ token, refreshToken }) => {
      if (!token || !refreshToken) {
        return {}
      }

      try {
        const { user } = jwt.verify(token, SECRET)

        return { models, user }
      } catch (error) {
        const newTokens = await refreshTokens(refreshToken, models, SECRET, SECRET2)

        return { models, user: newTokens.user }
      }
    }
  }
})

server.applyMiddleware({ app })

const httpServer = createServer(app)

server.installSubscriptionHandlers(httpServer)

models
  .sequelize
  .sync({})
  .then(() => {
    httpServer.listen(
      { port: PORT },
      () => {
        console.log('\n')
        console.log(`> Server ready at  http://localhost:${PORT}${server.graphqlPath}`)
        console.log(`> Subscriptions ready at  http://localhost:${PORT}${server.subscriptionsPath}`)
      }
    )
  })

