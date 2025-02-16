CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_assessments (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    risk_score DECIMAL(4, 3),
    weather_data JSONB,
    seismic_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    risk_assessment_id INTEGER REFERENCES risk_assessments(id),
    alert_type VARCHAR(50),
    message TEXT,
    severity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 