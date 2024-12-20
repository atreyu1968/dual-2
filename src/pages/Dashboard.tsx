import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  ClipboardList,
  Building2,
  Calendar,
  ChevronRight,
  Activity,
  BookOpen
} from 'lucide-react';
import { SERVER_CONFIG } from '../config';

interface DashboardStats {
  users: number;
  students: number;
  activities: number;
  companies: number;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    students: 0,
    activities: 0,
    companies: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: Users,
      label: 'Total Usuarios',
      value: stats.users,
      color: 'bg-blue-500',
      path: '/users',
      adminOnly: true
    },
    {
      icon: GraduationCap,
      label: 'Estudiantes',
      value: stats.students,
      color: 'bg-green-500',
      path: '/students'
    },
    {
      icon: Activity,
      label: 'Actividades',
      value: stats.activities,
      color: 'bg-purple-500',
      path: '/activities'
    },
    {
      icon: Building2,
      label: 'Empresas',
      value: stats.companies,
      color: 'bg-orange-500',
      path: '/companies',
      adminOnly: true
    }
  ];

  const quickActions = [
    {
      icon: GraduationCap,
      title: 'Añadir Estudiante',
      description: 'Registrar un nuevo estudiante en el sistema',
      path: '/students',
      action: () => navigate('/students')
    },
    {
      icon: ClipboardList,
      title: 'Registrar Actividad',
      description: 'Añadir una nueva actividad de estudiante',
      path: '/activities',
      action: () => navigate('/activities')
    },
    {
      icon: Calendar,
      title: 'Gestionar Cursos',
      description: 'Administrar los cursos académicos',
      path: '/academic-years',
      adminOnly: true,
      action: () => navigate('/academic-years')
    },
    {
      icon: Building2,
      title: 'Añadir Empresa',
      description: 'Registrar una nueva empresa colaboradora',
      path: '/companies',
      adminOnly: true,
      action: () => navigate('/companies')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-90" />
          <div className="relative p-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Bienvenido de nuevo, {user?.username}!
            </h2>
            <p className="text-indigo-100 text-lg max-w-2xl">
              Gestiona de forma eficiente el seguimiento de tus estudiantes en FP Dual.
              Aquí tienes un resumen de la actividad reciente.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards
          .filter(stat => !stat.adminOnly || user?.role === 'admin')
          .map((stat) => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.path)}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div
                className={`${stat.color} p-3 rounded-lg text-white mr-4 shadow-sm group-hover:scale-110 transition-transform`}
              >
                <stat.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {stat.label}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <ChevronRight 
                size={20} 
                className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" 
              />
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 min-h-[24rem]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Actividades Recientes
          </h3>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex justify-between items-center py-3 border-b last:border-0">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      Actividad de Estudiante #{i}
                    </p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions
              .filter(action => !action.adminOnly || user?.role === 'admin')
              .map((action) => (
              <div
                key={action.title}
                onClick={action.action}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex items-center mb-2">
                  <action.icon 
                    size={20} 
                    className="text-indigo-600 group-hover:scale-110 transition-transform" 
                  />
                  <h4 className="ml-2 font-medium text-gray-800">
                    {action.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};