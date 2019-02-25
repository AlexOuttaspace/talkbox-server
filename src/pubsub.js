import { RedisPubSub } from 'graphql-redis-subscriptions'

export const pubsub = new RedisPubSub({
  connection: {
    host: '127.0.0.1',
    port: 6379,
    retry_strategy: (options) => Math.max(options.attempt * 100, 3000) // eslint-disable-line camelcase
  }
})
