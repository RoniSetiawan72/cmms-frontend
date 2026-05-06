// src/components/assets/AssetModal.jsx
import { useEffect, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { createAsset, getCategoryOptions, getLocationOptions } from '../../services/assetService';

export default function AssetModal({ isOpen, onClose, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);

    // State untuk form input
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        location_id: '',
        status: 'Active',
        purchase_date: '',
        warranty_expiry: '',
    });

    // fetch data kategori dan lokasi ketika modal dibuka
    useEffect(() => {
        if (isOpen) {
            const fetchOptions = async () => {
                setIsOptionsLoading(true);
                const [catData, locData] = await Promise.all([
                    getCategoryOptions(),
                    getLocationOptions()
                ]);

                console.log(catData);
                console.log(locData);

                setCategories(Array.isArray(catData) ? catData : (catData?.data || []));
                setLocations(Array.isArray(locData) ? locData : (locData?.data || []));

                setCategories(catData);
                setLocations(locData);
                setIsOptionsLoading(false);
            };
            fetchOptions();
        } else {
            setFormData({ name: '', category_id: '', location_id: '', status: 'Active', purchase_date: '', warranty_expiry: '' });
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createAsset(formData);
            onSuccess(); 
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Tambah Aset Baru</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form id="asset-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Alat / Aset *</label>
                            <input type="text" required name="name" value={formData.name} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cth: Mesin USG 4D"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select required name="category_id" value={formData.category_id} onChange={handleChange}
                                    disabled={isOptionsLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                                    <option value="" disabled>
                                        {isOptionsLoading ? "Memuat Kategori..." : "-- Pilih Kategori --"}
                                    </option>
                                    {Array.isArray(categories) && categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                                <select required name="location_id" value={formData.location_id} onChange={handleChange}
                                    disabled={isOptionsLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                                    <option value="" disabled>
                                        {isOptionsLoading ? "Memuat Lokasi..." : "-- Pilih Lokasi --"}
                                    </option>
                                    {Array.isArray(locations) && locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                                    <option value="Active">Active</option>
                                    <option value="In Maintenance">In Maintenance</option>
                                    <option value="Broken">Broken</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembelian *</label>
                                <input type="date" required name="purchase_date" value={formData.purchase_date} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Garansi</label>
                                <input type="date" name="warranty_expiry" value={formData.warranty_expiry} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Batal
                    </button>
                    <button type="submit" form="asset-form" disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan Aset
                    </button>
                </div>

            </div>
        </div>
    );
}