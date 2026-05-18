DROP INDEX IF EXISTS idx_users_provider;
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider;
ALTER TABLE users DROP COLUMN IF EXISTS provider_id;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
