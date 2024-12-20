import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  GraduationCap,
  Building2,
  Calendar,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Panel', path: '/' },
    { icon: Users, label: 'Usuarios', path: '/users', adminOnly: true },
    { icon: Users, label: 'Grupos', path: '/groups', adminOnly: true },
    { icon: GraduationCap, label: 'Estudiantes', path: '/students' },
    { icon: Calendar, label: 'Cursos', path: '/academic-years', adminOnly: true },
    { icon: Building2, label: 'Empresas', path: '/companies', adminOnly: true },
    { icon: ClipboardList, label: 'Actividades', path: '/activities' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="group bg-[#2A303C] text-gray-300 w-12 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden flex flex-col">
        <div className="flex items-center justify-center h-14 overflow-hidden bg-white/10 backdrop-blur-sm">
          <img
            src="https://i.postimg.cc/6TszsRP0/MARCA-SOFTWARE.png"
            alt="Software Brand Logo"
            className="h-8 w-8 min-w-[2rem] object-contain"
          />
          <span className="ml-3 text-lg font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Gestión FP Dual
          </span>
        </div>
        <nav className="mt-4 flex-1">
          {menuItems.map(
            (item) =>
              (!item.adminOnly || user?.role === 'admin') && (
                <div key={item.path}>
                  {item.divider && <hr className="border-gray-700 mx-3 my-4" />}
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 ${
                      location.pathname === item.path
                        ? 'bg-gray-800/50 text-white'
                        : 'hover:bg-gray-800/30 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className="min-w-[18px]" />
                    <span className="ml-3 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.label}
                    </span>
                  </Link>
                </div>
              )
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#2A303C] shadow-sm h-14">
          <div className="flex items-center justify-between px-6 h-full">
            <h1 className="text-xl font-semibold text-gray-100">
              {menuItems.find((item) => item.path === location.pathname)?.label ||
                'Dashboard'}
            </h1>
            <div className="flex items-center space-x-6">
              <span className="text-gray-300">
                {user?.username} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-300 hover:text-white"
              >
                <LogOut size={18} className="mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};