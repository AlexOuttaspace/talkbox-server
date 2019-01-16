import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const channel = {
  Mutation: {
    createChannel: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const member = await models.Member.findOne({ where: { teamId: args.teamId, userId: user.id } }, { raw: true })

        if (!member.admin) {
          return {
            ok: false,
            errors: [
              {
                path: 'name',
                message: 'you have to be the owner of the team to create channels'
              }
            ]
          }
        }

        const createdChannel = await models.Channel.create(args)

        return {
          ok: true,
          channel: createdChannel
        }
      } catch (error) {
        console.log(error)
        return {
          ok: false,
          errors: formatErrors(error)
        }
      }
    })
  }
}
