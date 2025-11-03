import { useState } from 'react';

export const aboutPageStyles = {
  container: "bg-center bg-white",
  
  headerSection: "text-center mb-16 ",

  missionSection: "bg-[url('/src/assets/Acercade.png')] bg-center bg-cover grid md:grid-cols-2 gap-12 items-center mb-16 min-h-[90vh] px-8 py-16 -mt-16 pt-20",
  
  missionContent: "",
  missionTitle: "font-semibold text-white text-8xl mb-6",
  missionText: "font-semibold text-gray-100 text-2xl  mb-4 ",
  
  valueCardImage: "flex items-center space-x-2",
  valueCardImagepng: "w-20 h-20 mx-auto mb-4",
  valuesSection: "bg-gray-50 rounded-2xl p-8 mb-16",
  valuesTitle: "text-5xl font-semibold mb-8 text-center",
  valuesGrid: "grid md:grid-cols-3 gap-8 w-290 mx-auto",
  valueCard: "border border-none rounded-xl  bg-white text-center w-90 mx-auto p-10",
  valueCardTitle: "font-semibold text-xl mb-2",
  valueCardText: "font-bold text-gray-600",

  aboutusSection: "bg-white py-16 px-8 mb-4",
  aboutusContainer: "max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center",
  aboutusImageContainer: "bg-gray-200 rounded-lg h-96", 
  aboutusContent: "space-y-6",
  aboutusTitle: "text-4xl font-bold text-gray-900 mb-6",
  aboutusDescription: "text-gray-600 text-lg leading-relaxed mb-6",
  aboutusStatsList: "space-y-3 mb-8",
  aboutusStatItem: "flex items-center text-gray-700",
  aboutusStatDot: "w-2 h-2 bg-red-400 rounded-full mr-3",
  aboutusStatText: "text-lg",
  aboutusButton: "inline-block bg-red-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors",

  // Preguntas frecuentes - Nuevo estilo
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

  messageSection: "bg-white py-16 px-8",
  messageTitle: "text-4xl font-bold text-gray-900 text-center",
};

const faqData = [
  {
    id: 1,
    question: "¿Cómo funciona ToroGo?",
    answer: "ToroGo conecta a usuarios con mototaxistas verificados a través de nuestra plataforma. Solo necesitas descargar la app, registrarte y solicitar tu viaje."
  },
  {
    id: 2,
    question: "¿Es seguro usar ToroGo?",
    answer: "Sí, todos nuestros conductores son verificados y contamos con un sistema de calificaciones. Además, puedes compartir tu viaje en tiempo real con familiares y amigos."
  },
  {
    id: 3,
    question: "¿Cómo puedo contactar al soporte?",
    answer: "Puedes contactarnos a través de nuestro correo electrónico soporte@torogo.com o número de teléfono (01) 555-0123. También tenemos chat en vivo en la app."
  },
  {
    id: 4,
    question: "¿Cuáles son las tarifas de ToroGo?",
    answer: "Nuestras tarifas son competitivas y transparentes. El precio se calcula según la distancia y duración del viaje. No hay costos ocultos."
  },
  {
    id: 5,
    question: "¿Puedo programar un viaje con anticipación?",
    answer: "Sí, puedes programar viajes hasta con 24 horas de anticipación. Esta función está disponible en la sección 'Programar viaje' de la app."
  },
  {
    id: 6,
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos efectivo, tarjetas de débito/crédito, billeteras digitales como Yape y Plin. Puedes elegir tu método preferido en la app."
  }
];

