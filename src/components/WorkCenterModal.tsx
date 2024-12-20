import React, { useState, useEffect } from 'react';
import { X, Copy, UserPlus } from 'lucide-react';
import { SERVER_CONFIG } from '../config';
import type { WorkCenter } from '../types/company';

interface Tutor {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
}

interface WorkCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<WorkCenter>) => void;
  initialData?: WorkCenter;
  mode: 'create' | 'edit';
  companyId: number;
  companyData?: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    phone: string;
    email: string;
  };
}

export const WorkCenterModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  companyId,
  companyData
}: WorkCenterModalProps) => {
  // Work Center States
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [postalCode, setPostalCode] = useState(initialData?.postal_code || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [tutorId, setTutorId] = useState(initialData?.tutor_id || '');
  
  // Tutor Creation States
  const [isCreatingTutor, setIsCreatingTutor] = useState(false);
  const [tutorFullName, setTutorFullName] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [tutorDepartment, setTutorDepartment] = useState('');
  
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [error, setError] = useState('');

  const handleCopyCompanyData = () => {
    if (companyData) {
      setName(companyData.name);
      setAddress(companyData.address);
      setCity(companyData.city);
      setPostalCode(companyData.postal_code);
      setPhone(companyData.phone);
      setEmail(companyData.email);
    }
  };

  const handleCreateTutor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: tutorEmail,
          password: tutorEmail,
          role: 'company_tutor',
          email: tutorEmail,
          phone: tutorPhone,
          full_name: tutorFullName,
          department: tutorDepartment
        }),
      });

      if (!response.ok) throw new Error('Failed to create tutor');

      const newTutor = await response.json();
      setTutors([...tutors, newTutor]);
      setTutorId(newTutor.id.toString());
      setIsCreatingTutor(false);
      
      // Reset form
      setTutorFullName('');
      setTutorEmail('');
      setTutorPhone('');
      setTutorDepartment('');
      setError('');
    } catch (err) {
      setError('Error al crear el tutor');
    }
  };

  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoadingTutors(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/company-tutors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch tutors');
        
        const data = await response.json();
        setTutors(data);
      } catch (err) {
        console.error('Error fetching tutors:', err);
      } finally {
        setIsLoadingTutors(false);
      }
    };

    fetchTutors();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      address,
      city,
      postal_code: postalCode,
      phone,
      email,
      tutor_id: tutorId ? parseInt(tutorId) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'Añadir Centro de Trabajo' : 'Editar Centro de Trabajo'}
          </h3>
          {mode === 'create' && companyData && (
            <button
              type="button"
              onClick={handleCopyCompanyData}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 mr-4"
            >
              <Copy size={16} className="mr-1" />
              Copiar datos de empresa
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Postal</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Tutor de Empresa</label>
              <button
                type="button"
                onClick={() => setIsCreatingTutor(!isCreatingTutor)}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
              >
                <UserPlus size={16} className="mr-1" />
                {isCreatingTutor ? 'Seleccionar existente' : 'Crear nuevo tutor'}
              </button>
            </div>
            
            {isCreatingTutor ? (
              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    value={tutorFullName}
                    onChange={(e) => setTutorFullName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required={isCreatingTutor}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={tutorEmail}
                    onChange={(e) => setTutorEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required={isCreatingTutor}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={tutorPhone}
                    onChange={(e) => setTutorPhone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required={isCreatingTutor}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <input
                    type="text"
                    value={tutorDepartment}
                    onChange={(e) => setTutorDepartment(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required={isCreatingTutor}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateTutor}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Crear Tutor
                </button>
              </div>
            ) : (
              <select
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar tutor</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.full_name} ({tutor.email})
                  </option>
                ))}
              </select>
            )}
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