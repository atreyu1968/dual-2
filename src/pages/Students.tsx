import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Search, Plus, Pencil, Power, Mail, Phone, MessageCircle, Users } from 'lucide-react';
import { StudentModal } from '../components/StudentModal';
import { GroupModal } from '../components/GroupModal';
import { SERVER_CONFIG } from '../config';
import type { Student, Group } from '../types/student';

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [studentsRes, groupsRes] = await Promise.all([
        fetch(`${SERVER_CONFIG.BASE_URL}/api/students`, { headers }),
        fetch(`${SERVER_CONFIG.BASE_URL}/api/groups`, { headers })
      ]);

      if (!studentsRes.ok || !groupsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [studentsData, groupsData] = await Promise.all([
        studentsRes.json(),
        groupsRes.json()
      ]);

      setStudents(studentsData);
      setGroups(groupsData);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async (data: { name: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el grupo');
      }

      await fetchData();
      setIsGroupModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el grupo');
    }
  };

  const handleCreateStudent = async (data: Partial<Student>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el estudiante');
      }

      await fetchData();
      setIsStudentModalOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el estudiante');
    }
  };

  const handleUpdateStudent = async (data: Partial<Student>) => {
    if (!selectedStudent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el estudiante');
      }

      await fetchData();
      setIsStudentModalOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estudiante');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/students/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      await fetchData();
    } catch (err) {
      setError('Error al cambiar el estado del estudiante');
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = (
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.dni.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesGroup = selectedGroup === 'all' || student.group_id.toString() === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Estudiantes</h2>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
            >
              <Users size={20} className="mr-2" />
              Nuevo Grupo
            </button>
          )}
          <button
            onClick={() => {
              setSelectedStudent(null);
              setIsStudentModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, CIAL o DNI..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="all">Todos los Grupos</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
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
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIAL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI/NIE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NUSS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
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
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GraduationCap className="text-indigo-600 mr-2" size={20} />
                      <div className="text-sm font-medium text-gray-900">
                        {student.full_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.cial}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.dni}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.nuss}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.group_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <a
                        href={`mailto:${student.email}`}
                        className="flex items-center text-sm text-gray-500 hover:text-indigo-600"
                      >
                        <Mail size={14} className="mr-1" />
                        {student.email}
                      </a>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${student.phone}`}
                          className="flex items-center text-sm text-gray-500 hover:text-indigo-600"
                        >
                          <Phone size={14} className="mr-1" />
                          {student.phone}
                        </a>
                        {student.phone.startsWith('6') && (
                          <a
                            href={`https://wa.me/${student.phone.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(student.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {student.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsStudentModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="Editar estudiante"
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

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}
        initialData={selectedStudent || undefined}
        mode={selectedStudent ? 'edit' : 'create'}
        groups={groups}
      />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSubmit={handleCreateGroup}
        mode="create"
      />
    </div>
  );
};