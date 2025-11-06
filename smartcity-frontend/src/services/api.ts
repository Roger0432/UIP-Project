import axios from 'axios';
import { Incident, CreateIncidentData } from '../types';

const API_BASE_URL = 'http://localhost:5000'; // Cambia esto por tu URL de producción

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const incidentsAPI = {
    // Obtener todos los incidentes
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

    // Obtener un incidente por ID
    getById: async (id: number) => {
        const response = await api.get<Incident>(`/api/incidents/${id}`);
        return response.data;
    },

    // Crear nuevo incidente
    create: async (data: CreateIncidentData) => {
        const response = await api.post<Incident>('/api/incidents', data);
        return response.data;
    },

    // Actualizar incidente
    update: async (id: number, data: Partial<CreateIncidentData>) => {
        const response = await api.put<Incident>(`/api/incidents/${id}`, data);
        return response.data;
    },

    // Eliminar incidente (requiere admin)
    delete: async (id: number) => {
        const response = await api.delete(`/api/incidents/${id}`, {
            headers: { 'x-admin': 'true' },
        });
        return response.data;
    },
};

export default api;
