import { useState, useEffect } from 'react';
import {
  Package,
  Wrench,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  PlusCircle,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const savedUser = JSON.parse(localStorage.getItem('cmms_user') || '{}');
  const currentUserRole = savedUser?.role?.toLowerCase()?.trim() || 'teknisi';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatHariTanggal = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleString('id-ID', options).replace(/\./g, ':');
  };

  const stats = [
    { title: 'Total Aset', value: '1,284', icon: Package, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600', trend: '+12 bulan ini' },
    { title: 'Work Order Aktif', value: '24', icon: Wrench, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600', trend: '5 butuh tindakan' },
    { title: 'Jadwal Kalibrasi', value: '8', icon: AlertTriangle, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-600', trend: 'Dalam 30 hari ke depan' },
    { title: 'Total Pengguna', value: '36', icon: Users, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600', trend: 'Admin, Perawat, Teknisi' },
  ];

  const recentWorkOrders = [
    { id: 'WO-202605-001', asset: 'Mesin X-Ray IGD', status: 'In Progress', time: '2 jam yang lalu', priority: 'Tinggi' },
    { id: 'WO-202605-002', asset: 'AC Ruang Operasi 2', status: 'Pending', time: '5 jam yang lalu', priority: 'Sedang' },
    { id: 'WO-202605-003', asset: 'Ventilator V-01', status: 'Completed', time: '1 hari yang lalu', priority: 'Tinggi' },
    { id: 'WO-202605-004', asset: 'Bed Pasien VIP A', status: 'Pending', time: '1 hari yang lalu', priority: 'Rendah' },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">

      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl shadow-md text-white gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Activity className="w-6 h-6 mr-3" />
            Overview Sistem CMMS
          </h1>
          <p className="text-blue-100 mt-1">Pantau performa aset dan jadwal pemeliharaan faskes Anda.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-blue-100 font-medium">Hari ini</p>
          <p className="text-lg font-bold">{formatHariTanggal(currentTime)}</p>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.textColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-gray-500">
                <span>{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Bawah: Tabel Aktivitas & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

        {/* Kolom Kiri: Tabel Work Order Terbaru (Porsi lebih besar) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              Work Order Terbaru
            </h2>
            <Link to="/work-orders" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID Tiket</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Aset</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prioritas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentWorkOrders.map((wo, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{wo.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {wo.asset}
                      <div className="text-xs text-gray-400 mt-0.5">{wo.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${wo.priority === 'Tinggi' ? 'bg-red-50 text-red-600 border border-red-100' :
                          wo.priority === 'Sedang' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`flex items-center text-xs font-medium ${wo.status === 'Completed' ? 'text-green-600' :
                          wo.status === 'In Progress' ? 'text-blue-600' : 'text-amber-500'
                        }`}>
                        {wo.status === 'Completed' ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                        {wo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Aksi Cepat & Info Tambahan */}
        <div className="flex flex-col gap-6">
          {/* Panel Aksi Cepat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-3">
              <Link to="/work-orders" className="w-full flex items-center p-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                <Wrench className="w-5 h-5 mr-3 text-blue-500" />
                Buat Work Order Baru
              </Link>
              {currentUserRole !== 'nurse' && (
                  <Link to="/assets" className="w-full flex items-center p-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors">
                      <PlusCircle className="w-5 h-5 mr-3 text-emerald-500" />
                      Registrasi Aset Baru
                  </Link>
              )}
              {currentUserRole === 'admin' && (
                <Link to="/users" className="w-full flex items-center p-3 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors">
                    <Users className="w-5 h-5 mr-3 text-purple-500" />
                    Tambah Akun Staff
                </Link>
              )}
            </div>
          </div>

          {/* Panel Sistem Sehat */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm border border-green-500 p-6 text-white relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute right-[-20px] top-[-20px] opacity-20">
              <CheckCircle className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-bold relative z-10 mb-1">Sistem Terpantau Baik</h3>
            <p className="text-green-100 text-sm relative z-10 mb-4">
              Semua sinkronisasi database dan file gambar berjalan normal.
            </p>
            <button className="relative z-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit backdrop-blur-sm">
              Cek Log Sistem
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}