"use strict";

export const services = [
  {
    name: 'tribes',
    uri: process.env.SERVICE_TRIBES_URI,
    key: process.env.SERVICE_TRIBES_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'employees',
        entityField: 'user',
        linkingField: 'user_id',
        relatedService: 'padlock',
        relatedEntity: 'users',
        relatedField: 'id'
      },
      {
        entity: 'employee_statuses',
        entityField: 'state',
        linkingField: 'state_type_id',
        relatedService: 'state',
        relatedEntity: 'state_types',
        relatedField: 'id'
      }
    ]
  },
  {
    name: 'padlock',
    uri: process.env.SERVICE_PADLOCK_URI,
    key: process.env.SERVICE_PADLOCK_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'user_statuses',
        entityField: 'state',
        linkingField: 'state_type_id',
        relatedService: 'state',
        relatedEntity: 'state_types',
        relatedField: 'id'
      }
    ],
    authService: true
  },
  {
    name: 'unplugged',
    uri: process.env.SERVICE_UNPLUGGED_URI,
    key: process.env.SERVICE_UNPLUGGED_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'notifications_brands',
        entityField: 'brand',
        linkingField: 'brand_id',
        relatedService: 'tribes',
        relatedEntity: 'brands',
        relatedField: 'id'
      },
      {
        entity: 'notification_statuses',
        entityField: 'state',
        linkingField: 'state_type_id',
        relatedService: 'state',
        relatedEntity: 'state_types',
        relatedField: 'id'
      },
      {
        entity: 'notification_updates',
        entityField: 'user',
        linkingField: 'user_id',
        relatedService: 'padlock',
        relatedEntity: 'users',
        relatedField: 'id'
      }
    ]
  },
  {
    name: 'state',
    uri: process.env.SERVICE_STATE_URI,
    key: process.env.SERVICE_STATE_ACCESS_KEY
  },
  {
    name: 'agrade',
    uri: process.env.SERVICE_AGRADE_URI,
    key: process.env.SERVICE_AGRADE_ACCESS_KEY,
    relatedServices: [
      {
        entity: 'questionnaires_brands',
        entityField: 'brand',
        linkingField: 'brand_id',
        relatedService: 'tribes',
        relatedEntity: 'brands',
        relatedField: 'id'
      },
      {
        entity: 'assessment_statuses',
        entityField: 'state',
        linkingField: 'state_type_id',
        relatedService: 'state',
        relatedEntity: 'state_types',
        relatedField: 'id'
      },
      {
        entity: 'assessment_events',
        entityField: 'userActionedBy',
        linkingField: 'actioned_by_user_id',
        relatedService: 'padlock',
        relatedEntity: 'users',
        relatedField: 'id'
      },
      {
        entity: 'assessment_events',
        entityField: 'userAssignedTo',
        linkingField: 'assigned_to_user_id',
        relatedService: 'padlock',
        relatedEntity: 'users',
        relatedField: 'id'
      },
      {
        entity: 'interactions',
        entityField: 'brand',
        linkingField: 'brand_id',
        relatedService: 'tribes',
        relatedEntity: 'brands',
        relatedField: 'id'
      },
      {
        entity: 'interactions',
        entityField: 'userAgent',
        linkingField: 'agent_to_user_id',
        relatedService: 'padlock',
        relatedEntity: 'users',
        relatedField: 'id'
      },
      {
        entity: 'interaction_links',
        entityField: 'appLinkTemplate',
        linkingField: 'app_link_template_id',
        relatedService: 'tribes',
        relatedEntity: 'app_link_templates',
        relatedField: 'id'
      }
    ]
  }
];
