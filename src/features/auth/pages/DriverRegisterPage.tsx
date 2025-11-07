import toriGo from '/src/assets/logoNavbar.png';
import { DriverRegisterForm } from '../components/DriverRegisterForm';
import { useNavigate } from 'react-router-dom';

export const DriverRegisterPage = () => {
  const navigate = useNavigate();

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

        {/* Form Section - Right Side */}
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
            
            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registro Conductor
              </h1>
            </div>

            <DriverRegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};
