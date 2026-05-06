import { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit, Trash2, Tags, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoadiing] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        prefix_code: '',
        requires_calibration: false
    });
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const toastTimeRef = useRef(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

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
                const data = await getCategories(searchTerm);
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Gagal mengambil data kategori", error);
            } finally {
                setIsLoadiing(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingData(null);
        setFormData({ name: '', prefix_code: '', requires_calibration: false });
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingData(category);
        setFormData({
            name: category.name,
            prefix_code: category.prefix_code,
            requires_calibration: category.requires_calibration === 1 || category.requires_calibration === true
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingData) {
                await updateCategory(editingData.id, formData);
                showToast('success', 'Kategori berhasil diperbarui!');
            } else {
                await createCategory(formData);
                showToast('success', 'Kategori berhasil ditambahkan');
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

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await deleteCategory(categoryToDelete.id);
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            showToast('success', 'Kategori berhasil dihapus!');
        } catch (error) {
            showToast('error', 'Gagal menghapus. Pastikan kategori ini tidak sedang dipakai oleh aset.');
        } finally {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Tags className="w-6 h-6 mr-2 text-blue-600" />
                        Master Kategori
                    </h1>
                    <p className="text-sm text-gray-500">Kelola kategori alat medis dan kode prefix-nya</p>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari kategori..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={openAddModal} className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prefix Code</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Kategori</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Butuh Kalibrasi?</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-600">{cat.prefix_code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cat.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {cat.requires_calibration ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Ya, Wajib</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(cat)} className="text-amber-600 hover:text-amber-900 mx-3">
                                                <Edit className="w-4 h-4 inline" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(cat)} className="text-red-600 hover:text-red-900">
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

            {/* Modal Form Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{editingData ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Contoh: Peralatan Lab"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required maxLength="10"
                                    value={formData.prefix_code}
                                    onChange={(e) => setFormData({ ...formData, prefix_code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:ring-blue-500 focus:border-blue-500 font-mono"
                                    placeholder="Contoh: LAB"
                                />
                                <p className="text-xs text-gray-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Untuk generate kode unik aset (Maks 10 huruf).</p>
                            </div>

                            <div className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    id="calibration"
                                    checked={formData.requires_calibration}
                                    onChange={(e) => setFormData({ ...formData, requires_calibration: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="calibration" className="ml-2 block text-sm text-gray-900 font-medium">
                                    Alat di kategori ini butuh Kalibrasi Rutin
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {isSaving ? 'Menyimpan...' : 'Simpan Kategori'}
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
                            {/* Ikon Peringatan */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Kategori?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-gray-900">"{categoryToDelete?.name}"</span>? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            {/* Tombol Aksi */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setCategoryToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}