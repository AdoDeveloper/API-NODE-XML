CREATE DATABASE crud_api;

USE crud_api;
 
CREATE TABLE users (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
 name VARCHAR(255) NOT NULL, 
 email VARCHAR(255) NOT NULL,
 password VARCHAR(255) NOT NULL
);

select * from users;