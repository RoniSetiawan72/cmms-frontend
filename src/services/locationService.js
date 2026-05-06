import api from '../lib/axios';

export const getLocations = async (search = '') => {
  try {
    const response = await api.get(`/locations?search=${search}`);
    return response.data.data.data || response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data lokasi:", error);
    throw error;
  }
};

export const createLocation = async (data) => {
  try {
    const response = await api.post('/locations', data);
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
    }

    throw error.response?.data?.message || "Gagal membuat lokasi";
  }
};

export const updateLocation = async (id, data) => {
  try {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal memperbarui kategori;'
  }
};

export const deleteLocation = async (id) => {
  try {
    const response = await api.delete(`/locations/${id}`);
  } catch (error) {
    throw error.response?.data?.message || 'Gagal menghapus lokasi';
  }
};