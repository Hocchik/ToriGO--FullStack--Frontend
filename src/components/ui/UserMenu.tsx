import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';
import type { User } from '../../types/auth';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice'; // ajusta la ruta si es distinta

export const UserMenu = ({ user, role }: { user: User | null ; role: string | null }) => {
  const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    };

    if (!user) {
    return null
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        <Menu.Button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-indigo-600">
          <UserIcon className="h-5 w-5" />
          <span>{user.full_name}{role=="passenger"? "Psj":"Dvr"}</span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <Link
                  to={`/profile/${role}`}
                  className={`block px-4 py-2 text-sm ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  Configuración
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
            {({ active }: { active: boolean }) => (
                <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2 text-sm ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
                >
                Cerrar sesión
                </button>
            )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};