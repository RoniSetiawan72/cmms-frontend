import { useState, useEffect, useRef } from 'react';
import { getWorkOrders, updateWorkOrderStatus, createWorkOrder } from '../services/workOrderService';
import useAuthStore from '../store/useAuthStore';
import { Search, Wrench, Loader2, CheckCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { getAssets } from '../services/assetService';

export default function WorkOrders() {
    const savedUser = JSON.parse(localStorage.getItem('cmms_user') || '{}');
    const currentUserRole = savedUser?.role?.toLowerCase()?.trim() || 'teknisi';
    const { user } = useAuthStore();
    const [workOrders, setWorkOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedWO, setSelectedWO] = useState(null);

    const [formData, setFormData] = useState({
        asset_id: '',
        type: 'Corrective',
        priority: 'Sedang',
        issue_description: ''
    });

    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const toastTimerRef = useRef(null);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
    };

    const fetchWorkOrders = async () => {
        setIsLoading(true);
        try {
            const data = await getWorkOrders();
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Gagal memuat data tiket.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const data = await getAssets();
                setAssets(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Gagal memuat daftar aset:", error);
                showToast('error', 'Gagal memuat daftar aset untuk form.');
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        const fetchTableData = async () => {
            setIsLoading(true);
            try {
                const data = await getWorkOrders();
                setWorkOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Gagal memuat tabel WO:", error);
                showToast('error', 'Gagal memuat data Work Orders dari server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTableData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await createWorkOrder(formData);
            showToast('success', 'Laporan kerusakan berhasil dikirim!');
            setIsModalOpen(false);
        } catch (error) {
            showToast('error', error?.toString() || 'Gagal mengirim laporan');
        } finally {
            setIsSaving(false);
        }
    };

    const openAddModal = () => {
        setFormData({ asset_id: '', type: 'Corrective', priority: 'Sedang', issue_description: '' });
        setIsModalOpen(true);
    };

    const openDetailModal = (wo) => {
        setSelectedWO(wo);
        setIsDetailModalOpen(true);
    };

    const handleStatusChange = async (id, newStatus, requiresNote = false) => {
        let notes = '';
        if (requiresNote) {
            notes = window.prompt("Masukkan catatan perbaikan (Wajib):");
            if (!notes) return;
        }

        setActionLoading(id);
        try {
            await updateWorkOrderStatus(id, newStatus, notes);
            showToast('success', `Work Order berhasil diubah menjadi ${newStatus}!`);
            fetchWorkOrders();
        } catch (err) {
            alert(typeof err === 'string' ? err : 'Terjadi kesalahan sistem');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-100 text-red-800 border-red-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        Work Orders
                    </h1>
                    <p className="text-sm text-gray-500">Pantau tiket perbaikan dan pemeliharaan aset</p>
                </div>

                <button onClick={openAddModal} className="flex-shrink-0 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm transition-colors">
                    <Wrench className="w-4 h-4 mr-2" /> Lapor Kerusakan
                </button>
            </div>

            {/* AREA TABEL WORK ORDERS */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor WO</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aset & Detail</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelapor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teknisi</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                        <p className="text-sm text-gray-500 mt-2">Memuat data Work Orders...</p>
                                    </td>
                                </tr>
                            ) : workOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada tiket Work Order yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                workOrders.map((wo) => (
                                    <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Kolom 1: Nomor WO */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {wo.work_order_number}
                                        </td>

                                        {/* Kolom 2: Aset, Tipe, & Prioritas */}
                                        <td className="px-6 py-4 text-sm">
                                            {/* Asumsi relasi asset sudah di-load dari backend, misal: wo.asset.name */}
                                            <div className="font-bold text-gray-900">{wo.asset?.name || `ID Aset: ${wo.asset_id}`}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{wo.type}</span>
                                                <span className={`font-semibold ${wo.priority === 'Tinggi' ? 'text-red-600' :
                                                    wo.priority === 'Sedang' ? 'text-amber-600' : 'text-blue-600'
                                                    }`}>
                                                    Prioritas {wo.priority}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Kolom 3: Pelapor */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {/* Asumsi relasi user sudah di-load, misal: wo.reporter.name */}
                                            {wo.reporter?.name || wo.reported_by || '-'}
                                        </td>

                                        {/* Kolom 4: Teknisi (Assigned To) */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {wo.technician?.name ? (
                                                <span className="flex items-center">
                                                    <Wrench className="w-3 h-3 mr-1 text-gray-400" />
                                                    {wo.technician.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Belum ditugaskan</span>
                                            )}
                                        </td>

                                        {/* Kolom 5: Status */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                                wo.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                wo.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                wo.status === 'Waiting Validation' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                                {wo.status === 'Waiting Validation' ? 'Menunggu Validasi' : (wo.status || 'Open')}
                                            </span>
                                        </td>

                                        {/* Kolom 6: Aksi */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                
                                                {/* 🌟 HANYA TEKNISI/ADMIN: Tombol PROSES (Open -> In Progress) 🌟 */}
                                                {(wo.status === 'Open' || !wo.status) && currentUserRole !== 'nurse' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(wo.id, 'In Progress', false)}
                                                        disabled={actionLoading === wo.id}
                                                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center disabled:opacity-50"
                                                    >
                                                        {actionLoading === wo.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5 mr-1.5" />}
                                                        Proses
                                                    </button>
                                                )}

                                                {/* 🌟 HANYA TEKNISI/ADMIN: Tombol MINTA VALIDASI (In Progress -> Waiting Validation) 🌟 */}
                                                {wo.status === 'In Progress' && currentUserRole !== 'nurse' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(wo.id, 'Waiting Validation', true)}
                                                        disabled={actionLoading === wo.id}
                                                        className="text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center disabled:opacity-50"
                                                    >
                                                        {actionLoading === wo.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                                        Selesaikan
                                                    </button>
                                                )}

                                                {/* 🌟 HANYA PERAWAT: Tombol VALIDASI (Waiting Validation -> Closed) 🌟 */}
                                                {wo.status === 'Waiting Validation' && currentUserRole === 'nurse' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(wo.id, 'Closed', false)}
                                                        disabled={actionLoading === wo.id}
                                                        className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center disabled:opacity-50"
                                                    >
                                                        {actionLoading === wo.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                                        Validasi Selesai
                                                    </button>
                                                )}

                                                {/* Tombol DETAIL (Selalu Tampil Untuk Semua Role) */}
                                                <button 
                                                    onClick={() => openDetailModal(wo)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🌟 MODAL FORM LAPOR KERUSAKAN 🌟 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header Modal - Warna Merah agar terasa Urgent */}
                        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-red-800 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Form Laporan Kerusakan
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-red-400 hover:text-red-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">

                            {/* Input Aset */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Pilih Aset yang Bermasalah <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.asset_id}
                                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-red-500 focus:border-red-500 bg-white"
                                >
                                    <option value="" disabled>-- Cari atau Pilih Aset --</option>
                                    {assets.map(asset => (
                                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hanya aset yang terdaftar yang dapat dilaporkan.</p>
                            </div>

                            {/* Input Prioritas */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Tingkat Prioritas <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Low', 'Medium', 'High', 'Critical'].map((lvl) => (
                                        <label
                                            key={lvl}
                                            className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer text-sm font-medium transition-all ${formData.priority === lvl
                                                ? (lvl.includes('Tinggi') ? 'bg-red-50 border-red-500 text-red-700' : 'bg-blue-50 border-blue-500 text-blue-700')
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="priority"
                                                value={lvl}
                                                checked={formData.priority === lvl}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="sr-only"
                                            />
                                            {lvl}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Input Deskripsi */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Deskripsi Kerusakan / Kendala <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.issue_description}
                                    onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                                    placeholder="Contoh: Mesin tidak mau menyala saat tombol power ditekan, muncul kode error E-04 di layar..."
                                ></textarea>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm flex items-center">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {isSaving ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🌟 MODAL DETAIL WORK ORDER 🌟 */}
            {isDetailModalOpen && selectedWO && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    Detail Tiket #{selectedWO.work_order_number}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Dibuat pada: {new Date(selectedWO.created_at || Date.now()).toLocaleString('id-ID')}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Modal (Detail Informasi) */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                            {/* Baris 1: Status & Prioritas */}
                            <div className="flex gap-3">
                                <div className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Status Saat Ini</span>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedWO.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                        selectedWO.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-200 text-gray-700'
                                        }`}>
                                        {selectedWO.status || 'Open'}
                                    </span>
                                </div>
                                <div className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Tingkat Prioritas</span>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedWO.priority === 'Tinggi' ? 'bg-red-100 text-red-700' :
                                        selectedWO.priority === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedWO.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Baris 2: Grid Info */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Aset yang Dilaporkan</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedWO.asset?.name || `Aset ID: ${selectedWO.asset_id}`}</p>
                                    <p className="text-xs text-gray-500">Tipe Pekerjaan: {selectedWO.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Pelapor</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedWO.reporter?.name || selectedWO.reported_by || 'Sistem'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Teknisi Bertugas</p>
                                    {selectedWO.technician?.name ? (
                                        <p className="text-sm font-bold text-blue-600 flex items-center">
                                            <Wrench className="w-4 h-4 mr-1.5" /> {selectedWO.technician.name}
                                        </p>
                                    ) : (
                                        <p className="text-sm italic text-gray-400">Belum ada teknisi</p>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Deskripsi Kerusakan / Kendala</p>
                                <div className="bg-red-50 text-red-900 p-4 rounded-xl text-sm leading-relaxed border border-red-100">
                                    {selectedWO.issue_description || 'Tidak ada deskripsi.'}
                                </div>
                            </div>

                            {/* Catatan Resolusi (Hanya muncul jika sudah ada) */}
                            {selectedWO.resolution_notes && (
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
                                        Catatan Penyelesaian (Resolusi)
                                    </p>
                                    <div className="bg-green-50 text-green-900 p-4 rounded-xl text-sm leading-relaxed border border-green-100">
                                        {selectedWO.resolution_notes}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifikasi */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[70] flex items-center p-4 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3 text-green-500" /> : <AlertCircle className="w-5 h-5 mr-3 text-red-500" />}
                    <p className="text-sm font-medium mr-4">{toast.message}</p>
                    <button onClick={() => setToast({ show: false })}><X className="w-4 h-4" /></button>
                </div>
            )}
        </div>
    );
}