DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

USE company_db;

CREATE TABLE employee (
id INT AUTO_INCREMENT,
first_name VARCHAR(250),
last_name VARCHAR(250),
role_id INT,
department_id INT,
manager_id INT ,
PRIMARY KEY (id)
);


CREATE TABLE role(
id INT AUTO_INCREMENT,
title VARCHAR(250),
salary DECIMAL(10,4),
department_id INT,
PRIMARY KEY (id)
);
CREATE TABLE department(
id INT AUTO_INCREMENT,
name VARCHAR(30),
PRIMARY KEY (id)
)