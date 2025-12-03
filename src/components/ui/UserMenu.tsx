import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';
import type { User } from '../../types/auth';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

export const UserMenu = ({ user, role }: { user: User | null ; role: string | null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  if (!user) return null;

  const fullName = (user as any).full_name ?? `${(user as any).name ?? ''} ${(user as any).last_name ?? ''}`.trim();
  const avatar = (user as any).profile_image ?? '';
  const resolveImageUrl = (img?: string | null) => {
    if (!img) return undefined;
    try {
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      if (img.startsWith('/')) return `${window.location.origin}${img}`;
      return `${window.location.origin}/${img}`;
    } catch (e) { return img; }
  };
  const normalizedRole = (role ?? '').toLowerCase();
  const profileRoute = normalizedRole.includes('driver') ? 'driver' : normalizedRole.includes('passenger') ? 'passenger' : 'user';

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-medium leading-4">{fullName || 'Mi Cuenta'}</span>
            <span className="text-xs text-white/80">{normalizedRole === 'driver' ? 'Conductor' : normalizedRole === 'passenger' ? 'Pasajero' : ''}</span>
          </div>
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
          <div className="py-2">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {avatar ? (
                        <img src={resolveImageUrl(avatar)} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{fullName || 'Mi Cuenta'}</div>
                  <div className="text-xs text-gray-500">{normalizedRole === 'driver' ? 'Conductor' : normalizedRole === 'passenger' ? 'Pasajero' : 'Usuario'}</div>
                </div>
              </div>
            </div>

            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <Link to={`/profile/${profileRoute}`} className={`block px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}>
                  Configuración
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button onClick={handleLogout} className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}>
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