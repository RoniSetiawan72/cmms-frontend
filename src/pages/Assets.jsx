import { useState, useEffect } from 'react';
import { getAssets } from '../services/assetService';
import { Search, Plus, Loader2, Info } from 'lucide-react';
import AssetModal from '../components/assets/AssetModal';
import AssetDetailModal from '../components/assets/AssetDetailModal';

export default function Assets() {
    const savedUser = JSON.parse(localStorage.getItem('cmms_user') || '{}');
    const currentUserRole = savedUser?.role?.toLowerCase()?.trim() || 'teknisi';
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);

    const fetchAssets = async (query = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAssets(query);
            setAssets(data);
        } catch (err) {
            setError('Gagal memuat data aset. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAssets(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAssets(searchTerm);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 border-green-200';
            case 'In Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Broken': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Aset</h1>
                    <p className="text-sm text-gray-500">Kelola dan pantau seluruh inventaris medis</p>
                </div>
                
                <div className="flex w-full sm:w-auto items-center gap-3">
                    {/* Ubah <form> menjadi <div> biasa */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama atau kode..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Tombol Tambah Aset diletakkan di luar div pencarian */}
                    {currentUserRole !== 'nurse' && (
                        <button onClick={() => setIsModalOpen(true)} className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Aset
                        </button>
                    )}
                </div>
            </div>

            {/* Area Tabel */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100 flex items-center">
                        <Info className="h-4 w-4 mr-2" /> {error}
                    </div>
                )}

                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kode Aset</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Alat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                                            <p className="text-sm">Memuat data aset...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Info className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm font-medium text-gray-900">Tidak ada aset ditemukan</p>
                                            <p className="text-sm mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {asset.asset_code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {asset.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {asset.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {asset.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(asset.status)}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => {
                                                    setSelectedAssetId(asset.id);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 focus:outline-none"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Letakkan Modal di luar hierarki tabel */}
            <AssetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchAssets();
                }} 
            />
            {/* Modal Detail Aset */}
            <AssetDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedAssetId(null);
                }}
                assetId={selectedAssetId}
            />
        </div>
    );
}