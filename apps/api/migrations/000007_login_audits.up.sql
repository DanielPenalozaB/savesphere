CREATE TABLE login_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent VARCHAR(500),
    auth_provider VARCHAR(20),
    success BOOLEAN NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_audits_user_id ON login_audits(user_id);
CREATE INDEX idx_login_audits_created_at ON login_audits(created_at);
