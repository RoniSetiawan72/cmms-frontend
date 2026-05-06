import api from '../lib/axios';

export const getWorkOrders = async (status = '') => {
    try {
        const url = status ? `/work-orders?status=${status}` : '/work-orders';
        const response = await api.get(url);
        return response.data.data;
    } catch (error) {
        console.error("Gagal mengambil data Work Order:", error);
        throw error;
    }
};

export const updateWorkOrderStatus = async (id, status, notes = '') => {
    try {
        const payload = { status };
        if (notes) payload.resolution_notes = notes;

        const response = await api.patch(`/work-orders/${id}/status`, payload);
        return response.data.data;
    } catch (error) {
        console.error("Gagal update status:", error);
        throw error.response?.data?.message || "Gagal mengubah status Work Order";
    }
};

export const createWorkOrder = async (data) => {
    try {
        const response = await api.post('/work-orders', data);
        return response.data;
    } catch (error) {
        console.error("Axios error:", error);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
        }

        throw error.response?.data?.message || "Gagal membuat Work Order.";
    }
};