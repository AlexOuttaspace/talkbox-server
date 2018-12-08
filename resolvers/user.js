import bcrypt from 'bcrypt'

export const user = {
  Query: {
    getUser: (parent, { id }, { models }) => models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },

  Mutation: {
    register: async (parent, { password, ...otherArgs }, { models }) => {
      try {
        const hashedPassword = await bcrypt.hash(password, 12)

        const registeredUser = await models.User.create({
          password: hashedPassword,
          ...otherArgs
        })

        return registeredUser
      } catch (err) {
        console.log(err)
        return {}
      }
    }
  }
}
