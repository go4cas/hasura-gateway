/********* INIT *********/
SET AUTOCOMMIT = ON;
/***********************/


/***** CREATE DB's *****/
CREATE DATABASE books;
CREATE DATABASE authors;
CREATE DATABASE auth;
/***********************/


/***** ADMIN USERS *****/
-- Hasura admin
CREATE USER hasurauser WITH PASSWORD 'hasurauser';
/***********************/
