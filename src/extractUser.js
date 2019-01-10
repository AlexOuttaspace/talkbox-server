import jwt from 'jsonwebtoken'
import { refreshTokens } from './auth'
import { SECRET, SECRET2 } from './secrets'
import { models } from './models'

export const extractUser = async (req, res, next) => {
  const token = req.headers['x-token']
  const refreshToken = req.headers['x-refresh-token']

  if (!token && !refreshToken) return next()

  try {
    const { user } = jwt.verify(token, SECRET)

    req.user = user
  } catch (error) {
    const newTokens = await refreshTokens(refreshToken, models, SECRET, SECRET2)

    if (newTokens.token && newTokens.refreshToken) {
      res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token')
      res.set('x-token', newTokens.token)
      res.set('x-refresh-token', newTokens.refreshToken)
    }

    if (req.query.onlyRefreshToken) {
      return res.send() // client only asks us to refresh tokens
    }

    req.user = newTokens.user
  }

  return next()
}
