import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Pencil, Power, Trash2, AlertCircle } from 'lucide-react';
import { GroupModal } from '../components/groups/GroupModal';
import { groupService } from '../services/groupService';
import type { Group } from '../types/group';

export const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const { user } = useAuth();

  const fetchGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (err) {
      setError('Error al cargar los grupos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (data: { name: string }) => {
    try {
      await groupService.create(data);
      await fetchGroups();
      setIsModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateGroup = async (data: { name: string }) => {
    if (!selectedGroup) return;
    
    try {
      await groupService.update(selectedGroup.id, data);
      await fetchGroups();
      setIsModalOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      throw err;
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await groupService.toggleStatus(id);
      await fetchGroups();
    } catch (err) {
      setError('Error al cambiar el estado del grupo');
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    setGroupToDelete(group);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      await groupService.delete(groupToDelete.id);
      await fetchGroups();
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
    } catch (err) {
      setError('Error al eliminar el grupo');
    }
  };

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
        <h2 className="text-2xl font-semibold text-gray-800">Grupos</h2>
        <button
          onClick={() => {
            setSelectedGroup(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} className="mr-2" />
          Nuevo Grupo
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
                  Curso Académico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
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
              {groups.map((group) => (
                <tr key={group.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="text-indigo-600 mr-2" size={20} />
                      <div className="text-sm font-medium text-gray-900">{group.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{group.academic_year_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {group.student_count} {group.student_count === 1 ? 'estudiante' : 'estudiantes'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(group.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        group.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {group.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="Editar grupo"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(group.id)}
                        className={`p-1 rounded-full hover:bg-gray-100 ${
                          group.active
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-red-600 hover:text-red-700'
                        }`}
                        title={group.active ? 'Desactivar grupo' : 'Activar grupo'}
                      >
                        <Power size={18} />
                      </button>
                      {group.student_count === 0 && (
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Eliminar grupo"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GroupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGroup(null);
        }}
        onSubmit={selectedGroup ? handleUpdateGroup : handleCreateGroup}
        initialData={selectedGroup || undefined}
        mode={selectedGroup ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && groupToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el grupo "{groupToDelete.name}"?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setGroupToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}