-- A second database for the PostgreSQL-backed integration tests, so a test run
-- never touches development data.
CREATE DATABASE finwise_test OWNER finwise;
