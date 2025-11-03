import { Outlet, /* Link */ } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { NavBar } from '../ui/navigation/NavBar';
import { Footer } from '../ui/navigation/Footer';
/* import { UserMenu } from '../ui/UserMenu'; // ajusta la ruta si es necesario
 */
export const MainLayout = () => {
  const { user, /* role */ } = useSelector((state: RootState) => state.auth);
  console.log(user)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-red- top-0 z-50">
      <NavBar />
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};