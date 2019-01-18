/********* IMPORTANT *********/
-- ENSURE TO BE LOGGED ONTO THE books DATABASE BEFORE RUNNING THIS SCRIPT
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
-- book
CREATE TABLE book
(
   id                serial         NOT NULL,
   title             varchar(200)   NOT NULL,
   author_id         integer,
   created_at        timestamptz    DEFAULT NOW(),
   updated_at        timestamptz
);

ALTER TABLE book
   ADD CONSTRAINT book_pkey
   PRIMARY KEY (id);

ALTER TABLE book
   ADD CONSTRAINT book_title_unique
   UNIQUE (title);
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
INSERT INTO book (title,author_id) VALUES ('Anna Karenina',1);
INSERT INTO book (title,author_id) VALUES ('Madame Bovary',2);
INSERT INTO book (title,author_id) VALUES ('War and Peace',1);
INSERT INTO book (title,author_id) VALUES ('The Great Gatsby',3);
INSERT INTO book (title,author_id) VALUES ('Lolita',4);
INSERT INTO book (title,author_id) VALUES ('Middlemarch',5);
INSERT INTO book (title,author_id) VALUES ('The Adventures of Huckleberry Finn',6);
INSERT INTO book (title,author_id) VALUES ('The Stories of Anton Chekhov',7);
INSERT INTO book (title,author_id) VALUES ('In Search of Lost Time',8);
INSERT INTO book (title,author_id) VALUES ('Hamlet',9);
/***************/


/******* CLEAN-UP ******/
/*
DROP TABLE IF EXISTS book CASCADE;
COMMIT;
*/
/***********************/
