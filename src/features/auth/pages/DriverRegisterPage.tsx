import toriGo from '/src/assets/logoNavbar.png';
import { DriverRegisterForm } from '../components/DriverRegisterForm';
import { useNavigate } from 'react-router-dom';

export const DriverRegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Botón Volver - Esquina Superior Derecha */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium text-sm">Volver</span>
        </button>
      </div>

      <div className="h-screen flex">
        {/* Logo Section - Left Side */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-white items-center justify-center p-12">
          <div className="max-w-md text-center">
            <img
              src={toriGo}
              alt="ToriGo"
              className="w-64 h-64 object-contain mx-auto"
            />
          </div>
        </div>

        {/* Form Section - Right Side */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-3 lg:p-6 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-4">
              <img
                src={toriGo}
                alt="ToriGo"
                className="w-20 h-20 object-contain mx-auto mb-3"
              />
            </div>

            <DriverRegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};
