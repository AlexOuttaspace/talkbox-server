import { mergeResolvers } from 'merge-graphql-schemas'

import { channel } from './channel'
import { message } from './message'
import { team } from './team'
import { user } from './user'
import { directMessage } from './direct-message'

export const resolvers = mergeResolvers([
  channel,
  message,
  team,
  user,
  directMessage
])
