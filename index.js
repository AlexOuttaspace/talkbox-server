import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import { schema } from './schema/'
import { resolvers } from './resolvers/'
import { models } from './models'
import cors from 'cors'

const app = express()

app.use(cors('*'))

const PORT = process.env.PORT || 3020

const server = new ApolloServer({
  typeDefs: gql(schema),
  resolvers,
  context: {
    models,
    user: {
      id: 1
    }
  }
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

