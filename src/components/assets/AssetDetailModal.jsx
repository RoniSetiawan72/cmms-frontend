import { useState, useEffect } from "react";
import { X, Loader2, Calendar, MapPin, Tag, Hash, Activity } from 'lucide-react';
import { getAssetById } from '../../services/assetService';

export default function AssetDetailModal({ isOpen, onClose, assetId }) {
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && assetId) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAssetById(assetId);
            setAsset(data);
        } catch (error) {
            setError('Gagal memuat detail aset. Silahkan coba lagi.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else {
      setAsset(null);
    }
  }, [isOpen, assetId]);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800 border-green-200';
        case 'In Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Broken': return 'bg-red-100 text-red-800 border-red-200';
        case 'Retired': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Detail Aset</h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                      <X className="w-5 h-5" />
                  </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                  {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                          <p className="text-gray-500 text-sm">Memuat informasi aset...</p>
                      </div>
                  ) : error ? (
                      <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-200 rounded-lg text-center">
                          {error}
                      </div>
                  ) : asset ? (
                      <div className="space-y-6">
                          {/* Kartu Info Utama */}
                          <div className="flex items-start justify-between">
                              <div>
                                  <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
                                  <p className="text-sm font-mono text-blue-600 mt-1 flex items-center">
                                      <Hash className="w-4 h-4 mr-1" /> {asset.asset_code}
                                  </p>
                              </div>
                              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(asset.status)}`}>
                                  {asset.status}
                              </span>
                          </div>

                          {/* Grid Detail */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                              
                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Kategori</p>
                                  <p className="text-gray-900 flex items-center font-medium">
                                      <Tag className="w-4 h-4 mr-2 text-gray-400" /> {asset.category?.name || asset.category}
                                  </p>
                              </div>
                              
                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Lokasi</p>
                                  <p className="text-gray-900 flex items-center font-medium">
                                      <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {asset.location?.name || asset.location}
                                  </p>
                              </div>

                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Tanggal Pembelian</p>
                                  <p className="text-gray-900 flex items-center font-medium">
                                      <Calendar className="w-4 h-4 mr-2 text-gray-400" /> 
                                      {asset.purchase_date || '-'}
                                  </p>
                              </div>

                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Batas Garansi</p>
                                  <p className="text-gray-900 flex items-center font-medium">
                                      <Activity className="w-4 h-4 mr-2 text-gray-400" /> 
                                      {asset.warranty_expiry || '-'}
                                  </p>
                              </div>

                          </div>
                      </div>
                  ) : null}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      Tutup
                  </button>
              </div>
          </div>
      </div>
  );
}