export const AboutPage = () => {
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
    <div className={aboutPageStyles.container} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className={aboutPageStyles.headerSection}>

      </div>

     <div className={aboutPageStyles.missionSection}>
        <div>
          <h2 className={aboutPageStyles.missionTitle}>Viaja Seguro</h2>
          <p className={aboutPageStyles.missionText}>
            Brindar un servicio de transporte seguro, eficiente y accesible mediante 
            nuestra red de mototaxis.
          </p>
        </div>
      </div>

      <div className={aboutPageStyles.aboutusSection}>
        <div className={aboutPageStyles.aboutusContainer}>
          <div className={aboutPageStyles.aboutusImageContainer}>
            <img src="/src/assets/nosotros.png" alt="Sobre Nosotros" className="w-full h-full object-cover rounded-lg" />
          </div>

          <div className={aboutPageStyles.aboutusContent}>
            <h2 className={aboutPageStyles.aboutusTitle}>Sobre nosotros</h2>
            <p className={aboutPageStyles.aboutusDescription}>
              ToroGo es una empresa de tecnología que ofrece servicios de 
              transporte. Conectamos a usuarios 
              con mototaxistas verificados para brindar viajes seguros y confiables 
              en todos los pueblos.
            </p>
            
            <div className={aboutPageStyles.aboutusStatsList}>
              <div className={aboutPageStyles.aboutusStatItem}>
                <div className={aboutPageStyles.aboutusStatDot}></div>
                <span className={aboutPageStyles.aboutusStatText}>Más de 1000 viajes realizados</span>
              </div>
              <div className={aboutPageStyles.aboutusStatItem}>
                <div className={aboutPageStyles.aboutusStatDot}></div>
                <span className={aboutPageStyles.aboutusStatText}>Más de 500 usuarios activos</span>
              </div>
              <div className={aboutPageStyles.aboutusStatItem}>
                <div className={aboutPageStyles.aboutusStatDot}></div>
                <span className={aboutPageStyles.aboutusStatText}>Más de 50 conductores verificados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={aboutPageStyles.valuesSection}>
        <h2 className={aboutPageStyles.valuesTitle}>Descubre Nuestros Valores</h2>
        <div className={aboutPageStyles.valuesGrid}>
          <div className={aboutPageStyles.valueCard}>
            <div className={aboutPageStyles.valueCardImage}>
                 <img src="/src/assets/escudo.png" alt="escudo" className={aboutPageStyles.valueCardImagepng} />
            </div>
            <h3 className={aboutPageStyles.valueCardTitle}>Seguridad</h3>
            <p className={aboutPageStyles.valueCardText}>La seguridad de nuestros usuarios es nuestra prioridad número uno</p>
          </div>
          <div className={aboutPageStyles.valueCard}>
            <div className={aboutPageStyles.valueCardImage}>
                 <img src="/src/assets/confianza.png" alt="confianza" className={aboutPageStyles.valueCardImagepng} />
            </div>
            <h3 className={aboutPageStyles.valueCardTitle}>Confianza</h3>
            <p className={aboutPageStyles.valueCardText}>Construimos relaciones basadas en la transparencia y el respeto</p>
          </div>
          <div className={aboutPageStyles.valueCard}>
            <div className={aboutPageStyles.valueCardImage}>
                 <img src="/src/assets/innovacion.png" alt="innovacion" className={aboutPageStyles.valueCardImagepng} />
            </div>
            <h3 className={aboutPageStyles.valueCardTitle}>Innovación</h3>
            <p className={aboutPageStyles.valueCardText}>Mejoramos constantemente nuestro servicio con tecnología</p>
          </div>
          <div className={aboutPageStyles.valueCard}>
            <div className={aboutPageStyles.valueCardImage}>
                 <img src="/src/assets/eficiencia.png" alt="eficiencia" className={aboutPageStyles.valueCardImagepng} />
            </div>
            <h3 className={aboutPageStyles.valueCardTitle}>Eficiencia</h3>
            <p className={aboutPageStyles.valueCardText}>Optimizamos rutas y tiempos para brindarte el mejor servicio</p>
          </div>
          <div className={aboutPageStyles.valueCard}>
            <div className={aboutPageStyles.valueCardImage}>
                 <img src="/src/assets/compromiso.png" alt="compromiso" className={aboutPageStyles.valueCardImagepng} />
            </div>
            <h3 className={aboutPageStyles.valueCardTitle}>Compromiso</h3>
            <p className={aboutPageStyles.valueCardText}>Nos comprometemos con la calidad y excelencia en cada viaje</p>
          </div>
          <div className={aboutPageStyles.valueCard}>
            <div className={aboutPageStyles.valueCardImage}>
                 <img src="/src/assets/accesibilidad.png" alt="accesibilidad" className={aboutPageStyles.valueCardImagepng} />
            </div>
            <h3 className={aboutPageStyles.valueCardTitle}>Accesibilidad</h3>
            <p className={aboutPageStyles.valueCardText}>Ofrecemos tarifas justas y servicio accesible para toda la comunidad</p>
          </div>
        </div>
      </div>

      <div className={aboutPageStyles.preguntasSection}>
        <h2 className={aboutPageStyles.preguntasTitle}>Preguntas frecuentes</h2>
        <div className={aboutPageStyles.preguntasContainer}>
          <div className={aboutPageStyles.preguntasGrid}>
            {/* Columna izquierda */}
            <div className={aboutPageStyles.preguntasColumn}>
              {leftColumnFAQs.map((faq) => (
                <div key={faq.id} className={aboutPageStyles.preguntasItem}>
                  <button
                    className={aboutPageStyles.preguntasButton}
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <h3 className={aboutPageStyles.preguntasQuestion}>
                      {faq.question}
                    </h3>
                    <span 
                      className={`${aboutPageStyles.preguntasIcon} ${
                        expandedFAQs.includes(faq.id) ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {expandedFAQs.includes(faq.id) && (
                    <div className={aboutPageStyles.preguntasAnswerExpanded}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Columna derecha */}
            <div className={aboutPageStyles.preguntasColumn}>
              {rightColumnFAQs.map((faq) => (
                <div key={faq.id} className={aboutPageStyles.preguntasItem}>
                  <button
                    className={aboutPageStyles.preguntasButton}
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <h3 className={aboutPageStyles.preguntasQuestion}>
                      {faq.question}
                    </h3>
                    <span 
                      className={`${aboutPageStyles.preguntasIcon} ${
                        expandedFAQs.includes(faq.id) ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {expandedFAQs.includes(faq.id) && (
                    <div className={aboutPageStyles.preguntasAnswerExpanded}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={aboutPageStyles.messageSection}>
          <h2 className={aboutPageStyles.messageTitle}>Estamos aquí para usted, donde sea que se encuentre</h2>
      </div>
    </div>
  );
};