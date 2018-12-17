import express from 'express'
import jwt from 'jsonwebtoken'
import { ApolloServer, gql } from 'apollo-server-express'
import { schema } from './schema/'
import { resolvers } from './resolvers/'
import { models } from './models'
import { refreshTokens } from './auth'
import cors from 'cors'

const app = express()

const SECRET = 'nevergonnagiveyouup'
const SECRET2 = 'nevergonnaletyoudown'

app.use(cors('*'))

const extractUser = async (req, res, next) => {
  const token = req.headers['x-token']

  if (!token) return next()

  try {
    const { user } = jwt.verify(token, SECRET)

    req.user = user
  } catch (error) {
    const refreshToken = req.headers['x-refresh-token']

    const newTokens = await refreshTokens(refreshToken, models, SECRET)

    if (newTokens.token && newToken.refreshToken) {
      res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token')
      res.set('x-token', newTokens.token)
      res.set('x-refresh-token', newTokens.refreshToken)
    }

    req.user = newTokens.user
  }

  return next()
}

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

models
  .sequelize
  .sync()
  .then(() => {
    app.listen(
      PORT,
      console.log(`\nServer ready at  http://localhost:${PORT}${server.graphqlPath}`)
    )
  })

