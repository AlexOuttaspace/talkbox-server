import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const createTokens = (user, secret, secret2) => {
  const createToken = jwt.sign(
    {
      user: {
        id: user.id
      }
    },
    secret,
    { expiresIn: '25m' }
  )

  const createRefreshToken = jwt.sign(
    {
      user: {
        id: user.id
      }
    },
    secret2,
    { expiresIn: '7d' }
  )

  return [ createToken, createRefreshToken ]
}

export const tryLogin = async (email, password, models, SECRET, SECRET2) => {

    
  const user = await models.User.findOne({ where: { email }, raw: true })
    
  console.log(user)
    
  if (!user) {
    return {
      ok: false,
      errors: [ { path: 'email', message: 'invalid email' } ]
    }
  }


  const passwordIsValid = await bcrypt.compare(password, user.password)
  
  if (!passwordIsValid) {
    return {
      ok: false,
      errors: [ { path: 'password', message: 'invalid password' } ]
    }
  }
    
  // adding user's password to secret will enable it to expire if the password is changed
  const refreshTokenSecret = user.password + SECRET2
  
  const [ token, refreshToken ] = createTokens(user, SECRET, refreshTokenSecret)

  return {
    ok: true,
    token,
    refreshToken
  }

}
