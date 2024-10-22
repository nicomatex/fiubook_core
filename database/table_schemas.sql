CREATE TYPE BOOKING_TYPE AS ENUM ('AUTOMATIC', 'REQUIRES_CONFIRMATION');
CREATE TYPE UNIVERSITY_ROLE AS ENUM ('PROFESSOR', 'STUDENT', 'NODO');
CREATE TYPE BOOKING_STATUS AS ENUM('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'PENDING_RETURN', 'RETURNED');
CREATE TYPE NOTIFICATION_TYPE AS ENUM('NEW_BOOKING_REQUEST','BOOKING_REQUEST_ACCEPTED','BOOKING_REQUEST_REJECTED','BOOKING_CANCELLED','BOOKING_REQUEST_CANCELLED', 'OBJECT_DELIVERED', 'OBJECT_RETURNED');

CREATE TABLE IF NOT EXISTS users(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    dni VARCHAR(128) NOT NULL UNIQUE,
    roles UNIVERSITY_ROLE[] NOT NULL,
    can_publish_services BOOLEAN NOT NULL,
    is_admin BOOLEAN NOT NULL,
    is_banned BOOLEAN NOT NULL DEFAULT false
    name VARCHAR(64),
    lastname VARCHAR(64),
    email VARCHAR(320)
);

-- Index on timestamp used for pagination
CREATE INDEX ts_idx_users ON users USING btree (ts);

CREATE TABLE IF NOT EXISTS services(
        id CHAR(36) PRIMARY KEY,
        ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
		publisher_id CHAR(36) REFERENCES users(id),
        name VARCHAR(128) NOT NULL,
        description VARCHAR(512),
        granularity INTEGER NOT NULL,
        max_time INTEGER NOT NULL DEFAULT 1,
        booking_type BOOKING_TYPE NOT NULL,
        returnable BOOLEAN NOT NULL DEFAULT false,
        allowed_roles UNIVERSITY_ROLE[] NOT NULL,
        tags VARCHAR(128)[] DEFAULT '{}',
        image_url VARCHAR(512) NOT NULL,
        search_index tsvector GENERATED ALWAYS AS (to_tsvector('spanish', name || ' ' || description || ' ' || array_to_string(tags, ' '))) STORED -- Index column for term searching
);

-- Index on timestamp used for pagination
CREATE INDEX ts_idx_services ON services USING btree (ts);
CREATE INDEX search_idx_services ON services USING GIN (search_index); -- Index used for searching

CREATE TABLE IF NOT EXISTS bookings(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    service_id CHAR(36) REFERENCES services(id) ON DELETE CASCADE,
    requestor_id CHAR(36) REFERENCES users(id),
    publisher_id CHAR(36) REFERENCES users(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    booking_status BOOKING_STATUS NOT NULL
);

-- Index on timestamp used for pagination
CREATE INDEX ts_idx_bookings ON bookings USING btree (ts);

CREATE TABLE IF NOT EXISTS notifications(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    receiver_id CHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    type NOTIFICATION_TYPE NOT NULL,
    booking_id CHAR(36) REFERENCES bookings(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX ts_idx_notifications ON notifications USING btree (ts);

-- TODO: Improve security of database access
CREATE USER sysuser WITH PASSWORD 'pistacho';
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sysuser;
