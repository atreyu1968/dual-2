import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Pencil, Power, Mail, Phone, Globe, MessageCircle, Users } from 'lucide-react';
import { CompanyModal } from '../components/CompanyModal';
import { WorkCenterModal } from '../components/WorkCenterModal';
import { AddressLink } from '../components/AddressLink';
import { SERVER_CONFIG } from '../config';
import type { Company, WorkCenter } from '../types/company';

export const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isWorkCenterModalOpen, setIsWorkCenterModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenter | null>(null);
  const { user } = useAuth();

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch companies');
      
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      setError('Error al cargar las empresas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/companies/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      await fetchCompanies();
    } catch (err) {
      setError('Error al cambiar el estado de la empresa');
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
        <h2 className="text-2xl font-semibold text-gray-800">Empresas</h2>
        <button
          onClick={() => {
            setSelectedCompany(null);
            setIsCompanyModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} className="mr-2" />
          Nueva Empresa
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <div className="space-y-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Building2 className="text-indigo-600 mr-3" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.legal_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsCompanyModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                      title="Editar empresa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(company.id)}
                      className={`p-1 rounded-full hover:bg-gray-100 ${
                        company.active
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      title={company.active ? 'Desactivar empresa' : 'Activar empresa'}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <AddressLink
                      address={company.address}
                      city={company.city}
                      postalCode={company.postal_code}
                      className="text-sm text-gray-600"
                    />
                    <div className="flex items-center space-x-4">
                      <a
                        href={`mailto:${company.email}`}
                        className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
                      >
                        <Mail size={16} className="mr-2" />
                        {company.email}
                      </a>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${company.phone}`}
                          className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
                        >
                          <Phone size={16} className="mr-2" />
                          {company.phone}
                        </a>
                        {company.phone.startsWith('6') && (
                          <a
                            href={`https://wa.me/${company.phone.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
                      >
                        <Globe size={16} className="mr-2" />
                        {company.website}
                      </a>
                    )}
                  </div>
                  <div className="flex justify-end items-start">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setSelectedWorkCenter(null);
                        setIsWorkCenterModalOpen(true);
                      }}
                      className="flex items-center px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                    >
                      <Plus size={16} className="mr-1" />
                      Añadir Centro de Trabajo
                    </button>
                  </div>
                </div>

                {company.work_centers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Centros de Trabajo ({company.work_centers.length})
                    </h4>
                    <div className="space-y-3">
                      {company.work_centers.map((center) => (
                        <div
                          key={center.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{center.name}</h5>
                            <AddressLink
                              address={center.address}
                              city={center.city}
                              postalCode={center.postal_code}
                              className="text-sm text-gray-500"
                              iconSize={14}
                            />
                            {center.tutor && (
                              <div className="mt-1 text-sm text-gray-500">
                                <p className="flex items-center">
                                  <Users size={14} className="mr-1" />
                                  Tutor: {center.tutor.full_name}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <a
                                    href={`mailto:${center.tutor.email}`}
                                    className="flex items-center text-gray-500 hover:text-indigo-600"
                                  >
                                    <Mail size={14} className="mr-1" />
                                    {center.tutor.email}
                                  </a>
                                  <a
                                    href={`tel:${center.tutor.phone}`}
                                    className="flex items-center text-gray-500 hover:text-indigo-600"
                                  >
                                    <Phone size={14} className="mr-1" />
                                    {center.tutor.phone}
                                  </a>
                                  {center.tutor.phone.startsWith('6') && (
                                    <a
                                      href={`https://wa.me/${center.tutor.phone.replace(/\+/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <MessageCircle size={14} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setSelectedWorkCenter(center);
                                setIsWorkCenterModalOpen(true);
                              }}
                              className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-white"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={async (data) => {
          try {
            const token = localStorage.getItem('token');
            const url = selectedCompany
              ? `${SERVER_CONFIG.BASE_URL}/api/companies/${selectedCompany.id}`
              : `${SERVER_CONFIG.BASE_URL}/api/companies`;
            const method = selectedCompany ? 'PUT' : 'POST';

            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to save company');

            await fetchCompanies();
            setIsCompanyModalOpen(false);
            setSelectedCompany(null);
          } catch (err) {
            setError('Error al guardar la empresa');
          }
        }}
        initialData={selectedCompany || undefined}
        mode={selectedCompany ? 'edit' : 'create'}
      />

      <WorkCenterModal
        isOpen={isWorkCenterModalOpen}
        onClose={() => {
          setIsWorkCenterModalOpen(false);
          setSelectedWorkCenter(null);
        }}
        onSubmit={async (data) => {
          if (!selectedCompany) return;

          try {
            const token = localStorage.getItem('token');
            const url = selectedWorkCenter
              ? `${SERVER_CONFIG.BASE_URL}/api/companies/${selectedCompany.id}/work-centers/${selectedWorkCenter.id}`
              : `${SERVER_CONFIG.BASE_URL}/api/companies/${selectedCompany.id}/work-centers`;
            const method = selectedWorkCenter ? 'PUT' : 'POST';

            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to save work center');

            await fetchCompanies();
            setIsWorkCenterModalOpen(false);
            setSelectedWorkCenter(null);
          } catch (err) {
            setError('Error al guardar el centro de trabajo');
          }
        }}
        initialData={selectedWorkCenter || undefined}
        mode={selectedWorkCenter ? 'edit' : 'create'}
        companyId={selectedCompany?.id || 0}
        companyData={selectedCompany ? {
          name: selectedCompany.name,
          address: selectedCompany.address,
          city: selectedCompany.city,
          postal_code: selectedCompany.postal_code,
          phone: selectedCompany.phone,
          email: selectedCompany.email
        } : undefined}
      />
    </div>
  );
};