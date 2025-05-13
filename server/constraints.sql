-- Constraints for database tables

-- Add check constraints to persons table
ALTER TABLE persons
ADD CONSTRAINT check_birth_before_death
CHECK (birth_date IS NULL OR death_date IS NULL OR birth_date < death_date);

ALTER TABLE persons
ADD CONSTRAINT check_birth_not_future
CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE);

ALTER TABLE persons
ADD CONSTRAINT check_death_not_future
CHECK (death_date IS NULL OR death_date <= CURRENT_DATE);

ALTER TABLE persons
ADD CONSTRAINT check_gender_values
CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'unknown'));

-- Add check constraints to relationships table
ALTER TABLE relationships
ADD CONSTRAINT check_start_before_end
CHECK (start_date IS NULL OR end_date IS NULL OR start_date < end_date);

ALTER TABLE relationships
ADD CONSTRAINT check_relationship_type
CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild', 'aunt/uncle', 'niece/nephew', 'cousin'));

ALTER TABLE relationships
ADD CONSTRAINT check_relationship_qualifier
CHECK (relationship_qualifier IS NULL OR relationship_qualifier IN ('biological', 'adoptive', 'step', 'foster', 'in-law'));

ALTER TABLE relationships
ADD CONSTRAINT check_different_persons
CHECK (person1_id != person2_id);

-- Add check constraints to events table
ALTER TABLE events
ADD CONSTRAINT check_event_date_not_future
CHECK (event_date IS NULL OR event_date <= CURRENT_DATE);

ALTER TABLE events
ADD CONSTRAINT check_event_type
CHECK (event_type IN ('birth', 'death', 'marriage', 'divorce', 'immigration', 'emigration', 'naturalization', 'graduation', 'military_service', 'retirement', 'religious', 'medical', 'residence', 'census', 'other'));

-- Add check constraints to documents table
ALTER TABLE documents
ADD CONSTRAINT check_document_type
CHECK (document_type IN ('photo', 'certificate', 'letter', 'record', 'newspaper', 'census', 'military', 'legal', 'map', 'audio', 'video', 'other'));

-- Add check constraints to project_users table
ALTER TABLE project_users
ADD CONSTRAINT check_access_level
CHECK (access_level IN ('view', 'edit'));

-- Add check constraints to projects table
ALTER TABLE projects
ADD CONSTRAINT check_project_status
CHECK (status IN ('active', 'completed', 'on_hold'));

-- Add check constraints to user_events table
ALTER TABLE user_events
ADD CONSTRAINT check_user_event_type
CHECK (event_type IN ('project_created', 'project_assigned', 'project_updated', 
                      'document_added', 'document_uploaded', 
                      'person_created', 'person_discovered',
                      'event_recorded', 'relationship_created', 'relationship_established',
                      'research_milestone', 'project_update'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_persons_names ON persons(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_persons_birth ON persons(birth_date);
CREATE INDEX IF NOT EXISTS idx_persons_death ON persons(death_date);

CREATE INDEX IF NOT EXISTS idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);

-- Removed invalid index: idx_events_person ON events(person_id)
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_document_persons_document ON document_persons(document_id);
CREATE INDEX IF NOT EXISTS idx_document_persons_person ON document_persons(person_id);

-- Add indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_person_events_person ON person_events(person_id);
CREATE INDEX IF NOT EXISTS idx_person_events_event ON person_events(event_id);
CREATE INDEX IF NOT EXISTS idx_project_events_project ON project_events(project_id);
CREATE INDEX IF NOT EXISTS idx_project_events_event ON project_events(event_id);
CREATE INDEX IF NOT EXISTS idx_project_persons_project ON project_persons(project_id);
CREATE INDEX IF NOT EXISTS idx_project_persons_person ON project_persons(person_id);

-- Add indexes for user_events table
CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_actor ON user_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_entity ON user_events(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created ON user_events(created_at);

-- Add triggers for data consistency
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at columns
DO $$
DECLARE
    tables TEXT[] := ARRAY['users', 'roles', 'user_roles', 'projects', 'project_users', 
                          'persons', 'events', 'documents', 'relationships',
                          'person_events', 'project_events', 'document_persons', 'project_persons',
                          'client_profiles', 'user_events', 'password_reset_tokens'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_timestamp
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Modified trigger for birth/death consistency to use person_events junction table
CREATE OR REPLACE FUNCTION check_birth_death_consistency()
RETURNS TRIGGER AS $$
DECLARE
    person_id_val UUID;
BEGIN
    -- Get the person_id from the person_events table
    SELECT person_id INTO person_id_val
    FROM person_events
    WHERE event_id = NEW.event_id AND role = 'primary';
    
    -- If we found a primary person for this event
    IF person_id_val IS NOT NULL THEN
        -- If this is a birth event, update the person's birth_date
        IF NEW.event_type = 'birth' THEN
            UPDATE persons
            SET birth_date = NEW.event_date
            WHERE person_id = person_id_val
            AND (birth_date IS NULL OR birth_date != NEW.event_date);
        END IF;
        
        -- If this is a death event, update the person's death_date
        IF NEW.event_type = 'death' THEN
            UPDATE persons
            SET death_date = NEW.event_date
            WHERE person_id = person_id_val
            AND (death_date IS NULL OR death_date != NEW.event_date);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_birth_death_consistency
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
WHEN (NEW.event_type IN ('birth', 'death'))
EXECUTE FUNCTION check_birth_death_consistency();
