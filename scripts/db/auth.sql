/********* IMPORTANT *********/
-- ENSURE TO BE LOGGED ONTO THE auth DATABASE BEFORE RUNNING THIS SCRIPT
/****************************/

/********* INIT *********/
SET AUTOCOMMIT = ON;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
/***********************/


/******* SCHEMAs ******/
-- Hasura schema
CREATE SCHEMA IF NOT EXISTS hdb_catalog;
CREATE SCHEMA IF NOT EXISTS hdb_views;
/***********************/


/******* TABLEs *******/
-- user
CREATE TABLE "user"
(
   id                serial         NOT NULL,
   email             varchar(100)   NOT NULL,
   password          varchar(200)   NOT NULL,
   created_at        timestamptz    DEFAULT NOW(),
   updated_at        timestamptz
);

ALTER TABLE "user"
   ADD CONSTRAINT user_pkey
   PRIMARY KEY (id);

ALTER TABLE "user"
   ADD CONSTRAINT user_email_unique
   UNIQUE (email);
/***********************/


/** HASURA PRIVILEGES **/
-- Hasura schemas
GRANT ALL PRIVILEGES ON SCHEMA hdb_catalog TO hasurauser;
GRANT ALL PRIVILEGES ON SCHEMA hdb_views TO hasurauser;

-- postgres schemas
GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO hasurauser;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO hasurauser;

-- data schemas
GRANT ALL ON ALL TABLES IN SCHEMA public TO hasurauser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO hasurauser;
/***********************/


/******* CLEAN-UP ******/
/*
DROP TABLE IF EXISTS "user" CASCADE;
COMMIT;
*/
/***********************/
