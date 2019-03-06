import { RedisPubSub } from 'graphql-redis-subscriptions'

export const pubsub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    retry_strategy: (options) => Math.max(options.attempt * 100, 3000) // eslint-disable-line camelcase
  }
})
