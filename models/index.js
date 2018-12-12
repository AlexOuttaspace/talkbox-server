import Sequelize from 'sequelize'

const sequelize = new Sequelize('talkbox', 'postgres', '', {
  dialect: 'postgres',
  define: {
    underscored: true
  }
})

export const models = {
  User: sequelize.import('./user'),
  Channel: sequelize.import('./channel'),
  Message: sequelize.import('./message'),
  Team: sequelize.import('./team')
}

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models)
  }
})

models.sequelize = sequelize
models.Sequelize = Sequelize