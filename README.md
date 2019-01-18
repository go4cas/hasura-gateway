## Hasura Gateway
A proof-of-concept (and opinionated) GraphQL API gateway for [Hasura](https://hasura.io/) microservices.
> Inspired by [this blog post](https://blog.hasura.io/the-ultimate-guide-to-schema-stitching-in-graphql-f30178ac0072) and the [Hasura examples](https://github.com/hasura/schema-stitching-examples).

#### Introduction
The Hasura Gateway is intended to create a single entry point from client applications (web apps, mobile apps, etc) into an ecosystem of [Hasura](https://hasura.io/) microservices.

The general architecture looks like this:

![alt text](assets/arch.png)

#### Installation
- Clone this repo: `git clone https://github.com/go4cas/hasura-gateway.git`
- Install dependencies, from project root: `npm install`
- Define services and inter-service dependencies (see _Concepts_ section below)
- Include environment variables (`.env` or `dev.env`file)
- Run db scripts on your Postgres instance: `sricpts/db/db_create.sql` (to create the databases and user accounts for the microservices db's), then `scripts/db/books.sql`, `scripts/db/authors.sql` and `scripts/db/auth.sql` to generate the schemas for each of the microservices db's
- If you are uding Docker, build the local `hasura-gateway` image, using: `npm run build`
- Start the local gateway: `npm run serve`, or using docker-compose (to start gateway, microservices and Postgres): `docker-compose up -d`

#### Using
- Register a user, `POST`ing to the `/signup` endpoint (email/username and password to be included in the body)
- Login with the newly created user by `POST`ing to the `/login` endpoint (email/username and password to be included in the body)
- Query inter-realted services by `POST`ing to the ``/graphql` endpoint, e.g. body: `{"query": "{book {title author {name}}}"}` (remember to include `Authorization: Bearer <<token here>>`)

#### Helper Scripts
- Local Dev Environment (including hot reloading): `npm run serve`
- Build deployment artefacts: `npm run build-local`
- Build local docker image: `npm run build-docker`
- Build and package production docker image: `npm run build`

#### Concepts
Services, and their relationships are defined in the `/src/services.js` file:
```javascript
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
    key: process.env.SERVICE_AUTHORS_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'author',
        entityField: 'books',
        linkingField: 'book_id',
        relatedService: 'books',
        relatedEntity: 'book',
        relatedField: 'id'
      }
    ]
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
```

#### To Do
- [ ] Add refresh token, including token expiry, and persisting refresh tokens to db
- [ ] Add ACL and set x-hasura-allowed-roles, x-hasura-default-role and x-hasura-user-id headers
- [ ] Test subscriptions
