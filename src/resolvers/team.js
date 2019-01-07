import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const team = {
  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdTeam = await models.Team.create({ ...args, owner: user.id })

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
    }),

    addTeamMember: requiresAuth.createResolver(async (parent, { email, teamId }, { models, user }) => {
      try {
        const teamPromise = modale.findOne({ where: { id: teamId } }, { raw: true })
        const userToAddPromise = models.findOne({ where: { email } }, { raw: true })

        conse [team, userToAdd] = Promise.all({ teamPromise, userToAddPromise })

        if (team.owner !== user.id) {
          return {
            ok: false,
            errors: [ { path: 'email', message: 'you must be an owner of team to invite users' } ]
          }
        }

        if (!userToAdd) {
          return {
            ok: false,
            errors: [ { path: 'email', message: 'Could not find user with this email' } ]
          }
        }

        await models.Member.create({ userId: userToAdd.id, teamId })

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
