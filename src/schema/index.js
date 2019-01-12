import { mergeTypes } from 'merge-graphql-schemas'

import { channel } from './channel'
import { message } from './message'
import { team } from './team'
import { user } from './user'
import { error } from './error'
import { directMessages } from './direct-messages'

export const schema = mergeTypes([
  channel,
  message,
  team,
  user,
  error,
  directMessages
], { all: true })
