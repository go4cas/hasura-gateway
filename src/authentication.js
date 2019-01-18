"use strict";

import ApolloClient, { gql } from 'apollo-boost';
import { _ } from 'lodash';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { reject } from 'async';

export class AuthenticationService {
  constructor(service) {
    this.service = service;
    // construct an Apollo Client to call the remote auth service
    this.client = new ApolloClient({
      uri: service.uri,
      request: operation => {
        operation.setContext({
          headers: service.auth.headers,
        });
      },
    });
  };

  async signToken (payload, secret, options) {
    const token = await jwt.sign(payload, secret, options);
    return token;  
  };

  async verifyToken (token, secret, options) {
    try {
      return await jwt.verify(token, secret, options);
    } catch (err){
      return false;
    }
  };

  async validateToken (token, options) {
    const valid = await this.verifyToken(token, process.env.GATWAY_JWT_KEY, options);
    return valid;  
  };

  async signup (username, password) {
    const hashedPassword = await bcrypt.hashSync(password, process.env.GATEWAY_AUT_SALT_ROUNDS);
    const mutation = gql`${this.service.auth.signupMutation}`;
    const variables = {
      [this.service.auth.params.username]: username,
      [this.service.auth.params.password]: hashedPassword
    };
    return await this.client.mutate({ mutation, variables })
    .then(res => {
      const user = _.get(res, this.service.auth.signupResponseObject);
      if (user) {
        return user;
      } else {
        reject();
      }
    })
    .catch(err => {
      return null;
    });
  };

  async login (username, password) {
    const query = gql`${this.service.auth.loginQuery}`;
    const variables = {
      [this.service.auth.params.username]: username
    };
    return await this.client.query({ query, variables })
    .then(res => {
      const user = _.get(res, this.service.auth.loginResponseObject);
      if (user) {
        if (bcrypt.compareSync(password, user[this.service.auth.params.password])) {
          const payload = {};
          payload[process.env.GATEWAY_JWT_CLAIMS_NAMESPACE] = {  // TODO: remove hardcoded values once ACL module has been implemented
            'x-hasura-allowed-roles': ['admin'],
            'x-hasura-default-role': 'admin',
          };
          const options = {
            subject: '',
            issuer: '',
            audience: '',
          };
          return this.signToken(payload, process.env.GATWAY_JWT_KEY, options);
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
  };
};
