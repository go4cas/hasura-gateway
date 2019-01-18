/********* IMPORTANT *********/
-- ENSURE TO BE LOGGED ONTO THE authors DATABASE BEFORE RUNNING THIS SCRIPT
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
-- author
CREATE TABLE author
(
   id                serial         NOT NULL,
   name              varchar(100)   NOT NULL,
   created_at        timestamptz    DEFAULT NOW(),
   updated_at        timestamptz
);

ALTER TABLE author
   ADD CONSTRAINT author_pkey
   PRIMARY KEY (id);

ALTER TABLE author
   ADD CONSTRAINT author_name_unique
   UNIQUE (name);
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


/** TEST DATA **/
INSERT INTO author (name) VALUES ('Leo Tolstoy');
INSERT INTO author (name) VALUES ('Gustave Flaubert');
INSERT INTO author (name) VALUES ('F. Scott Fitzgerald');
INSERT INTO author (name) VALUES ('Vladimir Nabokov');
INSERT INTO author (name) VALUES ('George Eliot');
INSERT INTO author (name) VALUES ('Mark Twain');
INSERT INTO author (name) VALUES ('Anton Chekhov');
INSERT INTO author (name) VALUES ('Marcel Proust');
INSERT INTO author (name) VALUES ('William Shakespeare');
/***************/


/******* CLEAN-UP ******/
/*
DROP TABLE IF EXISTS author CASCADE;
COMMIT;
*/
/***********************/
