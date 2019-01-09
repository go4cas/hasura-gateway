"use strict";

export const services = [
  {
    name: 'books',
    uri: process.env.SERVICE_BOOKS_URI,
    key: process.env.SERVICE_BOOKS_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'books',
        entityField: 'author',
        linkingField: 'author_id',
        relatedService: 'authors',
        relatedEntity: 'authors',
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
        entity: 'authors',
        entityField: 'books',
        linkingField: 'book_id',
        relatedService: 'books',
        relatedEntity: 'books',
        relatedField: 'id'
      }
    ]
  },
  {
    name: 'auth',
    uri: process.env.SERVICE_AUTH_URI,
    key: process.env.SERVICE_AUTH_ACCESS_KEY,
    authService: true
  }
];
