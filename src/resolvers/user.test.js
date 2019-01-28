import axios from 'axios'

describe('user resolvers', () => {
  test('allUsers', async () => {
    const response = await axios.post('http://localhost:3020/graphql', {
      query: `
        query {
          allUsers {
            id
            username
            email
          }
        }
      `
    })

    const { data } = response
    
    expect(data).toMatchObject(
      {
        'data': {
          'allUsers': [
            {
              'id': 1,
              'username': 'alex',
              'email': 'alex@asd.com'
            },
            {
              'id': 2,
              'username': 'sam',
              'email': 'sam@asd.com'
            },
            {
              'id': 3,
              'username': 'dave',
              'email': 'dave@asd.com'
            },
            {
              'id': 4,
              'username': 'tom',
              'email': 'tom@asd.com'
            },
            {
              'id': 5,
              'username': 'daria',
              'email': 'daria@asd.com'
            },
            {
              'id': 6,
              'username': 'Ian',
              'email': 'ian@asd.com'
            },
            {
              'id': 7,
              'username': 'stan',
              'email': 'stan@asd.com'
            },
            {
              'id': 8,
              'username': 'aria',
              'email': 'aria@asd.com'
            }
          ]
        }
      }
    )
  })
})
