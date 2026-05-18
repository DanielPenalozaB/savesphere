ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

CREATE UNIQUE INDEX idx_users_provider ON users(auth_provider, provider_id)
    WHERE provider_id IS NOT NULL;
