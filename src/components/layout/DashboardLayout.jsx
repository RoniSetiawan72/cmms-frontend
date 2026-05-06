import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Wrench, LogOut, Database, Tags, MapPin, Users, UserCog, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const [openMenus, setOpenMenus] = useState({
    master: false, 
    users: false
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
      
      {/* Sidebar Kiri */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-700 tracking-tight">Smart CMMS</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link to="/" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/assets" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Package className="w-5 h-5 mr-3" />
            Manajemen Aset
          </Link>
          <Link to="/work-orders" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Wrench className="w-5 h-5 mr-3" />
            Work Orders
          </Link>

          {/* Garis Horizontal */}
          {/* <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '10px 0' }} />
          
          <ul></ul> */}

          {/* ========================================================= */}
          {/* AREA KHUSUS ADMIN */}
          {/* ========================================================= */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Administrator
              </p>

              {/* DROPDOWN 1: Master Data */}
              <div>
                <button 
                  onClick={() => toggleMenu('master')}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Database className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Master Data</span>
                  </div>
                  {openMenus.master ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                
                {/* Isi Dropdown Master Data */}
                {openMenus.master && (
                  <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
                    <Link to="/categories" className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('/categories') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                      <Tags className="w-4 h-4 mr-2" /> Kategori
                    </Link>
                    <Link to="/locations" className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('/locations') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                      <MapPin className="w-4 h-4 mr-2" /> Lokasi
                    </Link>
                  </div>
                )}
              </div>

              {/* DROPDOWN 2: User Management */}
              <div>
                <button 
                  onClick={() => toggleMenu('users')}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-gray-500" />
                    <span>User Management</span>
                  </div>
                  {openMenus.users ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                
                {/* Isi Dropdown User Management */}
                {openMenus.users && (
                  <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
                    <Link to="/users" className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('/users') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                      <Users className="w-4 h-4 mr-2" /> Users
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium text-gray-800">
            {/* Tampilkan nama jika ada, jika loading/kosong tampilkan default */}
            {user ? `Halo, ${user.name}` : 'Fasilitas Kesehatan'}
          </h2>
          <div className="flex items-center">
            {/* Tampilkan huruf pertama dari nama user sebagai Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
              {user ? user.name.charAt(0) : '?'}
            </div>
          </div>
        </header>

        {/* Area Halaman Dinamis (Tabel/Form akan dirender di sini) */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
}