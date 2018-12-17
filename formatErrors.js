export const formatErrors = (e) => {
  if (e.name === 'SequelizeUniqueConstraintError') {
    return [ { path: e.parent.constraint, message: 'field is not unique' } ]
  }

  if (e.name === 'SequelizeValidationError') {
    return e.errors.map(({ message, path }) => ({ message, path }))
  }

  return [ { path: 'name', message: 'something went wrong' } ]
}
