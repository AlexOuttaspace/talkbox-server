import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const team = {
  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdTeam = await models.Team.create({ ...args, owner: user.id })

        // not using await here to return response faster
        await models.Channel.create({ name: 'general', public: true, teamId: createdTeam.id })

        return {
          ok: true,
          team: createdTeam
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
      await models.Team.findAll({
        where: { owner: user.id }
      }, {
        raw: true
      })
    )
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ where: { teamId: id } })
  }
}
