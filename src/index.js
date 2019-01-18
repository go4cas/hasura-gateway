"use strict";

import { } from 'dotenv/config';
import { _ } from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from 'apollo-server-express';
import 'cross-fetch/polyfill';
import { mergeSchemas } from 'graphql-tools';
import { getRemoteSchema, buildRelatedResolver, buildRelatedTypeDef } from './utils';
import { services } from './services';
import { AuthenticationService } from './authentication';


const runServer = async () => {
  const remoteSchemas = [];
  const resolvers = {};
  let typeDefs = '';

  // build remote schemas for each defined service
  for (const service of services) {
    const headers = {
      'X-Hasura-Access-Key': service.key  // TODO: explore option to include JWT or webhook
    };
    const remoteSchema = await getRemoteSchema(
      service.uri,
      headers
    );
    remoteSchema.name = service.name;
    remoteSchemas.push(remoteSchema);
    // if the service has related services (inter-service realtions), build the typeDefs and resolvers
    if (service.relatedServices) {
      for (const relatedService of service.relatedServices) {
        typeDefs += await buildRelatedTypeDef(relatedService);
        resolvers[relatedService.entity] = await buildRelatedResolver(remoteSchemas, relatedService);
      }
    }
  };
  await remoteSchemas.push(typeDefs);

  // merge all the remote service schemas into a single gateway schema
  const mergedSchema = await mergeSchemas({
    schemas: remoteSchemas,
    resolvers
  });

  // find service that is flagged as the authentication service and construct auth service
  const authService = await _.find(services, 'auth');
  const authenticationService = await new AuthenticationService(authService);
  
  // construct the gateway GraphQL server, using Apollo Server
  const server = await new ApolloServer({
    schema: mergedSchema,
    introspection: true,
    playground: true,
  });

  // for auth routes we need to use express
  const app = await express();
  await app.use(bodyParser.json());

  // middleware to intercept /graphql calls - specifically to do auth checks
  await app.use('/graphql', async(req, res, next) => {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const options = {};
      const valid = await authenticationService.validateToken(token, options);
      if (valid) {
        next();
      } else {
        res.status(401).json({ error: 'invalid authentication token' });
      };
    } else {
      res.status(401).json({ error: 'missing authorization header' });
    }
  });

  // login route
  await app.post('/login', async(req, res) => {
    const { email, password } = await req.body;

    const token = await authenticationService.login(email, password);
    if (token) {
      res.json({ token });
    } else {
      res.status(401).json({ error: 'invalid email address or password' });
    }
  });

  // signup route
  await app.post('/signup', async(req, res) => {
    const { email, password } = await req.body;

    const user = await authenticationService.signup(email, password);
    if (user) {
      res.json({ user });
    } else {
      res.status(400).json({ error: 'could not register email address' });
    }
  });

  // route for Docker healthcheck
  await app.get('/health', async(req, res) => {
    res.status(200).send('healthy!');
  });

  // after all express middleware and routes have been defined, only then apply it as middleware to the Apollo Server
  await server.applyMiddleware({ app });

  // start the server
  const port = process.env.GATEWAY_PORT || 4000;
  await app.listen({ port }, () => {
    console.log('server running on port',process.env.GATEWAY_PORT);
  });
};

try {
  runServer();
} catch (error) {
  console.error(error, error.message, error.stack);
};

// signal events
process.on('SIGINT', () => {
  console.error('SIGINT. Graceful shutdown ');
  process.exit();
});

process.on('SIGTERM', () => {
  console.error('SIGTERM. Graceful shutdown ');
  process.exit();
});
