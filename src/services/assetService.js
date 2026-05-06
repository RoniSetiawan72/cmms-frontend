import api from '../lib/axios';

export const getAssets = async (searchQuery = '') => {
    try {
        const url = searchQuery
            ? `/assets?search=${encodeURIComponent(searchQuery)}`
            : '/assets';

            const response = await api.get(url);

            return response.data.data;
    } catch (error) {
        console.error("Gagal mengambil data aset:", error);
        throw error;
    }
};

export const createAsset = async (assetData) => {
  try {
      const response = await api.post('/assets', assetData);
      return response.data;
  } catch (error) {
      console.error("Gagal membuat aset baru:", error);
      throw error.response?.daata?.message || 'Gagal menyimpan data aset.';
  }
};

export const getCategoryOptions = async () => {
    try {
        const response = await api.get('/options/categories');
        const data = response.data.data || response.data;

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Gagal mengambil opsi kategori:", error);
        return [];
    }
};

export const getLocationOptions = async () => {
    try {
        const response = await api.get('/options/locations');
        const data = response.data.data || response.data;

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Gagal mengambil opsi lokasi:", error);
        return [];
    }
};

export const getAssetById = async (id) => {
    try {
        const response = await api.get(`/assets/${id}`);
        return response.data.data || response.data;
    } catch (error) {
        console.error("Gagal mengambil detail aset:", error);
        throw error;
    }
}

