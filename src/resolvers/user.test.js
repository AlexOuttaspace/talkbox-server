import axios from 'axios'
import { clearDb, disconnectDb } from '../models'

describe('user resolvers', () => {

  beforeAll(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await disconnectDb()
  })

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
          'allUsers': []
        }
      }
    )
  })

  describe('authentication', () => {
    test('register', async () => {
      const response = await axios.post('http://localhost:3020/graphql', {
        query: `
          mutation {
            register(username: "testuser", email: "testuser@testuser.com", password: "testtest") {
              ok
              errors {
                path
                message
              }
            }
          }
        `
      })
  
      const { data } = response
  
      expect(data).toMatchObject({
        data: {
          register: {
            ok: true,
            errors: null
          }
        }
      })
    })

    test('login', async () => {
      const response = await axios.post('http://localhost:3020/graphql', {
        query: `
          mutation {
            login(email: "testuser@testuser.com", password: "testtest") {
              token
              refreshToken
            }
          }
        `
      })

      const { data: { login: { token, refreshToken } } } = response.data

      const response2 = await axios.post(
        'http://localhost:3020/graphql',
        {
          query: `
            mutation {
              createTeam(name: "team1") {
                ok
                team {
                  id
                  name
                }
              }
            }
          `
        },
        {
          headers: {
            'x-token': token,
            'x-refresh-token': refreshToken
          }
        },
      )

      expect(response2.data).toMatchObject({
        data: {
          createTeam: {
            ok: true,
            team: {
              name: 'team1'
            }
          }
        }
      })
    })
  })
})
