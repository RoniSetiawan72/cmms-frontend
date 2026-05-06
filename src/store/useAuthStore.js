// src/store/useAuthStore.js
import { create } from 'zustand';
import api from '../lib/axios';

const getUserFromStorage = () => {
    try {
        const userStr = localStorage.getItem('cmms_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error("Gagal membaca data user dari storage", error);
        return null;
    }
}

const useAuthStore = create((set) => ({
    user: getUserFromStorage(),
    token: localStorage.getItem('cmms_token') || null,
    isAuthenticated: !!localStorage.getItem('cmms_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/login', { email, password });
            const { user, token } = response.data.data;

            localStorage.setItem('cmms_token', token);
            localStorage.setItem('cmms_user', JSON.stringify(user));
            
            set({ user, token, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Koneksi gagal. Periksa email & password.',
                isLoading: false
            });
            return false;
        }
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('cmms_token');
            localStorage.removeItem('cmms_user');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;