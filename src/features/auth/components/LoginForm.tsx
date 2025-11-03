import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../authSlice';
import type { AppDispatch, RootState } from '../../../store';
import type { LoginRequest } from '../../../types/auth';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  const handleGoogleLogin = () => {
    console.log('Google login attempt');
    // Aquí podrías integrar lógica con Firebase, OAuth, etc.
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="sr-only">
            Número de teléfono o correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="text"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            placeholder="Número de teléfono o correo electrónico"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="sr-only">Contraseña</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 font-medium">
            {typeof error === 'string' ? error : 'Error al iniciar sesión'}
          </p>
        )}

        {/* Forgot Password */}
        <div className="text-left">
          <a
            href="/recover-password"
            className="text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
          >
            ¿Olvidaste tu contraseña? Recupérala aquí
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
            status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {status === 'loading' ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">O</span>
        </div>
      </div>

      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continúa con Google
      </button>
    </div>
  );
};

export default LoginForm;