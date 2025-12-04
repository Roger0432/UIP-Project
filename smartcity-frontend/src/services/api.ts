//We do it together, eachone has put what he needs for his frontend
import axios from 'axios';
import { Incident, CreateIncidentData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.17.125:5000'; //arnau
//const API_BASE_URL = 'http://10.0.17.180:5000'; //roger

console.log('API connected to: ', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    async (config) => {
        // Get token from storage
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers['authorization'] = `Bearer ${token}`;
        } else {
            config.headers['authorization'] = 'Bearer dummy-token';
        }
        console.log(` ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {
        console.log(`${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Timeout - The server did not respond in time.');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const incidentsAPI = {
    // Health check
    healthCheck: async () => {
        const response = await api.get('/health');
        return response.data;
    },

    // Obtain all incidents
    getAll: async (filters?: {
        status?: string;
        reporter?: string;
        location?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await api.get<{ data: Incident[]; meta: any }>('/api/incidents', {
            params: filters,
        });
        return response.data;
    },

    // Obtain incident by ID
    getById: async (id: number) => {
        const response = await api.get<Incident>(`/api/incidents/${id}`);
        return response.data;
    },

    // Create report
    create: async (data: CreateIncidentData) => {
        const response = await api.post<Incident>('/api/incidents', data);
        return response.data;
    },

    // Update report
    update: async (id: number, data: Partial<CreateIncidentData>) => {
        const response = await api.put<Incident>(`/api/incidents/${id}`, data);
        return response.data;
    },

    // Delete report
    delete: async (id: number) => {
        const response = await api.delete(`/api/incidents/${id}`, {
            headers: { 'x-admin': 'true' },
        });
        return response.data;
    },
};

export const profilesAPI = {
    getProfile: async (userId: string) => {
        const response = await api.get(`/api/profile/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        role?: string;
        image?: string;
    }) => {
        const response = await api.put(`/api/profile/${userId}`, data);
        console.log('Profile updated:', response.data);
        return response.data;
    },
};


export const authAPI = {
    // Register new user
    register: async (email: string, password: string, name: string) => {
        const response = await api.post('/api/auth/register', {
            email,
            password,
            name,
        });
        return response.data;
    },

    // Login user
    login: async (email: string, password: string) => {
        const response = await api.post('/api/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    // Logout user
    logout: async () => {
        return { message: 'Logged out successfully' };
    },
};

export default api;
