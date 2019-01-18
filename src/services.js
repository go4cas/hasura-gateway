"use strict";

export const services = [
  {
    name: 'books',
    uri: process.env.SERVICE_BOOKS_URI,
    key: process.env.SERVICE_BOOKS_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'book',
        entityField: 'author',
        linkingField: 'author_id',
        relatedService: 'authors',
        relatedEntity: 'author',
        relatedField: 'id'
      }
    ]
  },
  {
    name: 'authors',
    uri: process.env.SERVICE_AUTHORS_URI,
    key: process.env.SERVICE_AUTHORS_ACCESS_KEY
  },
  {
    name: 'auth',
    uri: process.env.SERVICE_AUTH_URI,
    key: process.env.SERVICE_AUTH_ACCESS_KEY,
    auth: {
      headers: {
        'X-Hasura-Access-Key': process.env.SERVICE_AUTH_ACCESS_KEY,
      },
      params: {
        username: 'email',
        password: 'password'
      },
      loginQuery: `
        query authUser($email: String!) {
          user (where: {email: {_eq: $email}}) {
            email
            password
          }
        }
      `,
      loginResponseObject: 'data.user[0]',
      signupMutation: `
        mutation insertUser($email: String!, $password: String!) {
          insert_user(objects: [{email: $email, password: $password}]) {
            returning {
              id
            }
          }
        }
      `,
      signupResponseObject: 'data.insert_user.returning[0]'
    }
  }
];