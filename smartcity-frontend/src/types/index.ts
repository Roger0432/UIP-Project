export interface Incident {
    id: number;
    title: string;
    description: string;
    location: string;
    reporter: string;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: string;
    updatedAt: string;
    photos?: string[];
}

export interface CreateIncidentData {
    title: string;
    description: string;
    location: string;
    reporter: string;
    phone?: string;
    email?: string;
    status?: string;
    photos?: string[];
}

export interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}
