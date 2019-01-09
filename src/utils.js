"use strict";

import { _ } from 'lodash';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import ws from 'ws';
import { makeRemoteExecutableSchema, introspectSchema } from 'graphql-tools';
import fetch from 'node-fetch';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { services } from './services';

export const getRemoteSchema = async (uri, headers) => {
  const link = makeHttpAndWsLink(uri, headers);
  const schema = await introspectSchema(link);
  return makeRemoteExecutableSchema({
    schema,
    link
  });
};

const makeHttpAndWsLink = (uri, headers) => {
  const httpLink = new HttpLink({
    uri,
    fetch,
    headers
  });

  const wsLink = new WebSocketLink(new SubscriptionClient(
    uri,
    {
      reconnect: true,
      connectionParams: {
        headers
      }
    },
    ws
  ));

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

  return link;
};

// build typeDefs for any realted services (cross-service relations)
export const buildRelatedTypeDef = async (resolverObject) => {
 const relatedTypeDef = `extend type ${resolverObject.entity} {
  ${resolverObject.entityField}: ${resolverObject.relatedEntity}!
 }
 `;
 return relatedTypeDef;
};

// build resolvers for related entities
export const buildRelatedResolver = async (mergedSchema, resolverObject) => {
  const relatedEntity = {
    [resolverObject.entityField]: {
      fragment: `fragment ${resolverObject.entityField}Fragment on ${resolverObject.entity} {${resolverObject.linkingField}}`,
      resolve: (parent, args, context, info) => {
        const { id } = parent[resolverObject.linkingField];
        return info.mergeInfo.delegateToSchema({
          schema: _.find(mergedSchema, { 'name': resolverObject.relatedService }),
          operation: 'query',
          fieldName: resolverObject.relatedEntity,
          args: {where: {[resolverObject.relatedField]: {_eq: id}}},  // TODO: see if the _by_pk helper queries will work better
          context,
          info
        })
        .then (response => {
          return response[0];
        })
      }
    }
  };
  return relatedEntity;
};
