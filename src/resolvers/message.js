import { requiresAuth } from '../permissions'
import { withFilter, PubSub } from 'apollo-server-express'

const pubsub = new PubSub()

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE'

export const message = {
  Mutation: {
    createMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdMessage = await models.Message.create({ ...args, userId: user.id })

        pubsub.publish(NEW_CHANNEL_MESSAGE, {
          newChannelMessage: createdMessage.dataValues,
          channelId: args.channelId
        })

        return true
      } catch (error) {
        console.log(error)
        return false
      }
    })
  },
  Query: {
    messages: requiresAuth.createResolver(async (parent, { channelId }, { models }) =>
      models.Message.findAll({ where: { channelId } }, { raw: true }))
  },
  Message: {
    user: ({ userId }, args, { models }) =>
      models.User.findOne({ where: { id: userId } }, { raw: true })
  },
  Subscription: {
    newChannelMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
        (payload, { channelId }) => payload.channelId === channelId
      )
    }
  }
}
