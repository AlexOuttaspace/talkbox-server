import Sequelize from 'sequelize'

const {
  TEST_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_DB
} = process.env

console.log({
  TEST_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_DB
})

const sequelize = new Sequelize(
  TEST_DB || POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
    dialect: 'postgres',
    operatorsAliases: Sequelize.Op,
    host: process.env.DB_HOST,
    define: {
      underscored: true
    },
    logging: process.env.TEST_ENV !== '1'
  }
)

export const models = {
  User: sequelize.import('./user'),
  Channel: sequelize.import('./channel'),
  Message: sequelize.import('./message'),
  Team: sequelize.import('./team'),
  Member: sequelize.import('./member'),
  DirectMessage: sequelize.import('./direct-message'),
  PrivateMember: sequelize.import('./private-member')
}

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models)
  }
})

export const clearDb = async () => await Promise.all(
  Object.keys(models).map((key) => {
    if ([ 'sequelize', 'Sequelize' ].includes(key)) return null
    return models[key].destroy({ where: {}, force: true })
  })
)

export const disconnectDb = async () => await sequeslize.connectionManager.close().then(() => console.log('shutting down'))

models.sequelize = sequelize
models.Sequelize = Sequelize
