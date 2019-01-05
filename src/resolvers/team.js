import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const team = {
  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        await models.Team.create({ ...args, owner: user.id })
        return {
          ok: true
        }
      } catch (error) {
        console.log(error)
        return {
          ok: false,
          errors: formatErrors(error)
        }
      }
    })
  },
  Query: {
    allTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
      await models.Team.findAll({ owner: user.id }, { raw: true })
    )
  }
}
