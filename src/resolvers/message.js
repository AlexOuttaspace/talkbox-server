import { requiresAuth, requiresTeamAccess } from '../permissions'
import { withFilter } from 'apollo-server-express'

import { pubsub } from '../pubsub'

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE'

export const message = {
  Mutation: {
    createMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdMessage = await models.Message.create({ ...args, userId: user.id })
        
        pubsub.publish(NEW_CHANNEL_MESSAGE, {
          channelId: args.channelId,
          newChannelMessage: {
            ...createdMessage.dataValues,
            user
          }
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
      models.Message.findAll(
        { order: [ [ 'created_at', 'ASC' ] ], where: { channelId } },
        { raw: true },
      ))
  },
  Message: {
    user: ({ userId }, args, { models }) => {
      return models.User.findOne({ where: { id: userId } }, { raw: true })
    }
  },
  Subscription: {
    newChannelMessage: {
      subscribe: requiresTeamAccess.createResolver(withFilter(
        (parent, { channelId }, { models, user }) => {
          return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE)
        },
        (payload, { channelId }) => payload.channelId === channelId
      ))
    }
  }
}
