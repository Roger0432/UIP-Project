import axios from 'axios';
import { Incident, CreateIncidentData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_BASE_URL = 'http://10.0.17.125:5000'; //arnau
const API_BASE_URL = 'http://10.0.17.180:5000'; //roger

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
    async (config) => {
        // Get token from storage
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers['authorization'] = `Bearer ${token}`;
        } else {
            config.headers['authorization'] = 'Bearer dummy-token';
        }
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

export const profilesAPI = {
    // Get user profile. userId is a string or uuid
    getProfile: async (userId: string) => {
        const response = await api.get(`/api/profile/${userId}`);
        console.log('Profile:', response.data);
        return response.data;
    },

    // Update or create user profile
    updateProfile: async (userId: string, data: { name?: string; email?: string; phone?: string; role?: string }) => {
        const response = await api.put(`/api/profile/${userId}`, data);
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
