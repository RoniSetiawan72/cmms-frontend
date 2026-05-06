import { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit, Trash2, Tags, Loader2, AlertCircle, CheckCircle, X, MapPin, GitMerge, UsersIcon, Shield } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoadiing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teknisi'
  });
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const toastTimeRef = useRef(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
        const data = await getUsers(searchTerm);
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal mengambil data user", error);
      } finally {
        setIsLoadiing(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditingData(null);
    setFormData({ name: '', email: '', password: '', role: 'teknisi' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingData(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'teknisi'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData };
    if (editingData && payload.password === '') {
        delete payload.password;
    }

    try {
        if (editingData) {
            await updateUser(editingData.id, payload);
            showToast('success', 'Data pengguna berhasil diperbarui!');
        } else {
            await createUser(payload);
            showToast('success', 'Pengguna baru berhasil ditambahkan!');
        }
        setIsModalOpen(false);
        setSearchTerm(prev => prev + ' '); setTimeout(() => setSearchTerm(prev => prev.trim()), 50);
    } catch (error) {
        showToast('error', error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (category) => {
    setUserToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter(c => c.id !== userToDelete.id));
      showToast('success', 'User berhasil dihapus!');
    } catch (error) {
      showToast('error', 'Gagal menghapus User.');
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const renderRoleBadge = (role) => {
    const roleName = role?.toLowerCase();

    if (roleName === 'admin') {
      return (
        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded border border-purple-200 flex items-center w-fit">
          <Shield className="w-3 h-3 mr-1" /> Administrator
        </span>
      );
    }

    if (roleName === 'nurse') {
      return (
        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded border border-emerald-200 flex items-center w-fit">
          Nurse (Perawat)
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200 flex items-center w-fit">
        Teknisi
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UsersIcon className="w-6 h-6 mr-2 text-blue-600" />
            User Management
          </h1>
          <p className="text-sm text-gray-500">Kelola akses administrator dan teknisi sistem</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text" placeholder="Cari nama atau email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={openAddModal} className="flex-shrink-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Tambah User
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Pengguna</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Tidak ada data pengguna.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{renderRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => openEditModal(user)} className="text-amber-600 hover:text-amber-900 mx-3">
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900">
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingData ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email <span className="text-red-500">*</span></label>
                <input
                  type="email" required
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="budi@faskes.local"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingData ? '' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editingData} // Wajib jika mode tambah, opsional jika edit
                  minLength="8"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={editingData ? "Kosongkan jika tidak ingin mengubah" : "Minimal 8 karakter"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Akses <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="admin">Administrator</option>
                  <option value="teknisi">Teknisi</option>
                  <option value="nurse">Nurse/Perawat</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hapus Pengguna?</h3>
              <p className="text-sm text-gray-500 mb-6">Yakin ingin menghapus <span className="font-bold">"{userToDelete?.name}"</span>? Akun ini tidak akan bisa login lagi.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Batal</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg">Ya, Hapus</button>
              </div>
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