# Product Requirements Document (PRD)

## 1. Executive Summary
This service distinguishes itself from self-service platforms like Ancestry.com by delivering expert-led research tailored to individual clients. The service is designed to cater to clients seeking personalized, in-depth genealogical insights without the need for self-conducted geneological research or technical interaction.

## 2. Product Vision
### Problem Statement
Many individuals interested in tracing their ancestry struggle with the complexities of genealogical research and the technical aspects of self-service platforms. There is a need for a service that provides professional expertise to conduct thorough and accurate genealogical research, ensuring clients receive reliable and comprehensive family histories without the burden of managing the research process themselves.

### Unique Solution
Our service leverages the skills of a professional genealogist to perform detailed ancestry research on behalf of clients. Unlike platforms like Ancestry.com, which offer tools for users to conduct their own research, our service provides a hands-off experience where all aspects of the research process is expertly managed. This ensures higher accuracy, personalized family trees, and a user-friendly experience tailored to individuals who are interested in their family geneology.

## 3. Target Users
### User Personas

#### Persona 1: Retired Professional
- **Demographics**: Ages 60-75, retired, limited technical skills.
- **Motivations**: Interested in documenting family history for future generations.
- **Pain Points**: Finds self-service genealogy platforms overwhelming and difficult to navigate.
- **Needs**: Simple, reliable service that provides comprehensive research without requiring technical interaction.

#### Persona 2: Genealogy Enthusiast
- **Demographics**: Ages 45-65, semi-retired or have flexible working hours, moderate technical skills.
- **Motivations**: Passionate about tracing lineage and discovering family stories.
- **Pain Points**: Time-consuming research process and lack of expertise in navigating complex historical records.
- **Needs**: Professional assistance to uncover detailed family histories and present findings in an accessible format.

#### Persona 3: Family Historian
- **Demographics**: Ages 30-60, interested in preserving family legacy, varying technical proficiency.
- **Motivations**: Creating a comprehensive family record for descendants.
- **Pain Points**: Difficulty in accessing and interpreting archival records, ensuring accuracy.
- **Needs**: Expert-led research that guarantees accurate and well-documented family histories.

## 4. Key Features and Functionality

### Core Service Offerings
- **Professional Genealogical Research**: In-depth research conducted by experienced genealogists to uncover client ancestry.
- **Personalized Family Tree**: Detailed family tree outlining family histories, as well as documents related to the family tree.
- **Consultation Sessions**: Scheduled consultations between clients and researchers to discuss findings and answer questions.

### Website/App Requirements
- **User-Friendly Interface**: Intuitive design that caters to users with limited technical skills, ensuring ease of navigation.
- **Secure Client Portals**: Protected areas where clients can access their research reports, upload documents, and manage their account information.
- **Capability to Record Completed Research**: Store and organize completed research projects for future reference and client access.

### Client Dashboard
- **Payment Processing**: Integrated payment gateway for clients to make secure payments for services.
- **Research Access**: Clients can view and download their family tree, attached documents, and media.
- **Data Management**: The the business owner can edit and manage client data through manager functionality, allowing for updates and customizations as needed.

## 5. User Journeys

### Client registers and purchases a service
1. Client creates an account through a registration process
2. Client selects the service that they are looking for based on their needs
3. Client submits payment information through the portal
4. Client receives confirmation email that the service was successfully purchased
5. Client is brought to their dashboard
6. Client submits existing family information and documents

### Client navigates to their family tree
1. Client logs into their account
2. Client selects "Tree" option from their dashboard menu
3. Client views their family tree in an interactive format
4. Client selects an individual family member
5. Client views a modal with detailed information about the family member, as well as relevant documents and media

### Client updates their profile information
1. Client logs into their account
2. Client selects "Account" from the dashboard
3. Client views their current profile information
4. Client makes necessary changes to personal details, contact information, or preferences
5. Client saves the updated information
6. Client sees a message of confirmation that profile has been successfully updated

