import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../authSlice';
import type { AppDispatch, RootState } from '../../../store';
import type { RegisterRequest } from '../../../types/auth';
import { Eye, EyeOff } from 'lucide-react';
import { calculateAge } from '../../../utils/calculateAge';

export const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  type RegisterFormState = Omit<RegisterRequest, 'age'> & { age: string };


  const [formData, setFormData] = useState<RegisterFormState>({
    full_name: '',
    dni: '',
    age: '',
    email: '',
    phone: '',
    password: '',
    role: 'passenger'
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email && !formData.phone) {
      alert('Debes ingresar al menos un correo electrónico o número de teléfono');
      return;
    }
    const payload: RegisterRequest = {
      ...formData,
      age: calculateAge(formData.age)
    };

    await dispatch(registerUser(payload));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        placeholder="Nombre completo"
        className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
      />
      <input
        type="text"
        value={formData.dni}
        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
        placeholder="DNI"
        className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
      />
      <div className="relative">
        <input
          type="date"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          placeholder="Fecha de nacimiento"
          className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Número de teléfono"
        className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
      />
      <div>
        <label htmlFor="password" className="sr-only">
          Contraseña
        </label>
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Contraseña"
            className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {status === 'loading' ? 'Registrando...' : 'Registrarse'}
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};