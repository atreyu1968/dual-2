import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, Pencil, Power, Trash2, AlertCircle } from 'lucide-react';
import { CourseModal } from '../components/courses/CourseModal';
import { courseService } from '../services/courseService';
import type { Course } from '../types/course';

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const { user } = useAuth();

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      setError('Error al cargar los cursos académicos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (data: { name: string; start_date: string; end_date: string }) => {
    try {
      await courseService.create(data);
      await fetchCourses();
      setIsModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateCourse = async (data: { name: string; start_date: string; end_date: string }) => {
    if (!selectedCourse) return;
    
    try {
      await courseService.update(selectedCourse.id, data);
      await fetchCourses();
      setIsModalOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      throw err;
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await courseService.toggleStatus(id);
      await fetchCourses();
    } catch (err) {
      setError('Error al cambiar el estado del curso');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      await courseService.delete(courseToDelete.id);
      await fetchCourses();
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    } catch (err) {
      setError('Error al eliminar el curso académico');
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
        <h2 className="text-2xl font-semibold text-gray-800">Cursos Académicos</h2>
        <button
          onClick={() => {
            setSelectedCourse(null);
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
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="text-indigo-600 mr-2" size={20} />
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(course.start_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(course.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(course.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        course.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {course.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="Editar curso"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(course.id)}
                        className={`p-1 rounded-full hover:bg-gray-100 ${
                          course.active
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-red-600 hover:text-red-700'
                        }`}
                        title={course.active ? 'Desactivar curso' : 'Activar curso'}
                      >
                        <Power size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Eliminar curso"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse}
        initialData={selectedCourse || undefined}
        mode={selectedCourse ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el curso académico "{courseToDelete.name}"?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCourseToDelete(null);
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
};