-- People table
CREATE TABLE
    persons (
        person_id UUID PRIMARY KEY,
        first_name VARCHAR(100),
        middle_name VARCHAR(100),
        last_name VARCHAR(100),
        maiden_name VARCHAR(100),
        gender VARCHAR(20),
        birth_date DATE,
        birth_location VARCHAR(255),
        death_date DATE,
        death_location VARCHAR(255),
        notes TEXT
    );

-- Relationships table
CREATE TABLE
    relationships (
        relationship_id UUID PRIMARY KEY,
        person1_id UUID REFERENCES persons (person_id),
        person2_id UUID REFERENCES persons (person_id),
        relationship_type VARCHAR(50), -- parent, spouse, child, etc.
        relationship_qualifier VARCHAR(50), -- biological, adoptive, etc.
        start_date DATE, -- marriage date for spouses
        end_date DATE, -- divorce date for spouses
        notes TEXT
    );

-- Events table
CREATE TABLE
    events (
        event_id UUID PRIMARY KEY,
        person_id UUID REFERENCES persons (person_id),
        event_type VARCHAR(100), -- birth, death, immigration, etc.
        event_date DATE,
        event_location VARCHAR(255),
        description TEXT
    );

-- Documents/Media table
CREATE TABLE
    documents (
        document_id UUID PRIMARY KEY,
        title VARCHAR(255),
        document_type VARCHAR(100), -- photo, certificate, letter, etc.
        file_path VARCHAR(255),
        upload_date TIMESTAMP
    );

-- Document-Person junction table
CREATE TABLE
    document_persons (
        document_id UUID REFERENCES documents (document_id),
        person_id UUID REFERENCES persons (person_id),
        PRIMARY KEY (document_id, person_id)
    );

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE
    users (
        user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
    );

-- Roles table
CREATE TABLE
    roles (
        role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
    );

-- User-Role junction table
CREATE TABLE
    user_roles (
        user_id UUID REFERENCES users(user_id),
        role_id UUID REFERENCES roles(role_id),
        PRIMARY KEY (user_id, role_id)
    );

-- Insert default roles
-- INSERT INTO roles (name, description) VALUES 
--     ('client', 'Regular user who purchases genealogy research services'),
--     ('manager', 'Administrator who manages client data and research');
