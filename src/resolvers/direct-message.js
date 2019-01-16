import { withFilter } from 'apollo-server-express'
import { requiresAuth, requiresDirectMessageAccess } from '../permissions'
import { pubsub } from '../pubsub'

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE'

export const directMessage = {
  Mutation: {
    createDirectMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdDirectMessage = await models.DirectMessage.create({ ...args, senderId: user.id })
        
        pubsub.publish(NEW_DIRECT_MESSAGE, {
          teamId: args.teamId,
          senderId: user.id,
          receiverId: args.receiverId,
          newDirectMessage: {
            ...createdDirectMessage.dataValues,
            sender: {
              username: user.username,
              id: user.id
            }
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
    directMessages: requiresAuth.createResolver(
      (parent, { teamId, otherUserId }, { models, user }) =>
        models.DirectMessage.findAll(
          { order: [ [ 'created_at', 'ASC' ] ], where: { teamId, [models.sequelize.Op.or]: [ {
            [models.sequelize.Op.and]: [ { receiverId: otherUserId }, { senderId: user.id } ]
          }, {
            [models.sequelize.Op.and]: [ { receiverId: user.id }, { senderId: otherUserId } ]
          } ] } },
          { raw: true },
        )
    )
  },
  DirectMessage: {
    sender: ({ sender, senderId }, args, { models }) => {
      if (sender) {
        return sender
      }

      return models.User.findOne({ where: { id: senderId } }, { raw: true })
    }
  },
  Subscription: {
    newDirectMessage: {
      subscribe: requiresDirectMessageAccess.createResolver(withFilter(
        () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
        (payload, args, { user }) => (payload.teamId === args.teamId) && (
          (payload.senderId === user.id && payload.receiverId === args.userId) ||
          (payload.senderId === args.userId && payload.receiverId === user.id)
        )
      ))
    }
  }
}
