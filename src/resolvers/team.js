import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const team = {
  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdTeam = await models.sequelize.transaction(
          async () => {
            const teamToCreate = await models.Team.create({ ...args })

            await models.Member.create({ teamId: teamToCreate.id, userId: user.id, admin: true })

            await models.Channel.create({ name: 'general', public: true, teamId: teamToCreate.id })

            return teamToCreate
          }
        )

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
        const memberPromise = models.Member.findOne({ where: { teamId, userId: user.id } }, { raw: true })
        const userToAddPromise = models.User.findOne({ where: { email } }, { raw: true })

        const [ member, userToAdd ] = await Promise.all([ memberPromise, userToAddPromise ])

        if (!member.admin) {
          return {
            ok: false,
            errors: [ { path: 'email', message: 'you must be an owner of team to invite users' } ]
          }
        }

        if (!userToAdd) {
          return {
            ok: false,
            errors: [ { path: 'email', message: 'could not find user with this email' } ]
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
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ where: { teamId: id } })
  }
}
