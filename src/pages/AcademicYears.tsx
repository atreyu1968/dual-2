import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Pencil, Power, Plus } from 'lucide-react';
import { AcademicYearModal } from '../components/AcademicYearModal';
import { SERVER_CONFIG } from '../config';

interface AcademicYear {
  id: number;
  start_date: string;
  end_date: string;
  name: string;
  active: boolean;
  created_at: string;
}

export const AcademicYears = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const { user } = useAuth();

  const fetchYears = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/academic-years`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch academic years');
      
      const data = await response.json();
      setYears(data);
    } catch (err) {
      setError('Error al cargar los cursos académicos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateYear = async (data: { name: string; start_date: string; end_date: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/academic-years`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el curso académico');
      }

      await fetchYears();
      setIsModalOpen(false);
      setSelectedYear(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el curso académico');
    }
  };

  const handleUpdateYear = async (data: { name: string; start_date: string; end_date: string }) => {
    if (!selectedYear) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/academic-years/${selectedYear.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el curso académico');
      }

      await fetchYears();
      setIsModalOpen(false);
      setSelectedYear(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el curso académico');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/academic-years/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      await fetchYears();
    } catch (err) {
      setError('Error al cambiar el estado del curso');
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Cursos Académicos</h2>
        <button
          onClick={() => {
            setSelectedYear(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} className="mr-2" />
          Nuevo Curso
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {years.map((year) => (
                <tr key={year.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="text-indigo-600 mr-2" size={20} />
                      <div className="text-sm font-medium text-gray-900">{year.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(year.start_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(year.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(year.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        year.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {year.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedYear(year)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="Editar curso"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AcademicYearModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedYear(null);
        }}
        onSubmit={selectedYear ? handleUpdateYear : handleCreateYear}
        initialData={selectedYear || undefined}
        mode={selectedYear ? 'edit' : 'create'}
      />
    </div>
  );
};