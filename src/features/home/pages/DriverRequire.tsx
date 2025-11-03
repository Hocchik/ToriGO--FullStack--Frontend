import { useState } from 'react';
export const driverRequireStyles = {
  driverRequireContainer: "bg-center bg-white",

  // Nueva sección hero
  heroSection: "bg-white py-20 px-8",
  heroContainer: "max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center",
  heroContent: "space-y-6",
  heroTitle: "text-5xl font-bold text-gray-900 leading-tight mb-6",
  heroDescription: "text-gray-600 text-lg leading-relaxed mb-8",
  heroImageContainer: "bg-gray-200 rounded-lg h-96",
  heroImage: "w-full h-full object-cover rounded-lg",

  valueCardImage: "flex items-center space-x-2",
  valueCardImagepng: "w-20 h-20 mx-auto mb-4",
  valuesSection: "bg-gray-50 rounded-2xl p-8 mb-16",
  valuesTitle: "text-5xl font-semibold mb-8 text-center",
  valuesGrid: "grid md:grid-cols-3 gap-8 w-290 mx-auto",
  valueCard: "border border-none rounded-xl  bg-white text-center w-90 mx-auto p-10",
  valueCardTitle: "font-semibold text-xl mb-2",
  valueCardText: "font-bold text-gray-600",

  registerSection: "py-16 px-8",
  registerTitle: "text-center text-5xl font-semibold mb-12",
  registerGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto",
  registerCard: "border border-none rounded-xl bg-white text-center max-w-xs mx-auto p-8 flex flex-col items-center",
  registerCardTitle: "w-12 h-12 rounded-full bg-black text-red-400 flex items-center justify-center mb-4 text-xl font-bold",
  registerCardText: "font-bold text-gray-600 text-center",

  preguntasSection: "bg-gray-50 py-16 px-8 mb-16",
  preguntasTitle: "text-4xl font-bold text-gray-900 text-center mb-12",
  preguntasContainer: "max-w-4xl mx-auto",
  preguntasGrid: "flex flex-col md:flex-row gap-6",
  preguntasColumn: "flex-1 space-y-6",
  preguntasItem: "bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md",
  preguntasButton: "w-full p-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-400",
  preguntasQuestion: "text-lg font-semibold text-gray-800 pr-4",
  preguntasIcon: "text-2xl text-gray-600 transition-transform duration-200",
  preguntasAnswer: "px-6 pb-6 text-gray-600 leading-relaxed",
  preguntasAnswerExpanded: "px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4",

  // Sección CTA final
  ctaSection: "bg-[#77160e] py-16 px-8",
  ctaContainer: "max-w-4xl mx-auto text-center",
  ctaTitle: "text-4xl font-bold text-white mb-6",
  ctaDescription: "text-xl text-white/90 mb-8 leading-relaxed",
  ctaButton: "inline-block bg-white text-[#77160e] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
}

const faqData = [
  {
    id: 1,
    question: "¿Es seguro conducir por Perú?",
    answer: "El estado de las carreteras puede variar mucho. Puedes encontrarte baches, superficies irregulares e incluso tramos sin asfaltar fuera de las grandes ciudades."
  },
  {
    id: 2,
    question: "¿Qué hace el conductor en caso de conflicto con el pasajero?",
    answer: "En caso de disputa con un pasajero, pulse el botón \"Conflicto\". La conversación se grabará y se enviará al especialista de asistencia. Allí estudiarán la situación."
  },
  {
    id: 3,
    question: "¿Necesito experiencia previa para ser conductor?",
    answer: "No necesitas experiencia previa, pero sí debes tener una licencia de conducir válida y cumplir con los requisitos de la plataforma."
  },
  {
    id: 4,
    question: "¿Cuáles son las tarifas de ToroGo?",
    answer: "Nuestras tarifas son competitivas y transparentes. El precio se calcula según la distancia y duración del viaje. No hay costos ocultos."
  },
  {
    id: 5,
    question: "¿Cuántas horas trabajan los mototaxistas?",
    answer: "Los mototaxistas pueden trabajar en horarios flexibles, pero se espera que estén disponibles durante las horas pico para maximizar sus ganancias."
  },
  {
    id: 6,
    question: "¿A qué edad se puede conducir en Perú?",
    answer: "En Perú, la edad mínima para obtener una licencia de conducir es de 18 años."
  }
];

