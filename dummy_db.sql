-- Connect to the database
\c db_interview_abdul_ghaffar;

-- Create tables
CREATE TABLE tbl_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tbl_modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tbl_testcases (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES tbl_modules(id),
    testcase_id VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL
);