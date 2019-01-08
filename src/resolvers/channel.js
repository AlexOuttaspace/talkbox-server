import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const channel = {
  Mutation: {
    createChannel: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const team = await models.Team.findOne({ where: { id: args.teamId } }, { raw: true })

        if (team.owner !== user.id) {
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

        console.log(args)
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
