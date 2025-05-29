-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE
    users (
        user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
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
        role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- User-Role junction table
CREATE TABLE
    user_roles (
        user_id UUID REFERENCES users (user_id),
        role_id UUID REFERENCES roles (role_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id)
    );

-- Projects table
CREATE TABLE
    projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        researcher_id UUID REFERENCES users (user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Events table
CREATE TABLE
    events (
        event_id UUID PRIMARY KEY,
        event_type VARCHAR(100), -- birth, death, immigration, etc.
        event_date DATE,
        event_location VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Documents/Media table
CREATE TABLE
    documents (
        document_id UUID PRIMARY KEY,
        title VARCHAR(255),
        document_type VARCHAR(100), -- photo, certificate, letter, etc.
        file_path VARCHAR(255),
        upload_date TIMESTAMP,
        file_size INTEGER,
        mime_type VARCHAR(100),
        description TEXT,
        source VARCHAR(255),
        date_of_original DATE,
        project_id UUID REFERENCES projects (id), -- Direct association with a project
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Person-Event junction table
CREATE TABLE
    person_events (
        person_id UUID REFERENCES persons (person_id),
        event_id UUID REFERENCES events (event_id),
        role VARCHAR(50), -- 'primary', 'witness', 'mentioned', etc.
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (person_id, event_id)
    );

-- Project-Event junction table
CREATE TABLE
    project_events (
        project_id UUID REFERENCES projects (id),
        event_id UUID REFERENCES events (event_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, event_id)
    );

-- Document-Person junction table
CREATE TABLE
    document_persons (
        document_id UUID REFERENCES documents (document_id),
        person_id UUID REFERENCES persons (person_id),
        relevance VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (document_id, person_id)
    );

-- Project-User junction table
CREATE TABLE
    project_users (
        project_id UUID REFERENCES projects (id),
        user_id UUID REFERENCES users (user_id),
        access_level VARCHAR(50) DEFAULT 'view', -- 'view', 'edit', etc.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, user_id)
    );

-- Project-Person junction table
CREATE TABLE
    project_persons (
        project_id UUID REFERENCES projects (id),
        person_id UUID REFERENCES persons (person_id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, person_id)
    );

-- Client Profiles table
CREATE TABLE
    client_profiles (
        user_id UUID PRIMARY KEY REFERENCES users (user_id),
        phone VARCHAR(50),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        email_notifications BOOLEAN DEFAULT TRUE,
        research_updates BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- User Events table (replacing notifications and activities)
CREATE TABLE
    user_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        user_id UUID REFERENCES users (user_id),
        actor_id UUID REFERENCES users (user_id),
        event_type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        entity_id UUID,
        entity_type VARCHAR(100),
        project_ids UUID[] DEFAULT '{}', -- New field for multiple project associations
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Password Reset Tokens table
CREATE TABLE
    password_reset_tokens (
        token VARCHAR(255) PRIMARY KEY,
        user_id UUID REFERENCES users (user_id),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
