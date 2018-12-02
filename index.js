require('dotenv').config //eslint-disable-line

import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'
import { models } from './models'

const app = express()

const PORT = process.env.PORT || 3020

const server = new ApolloServer({
  typeDefs,
  resolvers
})
    
server.applyMiddleware({ app })

models
  .sequelize
  .sync()
  .then(() => {
    app.listen(
      PORT,
      console.log(`\nServer ready at  http://localhost:${PORT}${server.graphqlPath}`)
    )
  })

