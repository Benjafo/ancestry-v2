const User = require('./user');
const Role = require('./role');
const Project = require('./project');
const ClientProfile = require('./clientProfile');
const UserEvent = require('./userEvent');
const PasswordResetToken = require('./passwordResetToken');

// Genealogical data models
const Person = require('./person');
const Relationship = require('./relationship');
const Event = require('./event');
const Document = require('./document');
const DocumentPerson = require('./documentPerson');
const ProjectPerson = require('./projectPerson');
const PersonEvent = require('./personEvent');
const ProjectEvent = require('./projectEvent');
const ProjectUser = require('./projectUser');

// Define User-Role associations
User.belongsToMany(Role, { 
    through: 'user_roles',
    foreignKey: 'user_id',
    otherKey: 'role_id'
});

Role.belongsToMany(User, { 
    through: 'user_roles',
    foreignKey: 'role_id',
    otherKey: 'user_id'
});

// Define Project associations with access levels
Project.belongsTo(User, {
    foreignKey: 'researcher_id',
    as: 'researcher'
});

Project.belongsToMany(User, {
    through: ProjectUser,
    foreignKey: 'project_id',
    otherKey: 'user_id'
});

User.belongsToMany(Project, {
    through: ProjectUser,
    foreignKey: 'user_id',
    otherKey: 'project_id'
});

// Define Project-Event associations
Project.belongsToMany(Event, {
    through: ProjectEvent,
    foreignKey: 'project_id',
    otherKey: 'event_id',
    as: 'events'
});

Event.belongsToMany(Project, {
    through: ProjectEvent,
    foreignKey: 'event_id',
    otherKey: 'project_id',
    as: 'projects'
});

// Define ClientProfile associations
User.hasOne(ClientProfile, {
    foreignKey: 'user_id'
});

ClientProfile.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define UserEvent associations
User.hasMany(UserEvent, {
    foreignKey: 'user_id'
});

UserEvent.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define UserEvent actor associations
UserEvent.belongsTo(User, {
    foreignKey: 'actor_id',
    as: 'actor'
});

// Define PasswordResetToken associations
User.hasMany(PasswordResetToken, {
    foreignKey: 'user_id'
});

PasswordResetToken.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define genealogical data associations
Person.belongsToMany(Event, {
    through: PersonEvent,
    foreignKey: 'person_id',
    otherKey: 'event_id',
    as: 'events'
});

Event.belongsToMany(Person, {
    through: PersonEvent,
    foreignKey: 'event_id',
    otherKey: 'person_id',
    as: 'persons'
});

Person.belongsToMany(Document, {
    through: DocumentPerson,
    foreignKey: 'person_id',
    otherKey: 'document_id',
    as: 'documents'
});

Document.belongsToMany(Person, {
    through: DocumentPerson,
    foreignKey: 'document_id',
    otherKey: 'person_id',
    as: 'persons'
});

// Define Project-Person associations
Project.belongsToMany(Person, {
    through: ProjectPerson,
    foreignKey: 'project_id',
    otherKey: 'person_id',
    as: 'persons'
});

Person.belongsToMany(Project, {
    through: ProjectPerson,
    foreignKey: 'person_id',
    otherKey: 'project_id',
    as: 'projects'
});

// Define relationship associations
// Note: We need to define both directions for relationships
Person.hasMany(Relationship, {
    foreignKey: 'person1_id',
    as: 'relationshipsAsSubject'
});

Person.hasMany(Relationship, {
    foreignKey: 'person2_id',
    as: 'relationshipsAsObject'
});

Relationship.belongsTo(Person, {
    foreignKey: 'person1_id',
    as: 'person1'
});

Relationship.belongsTo(Person, {
    foreignKey: 'person2_id',
    as: 'person2'
});

module.exports = {
    User,
    Role,
    Project,
    ClientProfile,
    UserEvent,
    PasswordResetToken,
    // Genealogical data models
    Person,
    Relationship,
    Event,
    Document,
    DocumentPerson,
    ProjectPerson,
    PersonEvent,
    ProjectEvent,
    ProjectUser
};
