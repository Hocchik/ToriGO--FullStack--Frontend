import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { UserMenu } from '../UserMenu'; 

export const navbarStyles = {
  navbar: "bg-[#77160e] fixed top-0 w-full z-50 shadow-lg",

  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",

  content: "bg-red-400 flex justify-between h-16 items-center",

  logo: "flex items-center space-x-2",

  logoImg: "translate-x-20 w-18 h-18",

  nav: "hidden md:flex space-x-8",

  link: " font-semibold text-white hover:text-gray-200 transition",

  actions: "flex items-center space-x-4 -translate-x-20",
  
  button: "font-semibold px-6 py-2 bg-white text-red-500 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md"
};

export const NavBar = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const role = useSelector((state: RootState) => state.auth.role);

    return(
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <nav className={navbarStyles.navbar}>
          <div className={navbarStyles.content}>
            {/* Logo */}
            <div className={navbarStyles.logo}>
              <img src="./src/assets/logo-torigo.png" alt="Logo" className={navbarStyles.logoImg} />      
            </div>

            {/* Atajos personalizados */}
            <div className={navbarStyles.nav}>
              <Link to="/main" className={navbarStyles.link}>INICIO</Link>
              <Link to="/about" className={navbarStyles.link}>ACERCA DE</Link>
              <Link to="/driver-Requirements" className={navbarStyles.link}>CONDUCTOR TORIGO!</Link>
              <Link to="/contact" className={navbarStyles.link}>CONTACTO</Link>
            </div>

            {/* Usuario y rol */}
            <div className={navbarStyles.actions}>
              <Link
                to={role === 'driver' ? '/service/driver' : '/service/passenger'}
                className={navbarStyles.button}
              >
                  INICIA TU VIAJE
                </Link>
                <UserMenu user={user} role={role} />
            </div>
          </div>
        </nav>
      </div>  
    );
};