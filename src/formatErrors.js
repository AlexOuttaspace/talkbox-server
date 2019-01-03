export const formatErrors = (e) => {
  if (e.name === 'SequelizeUniqueConstraintError') {
    const path = e.parent.constraint.split('_')[1] // this is very hacky, but what can i do


    return [ { path, message: `this ${path} is already taken` } ]
  }

  if (e.name === 'SequelizeValidationError') {
    return e.errors.map(({ message, path }) => ({ message, path }))
  }

  return [ { path: 'name', message: 'something went wrong' } ]
}