### Manager creates a new entry in a family tree
1. Manager logs into the admin/manager portal
2. Manager selects the specific client's project
3. Manager navigates to the client's family tree
4. Manager selects "Add New Entry" option
5. Manager enters biographical information, relationships, and attaches supporting documents and media
6. Manager verifies information accuracy
7. Manager saves the new entry to the family tree
8. System updates the client's family tree with the new information

### Manager adds a document or media to tree entry
1. Manager logs into the admin/manager portal
2. Manager selects the specific client's project
3. Manager navigates to the client's family tree
4. Manager locates and selects the relevant family member entry
5. Manager chooses "Add Document/Media" option
6. Manager uploads the file (image, document, audio, etc.)
7. Manager adds metadata including description, date, source information
8. Manager links the document to additional family members, if appropriate
9. Manager saves the changes

## 6. Technical Requirements

### Systems for Researchers

- **Database Management**
  - **Database**: **PostgreSQL**
    A robust, open-source relational database known for its reliability, scalability, and strong support for complex queries, making it ideal for managing extensive genealogical data.
  - **ORM (Object-Relational Mapping)**: **Sequelize** (for Node.js)
    These ORMs facilitate seamless interaction with the PostgreSQL database, allowing for efficient data manipulation and management.

- **Collaborative Tools**
  - **Version Control**: **Git with GitHub**
    Enables developer to collaborate on documentation and scripts, track changes, and manage versions effectively.

- **Secure Access to Client Information**
  - **Authentication**: **JWT**
    Ensures secure user authentication and authorization, allowing researchers to access client data responsibly.

### Client Communication

- **Notification Systems**
  - **Email Notifications**: **SendGrid** or **Mailgun**
    Automates the sending of emails for payment confirmations, research milestones, and report deliveries, ensuring clients are consistently informed.

### Additional Technical Components

- **Frontend Framework**
  - **React.js**
    Utilizes React.js to build a responsive and intuitive user interface, ensuring the application is easy to navigate for individuals with limited technical skills.
  
- **Backend Framework**
  - **Node.js with Express.js**
    Employs Node.js paired with Express.js to create a scalable and efficient server-side infrastructure capable of handling research operations, client interactions, and data processing.
  
- **Database**
  - **PostgreSQL**
    Implements PostgreSQL as a robust, open-source relational database known for its reliability, scalability, and strong support for complex queries, making it ideal for managing extensive genealogical data.
  
- **Payment Processing**
  - **Stripe**
    Integrates Stripe for secure and user-friendly payment processing within the client portal, facilitating smooth and reliable transactions.
    
- **Containerization**
  - **Docker**
    Utilizes Docker to containerize the application, ensuring consistent environments across development, testing, and production, simplifying deployment and scalability.

### Data Model
- The system will utilize a relational database model to store and manage genealogical data. This approach provides a balance of flexibility, queryability, and compatibility with standard development practices.

- **Core Data Entities:**
  - **Persons**
    - Stores individual biographical information
    - Unique identifiers for each person
    - Personal details (names, dates, locations)
    - Biographical metadata

  - **Relationships**
    - Defines connections between individuals
    - Supports multiple relationship types (parent-child, spousal)
    - Includes relationship qualifiers (biological, adoptive)
    - Records relationship timeframes (marriage dates, etc.)

  - **Events**
    - Documents significant life events
    - Links events to specific individuals
    - Captures event details (dates, locations, descriptions)

  - **Documents/Media**
    - Manages supporting documentation and media files
    - Associates documents with relevant individuals
    - Tracks document metadata and file information

## Specific Recommendations
- **Simplified Navigation**: Ensure the platform has a straightforward navigation structure to accommodate users with limited tech skills.
- **Clear Visual Design**: Utilize a clean and minimalist design to make the interface less intimidating and more accessible.
- **Secure Payment Integration**: Implement a reliable and easy-to-use payment system within the client portal to facilitate smooth transactions.
- **Manager Functionality**: Develop robust manager tools that allow the business owner to efficiently manage client data, edit profiles, and oversee research projects without technical difficulties.