export const DriverRequire = () => {

  const [expandedFAQs, setExpandedFAQs] = useState<number[]>([]);
  
    const toggleFAQ = (id: number) => {
      setExpandedFAQs(prev => 
        prev.includes(id) 
          ? prev.filter(faqId => faqId !== id)
          : [...prev, id]
      );
    };

    const leftColumnFAQs = faqData.filter((_, index) => index % 2 === 0);
    const rightColumnFAQs = faqData.filter((_, index) => index % 2 === 1);
  return (
    <div className={driverRequireStyles.driverRequireContainer} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Nueva sección hero */}
      <section className={driverRequireStyles.heroSection}>
        <div className={driverRequireStyles.heroContainer}>
          {/* Contenido de texto */}
          <div className={driverRequireStyles.heroContent}>
            <h1 className={driverRequireStyles.heroTitle}>
              Conduce y gana con ToriGo!
            </h1>
            <p className={driverRequireStyles.heroDescription}>
              Empieza tu carrera hoy como conductor de mototaxi con ToriGo!. Disfruta de horarios flexibles, 
              asistencia 24/7 y bonificaciones semanales de hasta S/ 200. La app ToriGo! Pro te mostrará los 
              lugares donde puedes ganar más y te ayudará a llegar del punto A al punto B lo más rápido 
              posible con nuestro avanzado sistema de navegación.
            </p>
          </div>

          {/* Imagen */}
          <div className={driverRequireStyles.heroImageContainer}>
            <img 
              src="/src/assets/conductor.jpg" 
              alt="Conductor ToroGo" 
              className={driverRequireStyles.heroImage}
            />
          </div>
        </div>
      </section>

      <div className={driverRequireStyles.valuesSection}>
        <h2 className={driverRequireStyles.valuesTitle}>Obtén beneficios siendo nuestro socio</h2>
        <div className={driverRequireStyles.valuesGrid}>
          <div className={driverRequireStyles.valueCard}>
            <div className={driverRequireStyles.valueCardImage}>
                 <img src="/src/assets/accesibilidad.png" alt="accesibilidad" className={driverRequireStyles.valueCardImagepng} />
            </div>
            <h3 className={driverRequireStyles.valueCardTitle}>Recibe bonos de hasta S/200 semanales</h3>
            <p className={driverRequireStyles.valueCardText}>con cada viaje que realices</p>
          </div>
          <div className={driverRequireStyles.valueCard}>
            <div className={driverRequireStyles.valueCardImage}>
                 <img src="/src/assets/billetera.png" alt="billetera" className={driverRequireStyles.valueCardImagepng} />
            </div>
            <h3 className={driverRequireStyles.valueCardTitle}>Gana hasta S/3,000 al mes</h3>
            <p className={driverRequireStyles.valueCardText}>Manejando tu propia mototaxi</p>
          </div>
          <div className={driverRequireStyles.valueCard}>
            <div className={driverRequireStyles.valueCardImage}>
                 <img src="/src/assets/iconmoto.png" alt="iconmoto" className={driverRequireStyles.valueCardImagepng} />
            </div>
            <h3 className={driverRequireStyles.valueCardTitle}>No te quedes atras</h3>
            <p className={driverRequireStyles.valueCardText}>alquila una mototaxi y comienza a ganar</p>
          </div>
          <div className={driverRequireStyles.valueCard}>
            <div className={driverRequireStyles.valueCardImage}>
                 <img src="/src/assets/volarr.png" alt="volar" className={driverRequireStyles.valueCardImagepng} />
            </div>
            <h3 className={driverRequireStyles.valueCardTitle}>Empieza en unos días</h3>
            <p className={driverRequireStyles.valueCardText}>Con todos los documentos necesarios, puedes comenzar a trabajar en pocos días.</p>
          </div>
          <div className={driverRequireStyles.valueCard}>
            <div className={driverRequireStyles.valueCardImage}>
                 <img src="/src/assets/dinero.png" alt="dinero" className={driverRequireStyles.valueCardImagepng} />
            </div>
            <h3 className={driverRequireStyles.valueCardTitle}>Pagos rápidos</h3>
            <p className={driverRequireStyles.valueCardText}>El dinero se transfiere de forma inmediata a tu cuenta</p>
          </div>
          <div className={driverRequireStyles.valueCard}>
            <div className={driverRequireStyles.valueCardImage}>
                 <img src="/src/assets/horario.png" alt="horario" className={driverRequireStyles.valueCardImagepng} />
            </div>
            <h3 className={driverRequireStyles.valueCardTitle}>Crea tu propio horario</h3>
            <p className={driverRequireStyles.valueCardText}>Puedes ir a estudiar o tener otro trabajo</p>
          </div>
        </div>
      </div>
      
      <div className={driverRequireStyles.registerSection}>
        <h2 className={driverRequireStyles.registerTitle}>Cómo registrarse</h2>
        <div className={driverRequireStyles.registerGrid}>
          <div className={driverRequireStyles.registerCard}>
          <h3 className={driverRequireStyles.registerCardTitle}>1</h3>
            
            <p className={driverRequireStyles.registerCardText}>Registrate</p>
          </div>

          <div className={driverRequireStyles.registerCard}>
          <h3 className={driverRequireStyles.registerCardTitle}>2</h3>
            
            <p className={driverRequireStyles.registerCardText}>Rellena el formulario</p>
          </div>

          <div className={driverRequireStyles.registerCard}>
          <h3 className={driverRequireStyles.registerCardTitle}>3</h3>

            <p className={driverRequireStyles.registerCardText}>Sube todos los documentos necesarios</p>
          </div>

          <div className={driverRequireStyles.registerCard}>
          <h3 className={driverRequireStyles.registerCardTitle}>4</h3>
            
            <p className={driverRequireStyles.registerCardText}>Comienza a ganar</p>
          </div>
        </div>
      </div>
      <div className={driverRequireStyles.preguntasSection}>
              <h2 className={driverRequireStyles.preguntasTitle}>Preguntas frecuentes</h2>
              <div className={driverRequireStyles.preguntasContainer}>
                <div className={driverRequireStyles.preguntasGrid}>
                  {/* Columna izquierda */}
                  <div className={driverRequireStyles.preguntasColumn}>
                    {leftColumnFAQs.map((faq) => (
                      <div key={faq.id} className={driverRequireStyles.preguntasItem}>
                        <button
                          className={driverRequireStyles.preguntasButton}
                          onClick={() => toggleFAQ(faq.id)}
                        >
                          <h3 className={driverRequireStyles.preguntasQuestion}>
                            {faq.question}
                          </h3>
                          <span 
                            className={`${driverRequireStyles.preguntasIcon} ${
                              expandedFAQs.includes(faq.id) ? 'rotate-45' : ''
                            }`}
                          >
                            +
                          </span>
                        </button>
                        {expandedFAQs.includes(faq.id) && (
                          <div className={driverRequireStyles.preguntasAnswerExpanded}>
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
      
                  {/* Columna derecha */}
                  <div className={driverRequireStyles.preguntasColumn}>
                    {rightColumnFAQs.map((faq) => (
                      <div key={faq.id} className={driverRequireStyles.preguntasItem}>
                        <button
                          className={driverRequireStyles.preguntasButton}
                          onClick={() => toggleFAQ(faq.id)}
                        >
                          <h3 className={driverRequireStyles.preguntasQuestion}>
                            {faq.question}
                          </h3>
                          <span 
                            className={`${driverRequireStyles.preguntasIcon} ${
                              expandedFAQs.includes(faq.id) ? 'rotate-45' : ''
                            }`}
                          >
                            +
                          </span>
                        </button>
                        {expandedFAQs.includes(faq.id) && (
                          <div className={driverRequireStyles.preguntasAnswerExpanded}>
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección CTA Final */}
            <div className={driverRequireStyles.ctaSection}>
              <div className={driverRequireStyles.ctaContainer}>
                <h2 className={driverRequireStyles.ctaTitle}>
                  ¿Listo para empezar a ganar?
                </h2>
                <p className={driverRequireStyles.ctaDescription}>
                  Únete a miles de conductores que ya están generando ingresos con ToroGo. 
                  Regístrate hoy y comienza tu camino hacia la libertad financiera.
                </p>
                <a 
                  href="/auth?register=true" 
                  className={driverRequireStyles.ctaButton}
                >
                  Regístrate aquí
                </a>
              </div>
            </div>
    </div>     
  );
};