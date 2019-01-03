import bcrypt from 'bcrypt'
import { tryLogin } from '../auth'
import { formatErrors } from '../formatErrors'

export const user = {
  Query: {
    getUser: (parent, { id }, { models }) => models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },

  Mutation: {
    register: async (parent, args, { models }) => {
      try {
        const registeredUser = await models.User.create(args)

        return {
          ok: true,
          user: registeredUser
        }
      } catch (error) {
        return {
          ok: false,
          errors: formatErrors(error)
        }
      }
    },

    login: async (parent, { email, password }, { models, SECRET, SECRET2 }) => {
      try {
        return tryLogin(email, password, models, SECRET, SECRET2)
      } catch (error) {
        return {
          ok: false,
          errors: formatErrors(error)
        }
      }

    }
  }
}
