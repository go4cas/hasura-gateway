"use strict";

import { } from 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { ApolloServer } from 'apollo-server-express';
import 'cross-fetch/polyfill';
import { mergeSchemas } from 'graphql-tools';
import { getRemoteSchema, buildRelatedResolver, buildRelatedTypeDef } from './utils';
import { services } from './services';
import { sign, authService, validToken } from './authenticate';
import { reject } from 'async';
import ApolloClient, { gql } from 'apollo-boost';


const runServer = async () => {
  const remoteSchemas = [];
  const resolvers = {};
  let typeDefs = '';

  for (const service of services) {
    const headers = {
      'X-Hasura-Access-Key': service.key
    };
    const remoteSchema = await getRemoteSchema(
      service.uri,
      headers
    );
    remoteSchema.name = service.name;
    remoteSchemas.push(remoteSchema);
    if (service.relatedServices) {
      for (const relatedService of service.relatedServices) {
        typeDefs += await buildRelatedTypeDef(relatedService);
        resolvers[relatedService.entity] = await buildRelatedResolver(remoteSchemas, relatedService);
      }
    }
  };
  await remoteSchemas.push(typeDefs);

  const mergedSchema = await mergeSchemas({
    schemas: remoteSchemas,
    resolvers
  });

  const authClient = await authService()
  .then(service => {
    return new ApolloClient({
      uri: service.uri,
      request: operation => {
        operation.setContext({
          headers: {
            'X-Hasura-Access-Key': service.key,
          },
        });
      },
    });
  });
  
  const server = await new ApolloServer({
    schema: mergedSchema,
    introspection: true,
    playground: true,
  });

  const app = await express();
  await app.use(bodyParser.json());

  await app.use('/graphql', async(req, res, next) => {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const options = {};
      const valid = validToken(token, options);
      if (valid) {
        next();
      } else {
        res.status(401).json({ error: 'invalid authentication token' });
      };
    } else {
      res.status(401).json({ error: 'missing authorization header' });
    }
  });

  await app.post('/login', async(req, res) => {
    const { email, password } = await req.body;
    const query = gql`
      query authUser($email: String!) {
        users (where: {email: {_eq: $email}}) {
          email
          password
        }
      }
    `;
    const variables = {
      "email": email
    };
    const token = await authClient.query({ query, variables })
    .then(res => {
      if (res.data.users[0]) {
        if (bcrypt.compareSync(password, res.data.users[0].password)) {
          const payload = {};
          payload[process.env.GATEWAY_JWT_CLAIMS_NAMESPACE] = {
            'x-hasura-allowed-roles': ['admin'],
            'x-hasura-default-role': 'admin',
          };
          const options = {
            subject: '',
            issuer: '',
            audience: '',
          };
          return sign(payload, process.env.GATWAY_JWT_KEY, options);  
        } else {
          reject();
        };
      } else {
        reject();
      }
    })
    .catch(err => {
      return null;
    });
    if (token) {
      res.json({ token });
    } else {
      res.status(401).json({ error: 'invalid email address or password' });
    }
  });

  await app.post('/signup', async(req, res) => {
    const { email, password } = await req.body;
    const hashedPassword = bcrypt.hashSync(password, process.env.GATEWAY_AUT_SALT_ROUNDS);
    const mutation = gql`
      mutation insertUsers($email: String!, $password: String!) {
        insert_users(objects: [{email: $email, password: $password, user_status_id: 1}]) {
          returning {
            id
          }
        }
      }
    `;
    const variables = {
      "email": email,
      "password": hashedPassword
    };
    const user = await authClient.mutate({ mutation, variables })
    .then(res => {
      if (res.data.insert_users.returning[0]) {
        return res.data.insert_users.returning[0];
      } else {
        reject();
      }
    })
    .catch(err => {
      return null;
    });

    if (user) {
      res.json({ user });
    } else {
      res.status(400).json({ error: 'could not register email address' });
    }
  });

  await app.get('/health', async(req, res) => {
    res.status(200).send('healthy!');
  });

  await server.applyMiddleware({ app });

  const port = process.env.GATEWAY_PORT || 4000;
  await app.listen({ port }, () => {
    console.log('server running on port',process.env.GATEWAY_PORT);
  });
}

try {
  runServer();
} catch (error) {
  console.error(error, error.message, error.stack);
};

process.on('SIGINT', () => {
  console.error('SIGINT. Graceful shutdown ');
  process.exit();
});

process.on('SIGTERM', () => {
  console.error('SIGTERM. Graceful shutdown ');
  process.exit();
});
