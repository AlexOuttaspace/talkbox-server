import { requiresAuth, requiresTeamAccess } from '../permissions'
import { withFilter } from 'apollo-server-express'
import fs from 'fs'
import { pubsub } from '../pubsub'
import dayjs from 'dayjs'

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE'

const FILES_FOLDER = 'files'

const storeFS = ({ stream, filename }) => {
  const filePath = `${FILES_FOLDER}/${filename}`

  return new Promise((resolve, reject) =>
    stream
      .on('error', (error) => {
        if (stream.truncated)
          // Delete the truncated file.
          fs.unlinkSync(filePath)
        reject(error)
      })
      .pipe(fs.createWriteStream(filePath))
      .on('error', (error) => reject(error))
      .on('finish', () => resolve({ filePath }))
  )
}

const processUpload = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload

  const stream = createReadStream()
  const { filePath } = await storeFS({ stream, filename })

  // defining file type like this is pretty bad, so I might change it later
  return { filePath, filetype: mimetype }
}

export const message = {
  Mutation: {
    createMessage: requiresAuth.createResolver(async (parent, { file, ...args }, { models, user }) => {
      try {
        const messageData = args

        if (file) {
          try {
            const { filePath, filetype } = await processUpload(file[0])

            messageData.url = filePath
            messageData.filetype = filetype
          } catch (error) {
            console.log(error)
            return false
          }
        }

        const createdMessage = await models.Message.create({ ...messageData, userId: user.id })

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
    messages: requiresAuth.createResolver(async (parent, { cursor, channelId }, { models, user }) => {
      const channel = models.Channel.findOne({ where: { id: channelId }, raw: true })

      if (channel.private) {
        const member = await models.PrivateMembers.findOne({ raw: true, where: { channelId, userId: user.id } })

        if (!member) {
          throw new Error('Not Authorized')
        }
      }

      const options = {
        order: [ [ 'created_at', 'DESC' ] ],
        where: { channelId },
        limit: 20
      }


      if (cursor) {
        options.where.created_at = {
          [models.Sequelize.Op.lt]: dayjs(+cursor).toISOString()
        }
      }

      return models.Message.findAll(
        options,
        { raw: true },
      )
    })
  },
  Message: {
    url: (parent, _, { serverUrl }) => {
      return parent.url ? `${serverUrl}/${parent.url}` : parent.url
    },
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
