import { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit, Trash2, Tags, Loader2, AlertCircle, CheckCircle, X, MapPin, GitMerge } from 'lucide-react';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../services/locationService';

export default function Locations() {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoadiing] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        parent_id: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const toastTimeRef = useRef(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        if (toastTimeRef.current) clearTimeout(toastTimeRef.current);

        toastTimeRef.current = setTimeout(() => {
            setToast({ show: false, type: '', message: '' });
        }, 3000);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setIsLoadiing(true);
            try {
                const data = await getLocations(searchTerm);
                setLocations(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Gagal mengambil data lokasi", error);
            } finally {
                setIsLoadiing(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingData(null);
        setFormData({ name: '', type: '', parent_id: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (location) => {
        setEditingData(location);
        setFormData({
            name: location.name,
            type: location.type,
            parent_id: location.parent_id || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            ...formData,
            paremt_id: formData.parent_id === '' ? null : formData.parent_id
        };

        try {
            if (editingData) {
                await updateLocation(editingData.id, payload);
                showToast('success', 'Lokasi berhasil diperbarui!');
            } else {
                await createLocation(payload);
                showToast('success', 'Lokasi berhasil ditambahkan');
            }
            setIsModalOpen(false);
            setSearchTerm(prev => prev + ' ');
            setTimeout(() => setSearchTerm(prev => prev.trim()), 50);
        } catch (error) {
            showToast('error', error || 'Terjadi kesalahan saat menyimpan data.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (location) => {
        setLocationToDelete(location);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!locationToDelete) return;

        try {
            await deleteLocation(locationToDelete.id);
            setLocations(locations.filter(c => c.id !== locationToDelete.id));
            showToast('success', 'Lokasi berhasil dihapus!');
        } catch (error) {
            showToast('error', 'Gagal menghapus. Pastikan lokasi ini tidak sedang dipakai oleh aset.');
        } finally {
            setIsDeleteModalOpen(false);
            setLocationToDelete(null);
        }
    };

    const renderHierarchyBadge = (parent) => {
        if (!parent) {
            return <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100">Area Utama</span>;
        }
        return (
            <span className="flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 w-fit">
                <GitMerge className="w-3 h-3 mr-1 text-gray-400 rotate-90" />
                {parent.name}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col space-y-4 relative">
            {/* Header & Pencarian */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                        Master Lokasi
                    </h1>
                    <p className="text-sm text-gray-500">Kelola hierarki area, gedung, dan ruangan</p>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text" placeholder="Cari nama lokasi..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={openAddModal} className="flex-shrink-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors">
                        <Plus className="h-4 w-4 mr-2" /> Tambah
                    </button>
                </div>
            </div>

            {/* Tabel Data */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Induk Lokasi (Parent)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe Lokasi</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : locations.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Tidak ada data lokasi ditemukan.</td></tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{loc.name}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {renderHierarchyBadge(loc.parent)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {loc.type ? (
                                                <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">
                                                    {loc.type}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(loc)} className="text-amber-600 hover:text-amber-900 mx-3 focus:outline-none">
                                                <Edit className="w-4 h-4 inline" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(loc)} className="text-red-600 hover:text-red-900 focus:outline-none">
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🌟 MODAL FORM TAMBAH/EDIT 🌟 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{editingData ? 'Edit Lokasi' : 'Tambah Lokasi'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lokasi <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Contoh: Gedung A, Ruang IGD..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Induk Lokasi (Opsional)</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- Jadikan Area Utama (Tanpa Induk) --</option>
                                    {locations
                                        .filter(loc => loc.id !== editingData?.id)
                                        .map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))
                                    }
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Pilih jika ini adalah sub-lokasi (Misal: IGD berada di dalam Lantai 1).</p>
                            </div>

                            {/* GANTIKAN BLOK DESKRIPSI DENGAN INI */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Lokasi <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- Pilih Tipe --</option>
                                    <option value="Gedung">Gedung / Bangunan</option>
                                    <option value="Lantai">Lantai</option>
                                    <option value="Ruangan">Ruangan</option>
                                    <option value="Area Luar">Area Luar</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🌟 MODAL KONFIRMASI HAPUS 🌟 */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Hapus Lokasi?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Yakin ingin menghapus <span className="font-bold text-gray-900">"{locationToDelete?.name}"</span>?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Batal
                                </button>
                                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 TOAST NOTIFICATION 🌟 */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[70] flex items-center p-4 rounded-xl shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-top-5 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium mr-4">{toast.message}</p>
                    <button onClick={() => setToast({ show: false, type: '', message: '' })} className={`flex-shrink-0 ml-auto p-1 rounded-md transition-colors ${toast.type === 'success' ? 'hover:bg-green-100 text-green-600' : 'hover:bg-red-100 text-red-600'
                        }`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}