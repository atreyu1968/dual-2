import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound } from 'lucide-react';
import { SERVER_CONFIG } from '../config';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    must_change_password: boolean;
  };
}

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${SERVER_CONFIG.BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      login(data.token, data.user);
      
      if (data.user.must_change_password) {
        navigate('/change-password');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070"
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-indigo-900/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-xl">
            <h1 className="text-4xl font-bold mb-4">
              Gestión de FP Dual
            </h1>
            <p className="text-lg text-white/90">
              Conectando el talento del futuro con las empresas de hoy. Una plataforma
              integral para la gestión y seguimiento del aprendizaje dual.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="https://i.postimg.cc/6TszsRP0/MARCA-SOFTWARE.png"
              alt="Software Brand Logo"
              className="h-16 mx-auto mb-8"
            />
            <h2 className="text-3xl font-bold text-gray-900">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-gray-600">
              Introduce tus credenciales para acceder
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p className="font-medium">
                {error === 'Invalid username or password' ? 'Usuario o contraseña inválidos' : error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Usuario o Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Introduce tu usuario o email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Iniciar sesión
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};