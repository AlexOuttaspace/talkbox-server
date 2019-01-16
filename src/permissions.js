export const createResolver = (resolver) => {
  const baseResolver = resolver

  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info)
      return childResolver(parent, args, context, info)
    }

    return createResolver(newResolver)
  }
  return baseResolver
}

export const requiresAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated')
  }
})

export const requiresTeamAccess = createResolver(async (parent, { channelId }, { models, user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated')
  }

  const channel = await models.Channel.findOne({ where: { id: channelId } })
  const member = await models.Member.findOne({
    where: { teamId: channel.teamId, userId: user.id }
  })

  if (!member) {
    throw new Error('Unauthorized')
  }
})

export const requiresDirectMessageAccess = createResolver(async (parent, { teamId, userId }, { models, user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated')
  }

  const members = await models.Member.findAll({
    where: { teamId, [models.sequelize.Op.or]: [ { userId: user.id }, { userId } ] }
  })

  if (!members.length === 2) {
    throw new Error('Something went wrong')
  }
})
