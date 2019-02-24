import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const team = {
  Query: {
    getTeamMembers: requiresAuth.createResolver(
      async (parent, { teamId }, { models, user }) =>
        models.sequelize.query(
          'select * from users as u join members as m on m.user_id = u.id where m.team_id = ?', {
            model: models.User,
            replacements: [ teamId ],
            raw: true
          }
        )
    )
  },

  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdTeam = await models.sequelize.transaction(
          async (transation) => {
            const teamToCreate = await models.Team.create({ ...args }, { transation })

            await models.Member.create({ teamId: teamToCreate.id, userId: user.id, admin: true }, { transation })

            await models.Channel.create({ name: 'general', public: true, teamId: teamToCreate.id }, { transation })

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
          ok: true,
          user: userToAdd
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
    channels: ({ id }, args, { models, user }) =>
      models.sequelize.query(`
        select distinct on (id)
        * from channels as c, private_members as pm
        where team_id = :teamId and (c.private = false or (pm.user_id = :userId and c.id = pm.channel_id));`, {
        type: models.sequelize.QueryTypes.SELECT,
        replacements: { teamId: id, userId: user.id },
        models: models.Channel,
        raw: true
      }),
      
    
    directMessageMembers: ({ id }, args, { models, user }) =>
      models.sequelize.query(`
        select distinct on (u.id) u.id, u.username from users as u
        join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id)
        where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId`,
      {
        replacements: { currentUserId: user.id, teamId: id },
        model: models.User,
        raw: true
      })
  }
}
