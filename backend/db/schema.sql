-- Predictum Database Schema
-- PostgreSQL 15+

-- Markets table
CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    end_time TIMESTAMP NOT NULL,
    yes_pool DECIMAL(20,2) DEFAULT 0,
    no_pool DECIMAL(20,2) DEFAULT 0,
    total_yes_shares DECIMAL(20,2) DEFAULT 0,
    total_no_shares DECIMAL(20,2) DEFAULT 0,
    winning_outcome VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User positions table
CREATE TABLE IF NOT EXISTS user_positions (
    id SERIAL PRIMARY KEY,
    market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    yes_shares DECIMAL(20,2) DEFAULT 0,
    no_shares DECIMAL(20,2) DEFAULT 0,
    yes_amount DECIMAL(20,2) DEFAULT 0,
    no_amount DECIMAL(20,2) DEFAULT 0,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User balance table (single row for demo)
CREATE TABLE IF NOT EXISTS user_balance (
    id INT PRIMARY KEY DEFAULT 1,
    balance DECIMAL(20,2) DEFAULT 10000,
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (id = 1)
);

-- Insert default balance
INSERT INTO user_balance (id, balance) VALUES (1, 10000)
ON CONFLICT (id) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_end_time ON markets(end_time);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at);
CREATE INDEX IF NOT EXISTS idx_user_positions_market_id ON user_positions(market_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_positions_updated_at BEFORE UPDATE ON user_positions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_balance_updated_at BEFORE UPDATE ON user_balance
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

