import { Link } from 'react-router-dom';

export const footerStyles = {
  footer: "bg-black text-white py-12",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  content: "grid gap-8",
  topRow: "flex flex-col md:flex-row md:items-start md:justify-between gap-6",
  brandSection: "flex-1",
  logo: "w-28 md:w-36 mx-auto md:mx-0",
  description: "text-gray-300 mt-4 text-center md:text-left",
  linksWrapper: "flex-1 flex flex-col md:items-end md:justify-start",
  linksBox: "flex flex-col sm:flex-row gap-6 sm:gap-12 items-center md:items-end",
  linkGroup: "text-center md:text-right",
  linkTitle: "font-semibold text-lg mb-3",
  link: "block text-gray-300 hover:text-white transition-colors",
  bottomRow: "mt-8 border-t border-white/10 pt-6 text-center md:text-left",
  copyright: "text-gray-400 text-sm",
  libro: "mt-4 md:mt-0",
  libroimg: "w-20 h-20 mx-auto md:mx-0",
};

export const Footer = () => {
  return (
    <footer className={footerStyles.footer} style={{ fontFamily: 'Poppins, Montserrat, sans-serif' }}>
      <div className={footerStyles.container}>
        <div className={footerStyles.topRow}>
          {/* Brand */}
          <div className={footerStyles.brandSection}>
            <img src="/src/assets/logo-torigonombre.png" alt="ToroGo" className={footerStyles.logo} />
            <p className={footerStyles.description}>
              Viaja seguro en mototaxi con <strong>ToriGo!</strong>
            </p>
          </div>

          {/* Links */}
          <div className={footerStyles.linksWrapper}>
            <div className={footerStyles.linksBox}>
              <div className={footerStyles.linkGroup}>
                <h4 className={footerStyles.linkTitle}>Empresa</h4>
                <Link to="/about" className={footerStyles.link}>Acerca de</Link>
                <Link to="/contact" className={footerStyles.link}>Contacto</Link>
              </div>

              <div className={footerStyles.linkGroup}>
                <h4 className={footerStyles.linkTitle}>Servicio</h4>
                <Link to="/driver" className={footerStyles.link}>Conductor</Link>
                <a href="/Terminos-y-condiciones.pdf" target="_blank" rel="noopener noreferrer" className={footerStyles.link}>Términos</a>
              </div>
            </div>

            <div className={footerStyles.libro}>
              <a href="/Terminos-y-condiciones.pdf" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-90">
                <img src="/src/assets/reclamacion.png" alt="Libro de Reclamaciones" className={footerStyles.libroimg} />
              </a>
            </div>
          </div>
        </div>

        <div className={footerStyles.bottomRow}>
          <p className={footerStyles.copyright}>© 2025 ToroGo. Todos los derechos reservados.</p>
          <p className="text-gray-400 text-xs mt-2">ToriGO! es un servicio informativo y no se constituye como proveedor de transporte ni de servicios de taxi. Los servicios de transporte están a cargo de terceros.</p>
        </div>
      </div>
    </footer>
  );
};