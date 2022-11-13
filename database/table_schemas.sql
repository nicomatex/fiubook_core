CREATE TYPE BOOKING_TYPE AS ENUM ('AUTOMATIC','REQUIRES_CONFIRMATION');
CREATE TYPE UNIVERSITY_ROLE AS ENUM ('PROFESSOR','STUDENT','NODO');

CREATE TABLE IF NOT EXISTS users(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    dni VARCHAR(128) NOT NULL UNIQUE,
    roles UNIVERSITY_ROLE[] NOT NULL
);

-- Index on timestamp used for pagination
CREATE INDEX ts_idx_users ON users USING btree (ts);

CREATE TABLE IF NOT EXISTS services(
        id CHAR(36) PRIMARY KEY,
        ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
		publisher_id CHAR(36) REFERENCES users(id),
        name VARCHAR(128) NOT NULL,
        description VARCHAR(512),
        granularity INTERVAL,
        min_time INTEGER NOT NULL DEFAULT '1',
        max_time INTEGER,
        booking_type BOOKING_TYPE,
        allowed_roles UNIVERSITY_ROLE[]
);

-- Index on timestamp used for pagination
CREATE INDEX ts_idx_services ON services USING btree (ts);

CREATE TABLE IF NOT EXISTS bookings(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    service_id CHAR(36) REFERENCES services(id),
    requestor_id CHAR(36) REFERENCES users(id),
    publisher_id CHAR(36) REFERENCES users(id),
    start_date TIMESTAMPTZ NOT NULL, 
    duration INTERVAL NOT NULL
);

-- Index on timestamp used for pagination
CREATE INDEX ts_idx_bookings ON bookings USING btree (ts);

-- TODO: Improve security of database access
CREATE USER sysuser WITH PASSWORD 'pistacho';
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sysuser;