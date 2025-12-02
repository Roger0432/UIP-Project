import axios from 'axios';
import { Incident, CreateIncidentData } from '../types';

const API_BASE_URL = 'http://10.0.17.125:5000';
//const API_BASE_URL = 'http://10.0.17.180:5000';

console.log('🌐 API conectando a:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// 📤 Interceptor para requests
api.interceptors.request.use(
    (config) => {
        // Tu backend requiere autorización
        config.headers['authorization'] = 'Bearer dummy-token';
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// 📥 Interceptor para responses
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('⏱️ Timeout - El servidor tardó demasiado');
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.error('🌐 Network Error - No se puede conectar al backend');
            console.error('   URL:', API_BASE_URL);
            console.error('   ¿Backend corriendo? ¿Mismo WiFi?');
        } else if (error.response) {
            console.error(`❌ ${error.response.status}:`, error.response.data?.error || error.message);
        } else {
            console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const incidentsAPI = {
    // 🏥 Health check
    healthCheck: async () => {
        const response = await api.get('/health');
        return response.data;
    },

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
