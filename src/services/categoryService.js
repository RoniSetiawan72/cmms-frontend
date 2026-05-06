import api from '../lib/axios';

export const getCategories = async (searchQuery = '') => {
  try {
    const response = await api.get(`/categories?search=${searchQuery}`);
    return response.data.data.data || response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data kategori:", error);
    throw error;
  }
};

export const createCategory = async (data) => {
    try {
        const response = await api.post('/categories', data);
        return response.data;
    } catch (error) {
        console.error("AXIOS ERROR:", error);
        if (error.response) {
            console.error("RESPONSE DATA:", error.response.data);
            console.error("RESPONSE STATUS:", error.response.status);
        }
        
        throw error.response?.data?.message || 'Gagal membuat kategori';
    }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memperbarui kategori';
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
  } catch (error) {
    throw error.response?.data?.message || 'Gagal menghapus kategori';
  }
};