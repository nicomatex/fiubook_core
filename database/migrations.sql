ALTER TABLE users ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bookings ALTER COLUMN service_id TYPE CHAR(36) REFERENCES services(id) ON DELETE CASCADE;
ALTER TYPE BOOKING_STATUS ADD VALUE IF NOT EXISTS 'PENDING_RETURN' AFTER 'CANCELLED';
ALTER TYPE BOOKING_STATUS ADD VALUE IF NOT EXISTS 'RETURNED' AFTER 'PENDING_RETURN';
ALTER TABLE services ADD COLUMN returnable BOOLEAN NOT NULL DEFAULT false;
-- tag search migration
ALTER TABLE services ALTER COLUMN search_index SET DATA TYPE tsvector USING to_tsvector('spanish', name || ' ' || description || ' ' || array_to_string(tags, ' '));
<<<<<<< HEAD
-- notifications migration
CREATE TYPE NOTIFICATION_TYPE AS ENUM('NEW_BOOKING_REQUEST','BOOKING_REQUEST_ACCEPTED','BOOKING_REQUEST_REJECTED','BOOKING_CANCELLED','BOOKING_REQUEST_CANCELLED', 'OBJECT_DELIVERED', 'OBJECT_RETURNED');

CREATE TABLE IF NOT EXISTS notifications(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    receiver_id CHAR(36) REFERENCES users(id),
    type NOTIFICATION_TYPE NOT NULL,
    booking_id CHAR(36) REFERENCES bookings(id),
    read BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX ts_idx_notifications ON notifications USING btree (ts);
=======
-- user profile migration
ALTER TABLE users ADD COLUMN name VARCHAR(64);
ALTER TABLE users ADD COLUMN lastname VARCHAR(64);
ALTER TABLE users ADD COLUMN email VARCHAR(320);
<<<<<<< HEAD
>>>>>>> ab8d83b (Add profile fields: email, name and lastname (#52))
=======
-- notifications migration
CREATE TYPE NOTIFICATION_TYPE AS ENUM('NEW_BOOKING_REQUEST','BOOKING_REQUEST_ACCEPTED','BOOKING_REQUEST_REJECTED','BOOKING_CANCELLED','BOOKING_REQUEST_CANCELLED', 'OBJECT_DELIVERED', 'OBJECT_RETURNED');

CREATE TABLE IF NOT EXISTS notifications(
    id CHAR(36) PRIMARY KEY,
    ts TIMESTAMPTZ (2) DEFAULT current_timestamp,
    receiver_id CHAR(36) REFERENCES users(id),
    type NOTIFICATION_TYPE NOT NULL,
    booking_id CHAR(36) REFERENCES bookings(id),
    read BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX ts_idx_notifications ON notifications USING btree (ts);
>>>>>>> c46fd0a (Adds full notification support)
