import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { UserMenu } from '../UserMenu'; 

export const navbarStyles = {
  navbar: "bg-[#77160e] fixed top-0 w-full z-30 shadow",

  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",

  content: "flex items-center justify-between h-16",

  logo: "flex items-center space-x-2",

  logoImg: "w-20 h-8 md:h-10",

  nav: "hidden md:flex space-x-8 items-center",

  link: "font-semibold text-white hover:text-gray-200 transition",

  actions: "hidden md:flex items-center space-x-4",
  
  button: "font-semibold px-4 md:px-6 py-2 bg-white text-[#77160e] rounded-full hover:bg-white/90 transition-all duration-300 shadow",

  // Mobile bottom nav
  mobileNav: "fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 md:hidden",
  mobileNavInner: "max-w-4xl mx-auto px-4 py-2 flex justify-between items-center",
  mobileButton: "flex flex-col items-center text-xs text-gray-700 px-3 py-1",
  mobileIcon: "w-6 h-6 mb-1",
  mobileLabel: "text-[11px]"
};

export const NavBar = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const role = useSelector((state: RootState) => state.auth.role);

    // Ensure we pass a `full_name` to UserMenu to satisfy the `User` type expected there
    const augmentedUser = user
      ? ({ ...(user as any), full_name: (user as any).full_name ?? `${(user as any).name ?? ''} ${(user as any).last_name ?? ''}` } as any)
      : null;

    return(
      <div style={{ fontFamily: 'Poppins, Montserrat, sans-serif' }}>
        <nav className={navbarStyles.navbar}>
          <div className={navbarStyles.container}>
            <div className={navbarStyles.content}>
              {/* Logo */}
              <div className={navbarStyles.logo}>
                <Link to="/">
                  <img src="/src/assets/logoNavbar-JV0XwCZD.png" alt="ToroGo" className={navbarStyles.logoImg} />
                </Link>
              </div>

              {/* Desktop links */}
              <div className={navbarStyles.nav}>
                <Link to="/main" className={navbarStyles.link}>INICIO</Link>
                <Link to="/about" className={navbarStyles.link}>ACERCA DE</Link>
                <Link to="/driver-Requirements" className={navbarStyles.link}>CONDUCTOR</Link>
                <Link to="/contact" className={navbarStyles.link}>CONTACTO</Link>
              </div>

              {/* Actions */}
              <div className={navbarStyles.actions}>
                <Link
                  to={role === 'DRIVER' ? '/service/driver' : '/service/passenger'}
                  className={navbarStyles.button}
                >
                    INICIA TU VIAJE
                </Link>
                <UserMenu user={augmentedUser} role={role} />
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile bottom quick nav */}
        <div className={navbarStyles.mobileNav} aria-hidden={false}>
          <div className={navbarStyles.mobileNavInner}>
            <Link to="/main" className={navbarStyles.mobileButton} aria-label="Inicio">
              <svg className={navbarStyles.mobileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5M5 21V12h14v9"/></svg>
              <span className={navbarStyles.mobileLabel}>Inicio</span>
            </Link>

            <Link to={role === 'DRIVER' ? '/service/driver' : '/service/passenger'} className={navbarStyles.mobileButton} aria-label="Pedir viaje">
              <svg className={navbarStyles.mobileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="18" r="1"/><circle cx="20" cy="18" r="1"/><path d="M1 1h4l2 5h13l3-5H1z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className={navbarStyles.mobileLabel}>Viaje</span>
            </Link>

            <Link to="/driver-Requirements" className={navbarStyles.mobileButton} aria-label="Conductor">
              <svg className={navbarStyles.mobileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5v14" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className={navbarStyles.mobileLabel}>Conductor</span>
            </Link>

            <Link to="/contact" className={navbarStyles.mobileButton} aria-label="Contacto">
              <svg className={navbarStyles.mobileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 8V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M16 3v4"/></svg>
              <span className={navbarStyles.mobileLabel}>Contacto</span>
            </Link>

            <Link to="/profile" className={navbarStyles.mobileButton} aria-label="Perfil">
              <svg className={navbarStyles.mobileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z"/><path d="M4 21a8 8 0 0116 0"/></svg>
              <span className={navbarStyles.mobileLabel}>Perfil</span>
            </Link>
          </div>
        </div>
      </div>
    );
};