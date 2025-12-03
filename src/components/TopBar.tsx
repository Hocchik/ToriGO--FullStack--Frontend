import React from 'react';
import { Link } from 'react-router-dom';
import logoNavbar from '../assets/logoNavbar.png';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { UserMenu } from './ui/UserMenu';

export interface TopBarProps {
  profileImage?: string;
  name?: string;
}

const TopBar: React.FC<TopBarProps> = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user ?? null;
  const role = auth.role ?? null;
  // Ensure `full_name` exists for UserMenu; derive from name + last_name if missing
  const menuUser = user
    ? {
        ...user,
        full_name: (user as any).full_name ?? `${(user as any).name ?? ''} ${(user as any).last_name ?? ''}`.trim(),
      }
    : null;

  return (
    <header className="bg-red-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden">
              <img src={logoNavbar} alt="ToroGo Logo" className="w-full h-full object-contain" />
            </div>
          </Link>

          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-white font-medium hover:underline">INICIO</Link>
            <Link to="/about" className="text-white font-medium hover:underline">ACERCA DE</Link>
            <Link to="/driver-Requirements" className="text-white font-medium hover:underline">CONDUCTOR TORIGO!</Link>
            <Link to="/contact" className="text-white font-medium hover:underline">CONTACTO</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to={role === 'DRIVER' ? '/service/driver' : '/service/passenger'} className="hidden sm:inline-block bg-white text-red-500 px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition">INICIA TU VIAJE</Link>
            <UserMenu user={menuUser} role={role} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;