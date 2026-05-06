import api from '../lib/axios';

export const getUsers = async (search = '') => {
  try {
    const response = await api.get(`/users?search=${search}`);
    return response.data.data.data || response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    throw error;
  }
};

export const createUser = async (data) => {
  try {
    const response = await api.post('/users', data);
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
    }

    throw error.response?.data?.message || "Gagal membuat user baru.";
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal memperbarui user.";
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
  } catch (error) {
    throw error.response?.data?.message || 'Gagal menghapus user.';
  }
};