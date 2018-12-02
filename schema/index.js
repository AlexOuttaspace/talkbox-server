import { mergeTypes } from 'merge-graphql-schemas'

import { channel } from './channel'
import { message } from './message'
import { team } from './team'
import { user } from './user'

export const schema = mergeTypes([
  channel,
  message,
  team,
  user
], { all: true })
