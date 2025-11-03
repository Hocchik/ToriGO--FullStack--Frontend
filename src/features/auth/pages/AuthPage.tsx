import toriGo from '/src/assets/logo-torigo.png'; 
import LoginForm from '../components/LoginForm'; 
import { RegisterForm } from '../components/RegisterForm'; 
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { useEffect, useState } from 'react'; 
import { useSelector } from 'react-redux'; 
import type { RootState } from '../../../store';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(!searchParams.get('register'));
  const navigate = useNavigate();

    const { token, role } = useSelector((state: RootState) => state.auth);

  useEffect(() => { 
    if (token) {
      const redirectPath = role === 'admin' ? '/admin' : '/';
       navigate(redirectPath, { replace: true }); } 
      }, [token, role, navigate]);


  const handleToggle = (login: boolean) => {
    setIsLogin(login);
    navigate(`/auth${login ? '' : '?register=true'}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-white">
      {/* Botón Volver - Esquina Superior Derecha */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <svg 
            className="w-4 h-4 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-gray-700 font-medium">Volver</span>
        </button>
      </div>

      <div className="min-h-screen flex">
        {/* Logo Section - Left Side */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-[#f7f7f7] items-end justify-center p-12">
          <div className="max-w-md">
            <img
              src={toriGo}
              alt="ToriGo"
              className="w-150 h-150 object-contain"
            />
          </div>
        </div>

        {/* Login Form Section - Right Side */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <img
                src={toriGo}
                alt="ToriGo"
                className="w-32 h-32 object-contain mx-auto mb-6"
              />
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Bienvenido!' : 'Únete a ToroGo!'}
              </h1>
              <p className="text-gray-600 mt-2 font-bold">
                {isLogin ? 'Accede a tu cuenta' : 'Crea tu cuenta para comenzar'}
              </p>
            </div>
            {isLogin ? <LoginForm /> : <RegisterForm />}
            
            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <a
                  onClick={() => handleToggle(!isLogin)}
                  className="font-medium text-red-700 hover:text-red-800 transition-colors duration-200"
                >
                  {isLogin? ' Regístrate aquí' : ' Inicia sesión aquí'}
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};