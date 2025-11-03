import  { Link } from 'react-router-dom';

export const footerStyles = {
  footer: "bg-black text-white py-12",

  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",

  content: "grid md:grid-cols-2 gap-8",

  brandSection: "space-y-4",

  logo: "w-20 h-20 -translate-x-24",

  description: "text-gray-300 -translate-x-24",

  linksSection: "space-y-2 text-right translate-x-24",

  linkTitle: "font-semibold text-lg mb-4",

  link: "block text-gray-300 hover:text-white transition-colors",
  
  libro: "flex justify-end -translatio-x-20",

  libroimg: "w-24 h-24",

  copyright: "-translate-x-24 text-gray-400 text-sm mt-8",
};

export const Footer = () => {
  return (
    <footer className={footerStyles.footer} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className={footerStyles.container}>
        <div className={footerStyles.content}>
          {/* Logo y descripción */}
          <div className={footerStyles.brandSection}>
            <img src="./src/assets/logo-torigonombre.png" alt="ToroGo" className={footerStyles.logo} />
            <p className={footerStyles.description}>
              Viaja seguro en mototaxi con ToriGO!
            </p>
          </div>
          
          {/* Enlaces */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.linkTitle}>Enlaces</h3>
            <Link to="/about" className={footerStyles.link}>Acerca de</Link>
            <Link to="/driver" className={footerStyles.link}>Conductor</Link>
            <Link to="/contact" className={footerStyles.link}>Contacto</Link>
          </div>
          
          {/* Copyright */}
          <div className={footerStyles.copyright}>
            <p>© 2025 ToroGo. Todos los derechos reservados.</p>
            <p>ToriGO! es un servicio informativo y no se constituye como proveedor de transporte ni de servicios de taxi. Los servicios de transporte están a cargo de terceros.</p>
          </div>

          <div className={footerStyles.libro}>
            <a 
              href="/Terminos-y-condiciones.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img src="/src/assets/reclamacion.png" alt="Libro de Reclamaciones" className={footerStyles.libroimg} />      
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};