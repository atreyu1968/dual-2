import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Group } from '../types/student';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  initialData?: Group;
  mode: 'create' | 'edit';
}

export const GroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}: GroupModalProps) => {
  const [name, setName] = useState(initialData?.name || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'Añadir Grupo' : 'Editar Grupo'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Grupo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Ej: 2º DAW"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};