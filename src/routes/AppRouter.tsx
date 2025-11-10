import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { RecoverPassword } from '../features/auth/pages/RecoverPassword';
import { VerificationCodePage } from '../features/auth/pages/VerificationCodePage';
import { VerificationSucces } from '../features/auth/pages/VerificationSucces';
import { NewPassowordPage } from '../features/auth/pages/NewPasswordPage';

// Layouts
import { MainLayout } from '../components/layouts/MainLayout';
/* import { AuthLayout } from '../components/layouts/AuthLayout'; */

// Public Pages
import { HomePage } from '../features/home/pages/HomePage';
import { AboutPage } from '../features/home/pages/AboutPage';
import { ContactPage } from '../features/home/pages/ContactPage';
import { DriverRequire } from '../features/home/pages/DriverRequire';

// Auth Pages
import { AuthPage } from '../features/auth/pages/AuthPage';
import { DriverRegisterPage } from '../features/auth/pages/DriverRegisterPage';
/* import { RequestTrip } from '../features/passenger/pages/RequestTrip';

import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm'; */

// Protected Pages
import { PassengerPage } from '../features/passenger/pages/PassengerPage';
import type { JSX } from 'react';
import { DriverPage } from '../features/driver/pages/DriverPage';
import DriverProfile from '../features/driver/pages/DriverProfile';
import PassengerProfile from '../features/passenger/pages/PassengerProfile';

// ServiceRoute es para rutas que requieren autenticación
const ServiceRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  console.log(token)
  if (!token) {
    // Redirige al login si intentan acceder a servicios sin autenticación
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const ProfileRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useSelector((state: RootState) => state.auth);

  if (!token) {
    // Redirige al login si intentan acceder a servicios sin autenticación
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Rutas Públicas - Accesibles sin login */}
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="driver-Requirements" element={<DriverRequire />} />

        </Route>


        {/* Ruta de perfil - Passenger */}
        <Route path='/profile/passenger' element={<ProfileRoute><PassengerProfile/></ProfileRoute>} />

        {/* Ruta de perfil - Driver */}
        <Route path='/profile/driver' element={<ProfileRoute><DriverProfile/></ProfileRoute>} />

        {/* Rutas de servicio - Passenger */}
        <Route path='/service/passenger' element={<ServiceRoute><PassengerPage/></ServiceRoute>}/>
        
        {/* Rutas de servicio - Conductor */}
        <Route path='/service/driver' element={<DriverPage/>}/>

        {/* Rutas de Autenticación */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/driver-register" element={<DriverRegisterPage />} />

        {/* Rutas de recuperación de contraseña */}
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/verification-code" element={<VerificationCodePage />} />
        <Route path="/verification-success" element={<VerificationSucces />} />
        <Route path="/new-password" element={<NewPassowordPage />} />

        {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};