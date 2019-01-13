import { requiresAuth } from '../permissions'

export const directMessage = {
  Mutation: {
    createDirectMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const createdDirectMessage = await models.DirectMessage.create({ ...args, senderId: user.id })
        
        // const asyncFunc = async () => {
        //   const foundUser = await models.User.findOne({
        //     where: {
        //       id: user.id
        //     }
        //   })
  
        //   pubsub.publish(NEW_CHANNEL_MESSAGE, {
        //     newChannelMessage: {
        //       ...createdMessage.dataValues,
        //       user: foundUser.dataValues
        //     },
        //     channelId: args.channelId
        //   })
        // }

        // asyncFunc()
     
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
  }
}
