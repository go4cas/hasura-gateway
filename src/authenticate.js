"use strict";

import { _ } from 'lodash';
import ApolloClient, { gql } from 'apollo-boost';
import * as jwt from 'jsonwebtoken';
import { services } from './services';

export const authService = async () => {
  // find service that is flagged as the authentication service
  return await _.find(services, { 'authService': true });
};

export const sign = async (payload, secret, options) => {
  const token = await jwt.sign(payload, secret, options);
  return token;
};

export const verify = async (token, secret, options) => {
  try {
    return await jwt.verify(token, secret, options);
  } catch (err){
    return false;
  }
};

export const validToken = async (token, options) => {
  const valid = await verify(token, process.env.GATWAY_JWT_KEY, options);
  return valid;
};
