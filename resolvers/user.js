const formatErrors = (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    return e.errors.map(({ message, path }) => ({ message, path }))
  }
  return [ { path: 'name', message: 'something went wrong' } ]
}

export const user = {
  Query: {
    getUser: (parent, { id }, { models }) => models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },

  Mutation: {
    register: async (parent, args, { models }) => {
      try {
        const registeredUser = await models.User.create(args)

        return {
          ok: true,
          user: registeredUser
        }
      } catch (error) {
        return {
          ok: false,
          errors: formatErrors(error, models)
        }
      }
    }
  }
}
