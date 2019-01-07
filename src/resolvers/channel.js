import { formatErrors } from '../formatErrors'
import { requiresAuth } from '../permissions'

export const channel = {
  Mutation: {
    createChannel: requiresAuth.createResolver(async (parent, args, { models }) => {
      try {
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
