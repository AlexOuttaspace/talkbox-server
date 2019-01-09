import { requiresAuth } from '../permissions'

export const message = {
  Mutation: {
    createMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        await models.Message.create({ ...args, userId: user.id })
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
  }
}
