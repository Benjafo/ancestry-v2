const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Mock data for projects
const projectsData = {
    // This would be stored in the database in a real application
    projects: [
        {
            id: '1',
            title: 'Smith Family Tree',
            description: 'Research into the Smith family lineage from 1800s to present',
            status: 'active',
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-04-18T14:30:00Z'
        },
        {
            id: '2',
            title: 'Johnson Ancestry',
            description: 'Tracing the Johnson family roots in Europe',
            status: 'on_hold',
            created_at: '2024-11-20T09:15:00Z',
            updated_at: '2025-03-05T11:45:00Z'
        },
        {
            id: '3',
            title: 'Williams Family History',
            description: 'Comprehensive research of the Williams family in North America',
            status: 'completed',
            created_at: '2024-08-10T15:30:00Z',
            updated_at: '2025-02-28T16:20:00Z'
        }
    ],
    projectDetails: {
        '1': {
            id: '1',
            title: 'Smith Family Tree',
            description: 'Research into the Smith family lineage from 1800s to present. This project focuses on tracing the ancestry of John Smith, born in 1850 in Boston, Massachusetts. The research aims to identify his parents, siblings, and ancestors going back at least three generations.',
            status: 'active',
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-04-18T14:30:00Z',
            researcher: {
                name: 'Emily Johnson',
                email: 'emily.johnson@example.com'
            },
            documents: [
                {
                    id: 'd1',
                    title: 'Birth Certificate - John Smith',
                    type: 'certificate',
                    uploaded_at: '2025-01-20T11:30:00Z'
                },
                {
                    id: 'd2',
                    title: 'Marriage Record - John and Mary Smith',
                    type: 'record',
                    uploaded_at: '2025-02-05T09:45:00Z'
                },
                {
                    id: 'd3',
                    title: 'Census Record - 1880',
                    type: 'record',
                    uploaded_at: '2025-03-12T14:20:00Z'
                },
                {
                    id: 'd4',
                    title: 'Family Photo - Smith Family 1890',
                    type: 'photo',
                    uploaded_at: '2025-04-01T16:15:00Z'
                }
            ],
            timeline: [
                {
                    id: 't1',
                    date: '1850-06-12',
                    event: 'Birth of John Smith',
                    description: 'Born in Boston, Massachusetts to William and Elizabeth Smith'
                },
                {
                    id: 't2',
                    date: '1875-04-22',
                    event: 'Marriage to Mary Johnson',
                    description: 'Married in First Church of Boston'
                },
                {
                    id: 't3',
                    date: '1876-08-15',
                    event: 'Birth of First Child',
                    description: 'James Smith born in Boston'
                },
                {
                    id: 't4',
                    date: '1880-06-10',
                    event: 'Census Record',
                    description: 'Family recorded in 1880 US Census living in Boston'
                },
                {
                    id: 't5',
                    date: '1910-11-28',
                    event: 'Death of John Smith',
                    description: 'Died in Boston at age 60'
                }
            ]
        },
        '2': {
            id: '2',
            title: 'Johnson Ancestry',
            description: 'Tracing the Johnson family roots in Europe. This project focuses on identifying the European origins of the Johnson family before they immigrated to the United States in the early 1900s.',
            status: 'on_hold',
            created_at: '2024-11-20T09:15:00Z',
            updated_at: '2025-03-05T11:45:00Z',
            researcher: {
                name: 'Michael Brown',
                email: 'michael.brown@example.com'
            },
            documents: [
                {
                    id: 'd5',
                    title: 'Immigration Records - Johnson Family',
                    type: 'record',
                    uploaded_at: '2024-12-10T13:20:00Z'
                },
                {
                    id: 'd6',
                    title: 'Passport - Thomas Johnson',
                    type: 'document',
                    uploaded_at: '2025-01-15T10:30:00Z'
                }
            ],
            timeline: [
                {
                    id: 't6',
                    date: '1885-03-15',
                    event: 'Birth of Thomas Johnson',
                    description: 'Born in Liverpool, England'
                },
                {
                    id: 't7',
                    date: '1910-08-22',
                    event: 'Immigration to USA',
                    description: 'Arrived at Ellis Island, New York'
                }
            ]
        },
        '3': {
            id: '3',
            title: 'Williams Family History',
            description: 'Comprehensive research of the Williams family in North America. This project documents the Williams family history from their arrival in Virginia in the 1700s through the present day.',
            status: 'completed',
            created_at: '2024-08-10T15:30:00Z',
            updated_at: '2025-02-28T16:20:00Z',
            researcher: {
                name: 'Sarah Davis',
                email: 'sarah.davis@example.com'
            },
            documents: [
                {
                    id: 'd7',
                    title: 'Land Deed - Virginia 1745',
                    type: 'document',
                    uploaded_at: '2024-09-05T11:15:00Z'
                },
                {
                    id: 'd8',
                    title: 'Family Bible Records',
                    type: 'document',
                    uploaded_at: '2024-10-12T14:30:00Z'
                },
                {
                    id: 'd9',
                    title: 'Civil War Service Records',
                    type: 'record',
                    uploaded_at: '2024-11-20T09:45:00Z'
                }
            ],
            timeline: [
                {
                    id: 't8',
                    date: '1720-04-10',
                    event: 'Birth of James Williams',
                    description: 'Born in London, England'
                },
                {
                    id: 't9',
                    date: '1742-06-15',
                    event: 'Immigration to America',
                    description: 'Arrived in Virginia Colony'
                },
                {
                    id: 't10',
                    date: '1745-09-20',
                    event: 'Land Purchase',
                    description: 'Purchased 100 acres in Virginia'
                }
            ]
        }
    }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', verifyToken, (req, res) => {
    res.json({ projects: projectsData.projects });
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', verifyToken, (req, res) => {
    const projectId = req.params.id;
    const project = projectsData.projectDetails[projectId];
    
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', verifyToken, (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }
    
    // Generate a new ID (in a real app, this would be handled by the database)
    const newId = (projectsData.projects.length + 1).toString();
    
    const newProject = {
        id: newId,
        title,
        description,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Add to projects list
    projectsData.projects.push(newProject);
    
    // Add to project details
    projectsData.projectDetails[newId] = {
        ...newProject,
        researcher: {
            name: 'Assigned Researcher',
            email: 'researcher@example.com'
        },
        documents: [],
        timeline: []
    };
    
    res.status(201).json({
        message: 'Project created successfully',
        project: newProject
    });
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', verifyToken, (req, res) => {
    const projectId = req.params.id;
    const { title, description, status } = req.body;
    
    // Find project in both collections
    const projectIndex = projectsData.projects.findIndex(p => p.id === projectId);
    const projectDetail = projectsData.projectDetails[projectId];
    
    if (projectIndex === -1 || !projectDetail) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    // Update fields
    if (title) {
        projectsData.projects[projectIndex].title = title;
        projectDetail.title = title;
    }
    
    if (description) {
        projectsData.projects[projectIndex].description = description;
        projectDetail.description = description;
    }
    
    if (status) {
        projectsData.projects[projectIndex].status = status;
        projectDetail.status = status;
    }
    
    // Update timestamp
    const now = new Date().toISOString();
    projectsData.projects[projectIndex].updated_at = now;
    projectDetail.updated_at = now;
    
    res.json({
        message: 'Project updated successfully',
        project: projectsData.projects[projectIndex]
    });
});

module.exports = router;
