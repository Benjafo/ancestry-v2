const User = require('./user');
const Role = require('./role');
const Project = require('./project');
const ProjectDocument = require('./projectDocument');
const ProjectTimeline = require('./projectTimeline');
const ClientProfile = require('./clientProfile');
const Notification = require('./notification');
const Activity = require('./activity');
const PasswordResetToken = require('./passwordResetToken');

// Genealogical data models
const Person = require('./person');
const Relationship = require('./relationship');
const Event = require('./event');
const Document = require('./document');
const DocumentPerson = require('./documentPerson');

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
    through: 'project_users',
    foreignKey: 'project_id',
    otherKey: 'user_id'
});

User.belongsToMany(Project, {
    through: 'project_users',
    foreignKey: 'user_id',
    otherKey: 'project_id'
});

Project.hasMany(ProjectDocument, {
    foreignKey: 'project_id',
    as: 'documents'
});

Project.hasMany(ProjectTimeline, {
    foreignKey: 'project_id',
    as: 'timeline'
});

// Define ClientProfile associations
User.hasOne(ClientProfile, {
    foreignKey: 'user_id'
});

ClientProfile.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define Notification associations
User.hasMany(Notification, {
    foreignKey: 'user_id'
});

Notification.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define Activity associations
User.hasMany(Activity, {
    foreignKey: 'user_id'
});

Activity.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define PasswordResetToken associations
User.hasMany(PasswordResetToken, {
    foreignKey: 'user_id'
});

PasswordResetToken.belongsTo(User, {
    foreignKey: 'user_id'
});

// Define genealogical data associations
Person.hasMany(Event, {
    foreignKey: 'person_id',
    as: 'events'
});

Event.belongsTo(Person, {
    foreignKey: 'person_id'
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
    ProjectDocument,
    ProjectTimeline,
    ClientProfile,
    Notification,
    Activity,
    PasswordResetToken,
    // Genealogical data models
    Person,
    Relationship,
    Event,
    Document,
    DocumentPerson
};
