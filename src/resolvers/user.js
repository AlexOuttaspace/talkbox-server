import { tryLogin } from '../auth'
import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const user = {
  User: {
    teams: (parent, args, context) =>
      context.models.sequelize.query(
        'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?', {
          model: context.models.Team,
          replacements: [ context.user.id ],
          raw: true
        }
      )
  },

  Query: {
    allUsers: (parent, args, { models }) => models.User.findAll(),

    me: requiresAuth.createResolver((parent, args, context) =>
      context.models.User.findOne({ where: { id: context.user.id } }))
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
