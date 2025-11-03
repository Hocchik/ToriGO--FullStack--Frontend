export const contactPageStyles = {
  // Container principal
  container: "bg-center bg-white min-h-screen pt-16",
  
  // Header section
  headerSection: "bg-[url('/src/assets/cliente.jpg')] bg-center bg-cover grid md:grid-cols-2 gap-12 items-center mb-16 min-h-[90vh] px-8 py-16 pt-20",
  headerTitle: "font-semibold text-black text-8xl mb-6",
  headerSubtitle: "font-semibold text-black text-2xl  mb-4 ",
  
  // Grid principal
  mainGrid: "",
  
  // Información de contacto
  contactInfoSection: "bg-white py-16 px-8 mb-4",
  contactInfoContainer: "max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center",
  contactImageContainer: "bg-gray-200 rounded-lg h-96",
  contactInfoContent: "space-y-6",
  contactInfoTitle: "text-4xl font-bold text-gray-900 mb-6",
  contactInfoList: "space-y-3 mb-8",
  contactInfoItem: "flex items-center text-gray-700",
  contactInfoIcon: "w-2 h-2 bg-red-400 rounded-full mr-3",
  contactInfoText: "text-lg",
  
  // Horario de atención
  scheduleSection: "space-y-8",
  scheduleTitle: "text-2xl font-semibold mb-4",
  scheduleList: "space-y-2 text-gray-600",
  
  // Sección del formulario con texto y form lado a lado
  formContactSection: "bg-gray-50 py-16 px-8",
  formContactContainer: "max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center",
  formContactTextContent: "space-y-6",
  formContactTitle: "text-4xl font-bold text-gray-900 mb-6 leading-tight",
  formContactDescription: "text-gray-600 text-lg leading-relaxed",
  
  // Formulario
  formContainer: "w-full",
  form: "bg-white rounded-2xl shadow-xl p-8 space-y-6",
  formGroup: "space-y-2",
  label: "block text-sm font-semibold text-gray-700 mb-2",
  input: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500",
  textarea: "w-full px-4 py-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500",
  button: "w-full bg-red-400 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-500 focus:ring-4 focus:ring-red-200 transition-all duration-200 transform hover:scale-105"
};


export const ContactPage = () => {
  return (
    <div className={contactPageStyles.container} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className={contactPageStyles.headerSection}>
        <h1 className={contactPageStyles.headerTitle}>Contáctanos</h1>
        <p className={contactPageStyles.headerSubtitle}>Estamos aquí para ayudarte</p>
      </div>

      <div className={contactPageStyles.mainGrid}>

          <div className= {contactPageStyles.contactInfoSection}>
            <div className={contactPageStyles.contactInfoContainer}>
              
              <div className={contactPageStyles.contactImageContainer}>
                <img src="/src/assets/contacto.jpg" alt="Contacto" className="w-full h-full object-cover rounded-lg" />
              </div>

              <div className={contactPageStyles.contactInfoContent}>
                <h2 className={contactPageStyles.contactInfoTitle}>Información de Contacto</h2>
                
                <div className={contactPageStyles.contactInfoList}>
                  <div className={contactPageStyles.contactInfoItem}>
                    <div className={contactPageStyles.contactInfoIcon}></div>
                    <span className={contactPageStyles.contactInfoText}>soporte@torogo.com</span>
                  </div>
                  <div className={contactPageStyles.contactInfoItem}>
                    <div className={contactPageStyles.contactInfoIcon}></div>
                    <span className={contactPageStyles.contactInfoText}>(01) 555-0123</span>
                  </div>
                  <div className={contactPageStyles.contactInfoItem}>
                    <div className={contactPageStyles.contactInfoIcon}></div>
                    <span className={contactPageStyles.contactInfoText}>Av. Principal 123, Lima</span>
                  </div>
                </div>

                <div className={contactPageStyles.scheduleSection}>
                  <h2 className={contactPageStyles.scheduleTitle}>Horario de Atención</h2>
                  <div className={contactPageStyles.scheduleList}>
                    <p>Lunes a Viernes: 8:00 AM - 8:00 PM</p>
                    <p>Sábados y Domingos: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={contactPageStyles.formContactSection}>
            <div className={contactPageStyles.formContactContainer}>
              {/* Texto a la izquierda */}
              <div className={contactPageStyles.formContactTextContent}>
                <h2 className={contactPageStyles.formContactTitle}>
                  ¿Requiere de un mejor contacto?, complete el siguiente formulario
                </h2>
                <p className={contactPageStyles.formContactDescription}>
                  Estamos aquí para ayudarte con cualquier consulta o información que necesites. 
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>
              </div>

              {/* Formulario a la derecha */}
              <div className={contactPageStyles.formContainer}>
                <form className={contactPageStyles.form}>
                  <div className={contactPageStyles.formGroup}>
                    <label className={contactPageStyles.label}>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      className={contactPageStyles.input}
                      placeholder="NOMBRE Y APELLIDOS"
                    />
                  </div>
                  <div className={contactPageStyles.formGroup}>
                    <label className={contactPageStyles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      className={contactPageStyles.input}
                      placeholder="ejemplo@email.com"
                    />
                  </div>
                  <div className={contactPageStyles.formGroup}>
                    <label className={contactPageStyles.label}>
                      Mensaje
                    </label>
                    <textarea
                      className={contactPageStyles.textarea}
                      placeholder="¿Cómo podemos ayudarte?"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className={contactPageStyles.button}
                  >
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>
          </div>
        
      </div>
    </div>
  );
};