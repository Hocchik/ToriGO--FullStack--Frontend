import { Outlet } from 'react-router-dom';
import TopBar from '../TopBar';
import { Footer } from '../ui/navigation/Footer';
/* import { UserMenu } from '../ui/UserMenu'; // ajusta la ruta si es necesario
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-red- top-0 z-50">
        <TopBar />
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};