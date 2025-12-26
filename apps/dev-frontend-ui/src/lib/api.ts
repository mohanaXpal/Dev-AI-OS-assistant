
import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Token to Requests
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dev_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const sendCommand = async (command: string) => {
    try {
        const response = await api.post('/command', { command });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        return {
            response: { text: "Error: Could not connect to DEV AI Core." },
            execution: { success: false }
        };
    }
};
