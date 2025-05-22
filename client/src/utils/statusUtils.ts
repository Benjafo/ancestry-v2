// This file will contain centralized status badge and text logic.

import { ProjectDetail } from '../api/client';

export const getStatusBadgeClass = (status: ProjectDetail['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'completed':
            return 'bg-blue-100 text-blue-800';
        case 'on_hold':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getStatusText = (status: ProjectDetail['status']) => {
    switch (status) {
        case 'active':
            return 'Active';
        case 'completed':
            return 'Completed';
        case 'on_hold':
            return 'On Hold';
        default:
            return status;
    }
};
