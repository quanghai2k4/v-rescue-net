CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE rescue_requests (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location ON rescue_requests USING GIST(location);
CREATE INDEX idx_status ON rescue_requests(status);
CREATE INDEX idx_created_at ON rescue_requests(created_at DESC);

CREATE TABLE rescue_teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    current_location GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
