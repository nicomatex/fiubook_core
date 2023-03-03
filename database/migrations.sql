ALTER TABLE users ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bookings ALTER COLUMN service_id TYPE CHAR(36) REFERENCES services(id) ON DELETE CASCADE;
ALTER TYPE BOOKING_STATUS ADD VALUE IF NOT EXISTS 'PENDING_RETURN' AFTER 'CANCELLED';
ALTER TYPE BOOKING_STATUS ADD VALUE IF NOT EXISTS 'RETURNED' AFTER 'PENDING_RETURN';
ALTER TABLE services ADD COLUMN returnable BOOLEAN NOT NULL DEFAULT false;
-- tag search migration
ALTER TABLE services ALTER COLUMN search_index SET DATA TYPE tsvector USING to_tsvector('spanish', name || ' ' || description || ' ' || array_to_string(tags, ' '));
-- user profile migration
ALTER TABLE users ADD COLUMN name VARCHAR(64);
ALTER TABLE users ADD COLUMN lastname VARCHAR(64);
ALTER TABLE users ADD COLUMN email VARCHAR(320);