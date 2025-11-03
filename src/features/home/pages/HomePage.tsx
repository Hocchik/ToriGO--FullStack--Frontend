import { Link } from 'react-router-dom';
import { useState } from 'react';

 const homePageStyles = {
  container: "",
  
  heroSection: "relative h-screen bg-gradient-to-r from-black to-red-500 ",
  heroContainer: "max-w-7xl mx-auto px-4 h-full flex items-center justify-between",
  
  heroContent: "text-white space-y-6 max-w-xl",
  heroTitle: "text-6xl font-bold",
  heroSubtitle: "text-2xl",
  heroButtonsContainer: "space-y-4",
  heroPrimaryButton: "bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 inline-block w-full text-center",
  heroDriverText: "text-sm text-white/80",
  heroDriverLink: "underline",
  
 
  appPreview: "hidden lg:block w-1/2 max-w-lg",
  appPreviewCard: "bg-white rounded-3xl p-8 shadow-2xl",
  appPreviewTitle: "text-gray-900 text-2xl font-bold mb-6",
  appPreviewSubtitle: "text-gray-600 text-sm mb-8",
  

  tripForm: "space-y-4 mb-8",
  inputGroup: "relative",
  inputIcon: "absolute left-4 top-1/2 transform -translate-y-1/2 z-10",
  locationIcon: "w-3 h-3 bg-gray-400 rounded-full",
  destinationIcon: "w-3 h-3 bg-gray-800 rounded-sm",
  input: "w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200",
  inputFocused: "ring-2 ring-orange-400 border-transparent",
  

  connector: "flex justify-center my-2",
  connectorLine: "w-px h-4 bg-gray-300",
  

  buttonGroup: "",
  primaryButton: "w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200",
  
  featuresSection: "py-20 bg-white",
  featuresContainer: "max-w-7xl mx-auto px-4",
  featuresTitle: "text-3xl font-bold text-center mb-12",
  

  RideSection: "grid md:grid-cols-2 gap-12 items-center",


  motoImageContainer: "max-w-lg mx-auto",
  motoImage: "w-full h-auto rounded-3xl shadow-lg",

 
  groupRideContent: "space-y-6",
  groupRideTitle: "text-4xl font-bold text-gray-900 mb-4",
  groupRideDescription: "text-gray-600 text-lg leading-relaxed mb-6",
};

export const HomePage = () => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <div className={homePageStyles.container} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Hero Section with Service Request */}
      <section className={homePageStyles.heroSection}>
        <div className={homePageStyles.heroContainer}>
          {/* Left side - Hero Content */}
          <div className={homePageStyles.heroContent}>
            <h1 className={homePageStyles.heroTitle}>ToriGo!</h1>
            <p className={homePageStyles.heroSubtitle}>Viaja seguro en mototaxi por cualquier lugar</p>
            <div className={homePageStyles.heroButtonsContainer}>
              <Link 
                to="/auth"
                className={homePageStyles.heroPrimaryButton}
              >
                Pedir Mototaxi
              </Link>
              <p className={homePageStyles.heroDriverText}>
                ¿Eres conductor? <Link to="/auth?type=driver" className={homePageStyles.heroDriverLink}>Únete aquí</Link>
              </p>
            </div>
          </div>

          {/* Right side - App Preview Mejorado */}
          <div className={homePageStyles.appPreview}>
            <div className={homePageStyles.appPreviewCard}>
              <h3 className={homePageStyles.appPreviewTitle}>
                Solicita un viaje para ahora o más tarde
              </h3>
              <p className={homePageStyles.appPreviewSubtitle}>
                Agrega los detalles de tu viaje, súbete y ve a tu destino.
              </p>
              
              <div className={homePageStyles.tripForm}>
                {/* Input Ubicación */}
                <div className={homePageStyles.inputGroup}>
                  <div className={homePageStyles.inputIcon}>
                    <div className={homePageStyles.locationIcon}></div>
                  </div>
                  <input
                    type="text"
                    placeholder="Ingresa una ubicación"
                    className={`${homePageStyles.input} ${
                      focusedInput === 'location' ? homePageStyles.inputFocused : ''
                    }`}
                    onFocus={() => setFocusedInput('location')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {focusedInput === 'location' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Conector */}
                <div className={homePageStyles.connector}>
                  <div className={homePageStyles.connectorLine}></div>
                </div>

                {/* Input Destino */}
                <div className={homePageStyles.inputGroup}>
                  <div className={homePageStyles.inputIcon}>
                    <div className={homePageStyles.destinationIcon}></div>
                  </div>
                  <input
                    type="text"
                    placeholder="Ingresa un destino"
                    className={`${homePageStyles.input} ${
                      focusedInput === 'destination' ? homePageStyles.inputFocused : ''
                    }`}
                    onFocus={() => setFocusedInput('destination')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>
              </div>

              <div className={homePageStyles.buttonGroup}>
                <Link 
                  to="/service/passenger"
                  className={homePageStyles.primaryButton}
                >
                  Comenzar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={homePageStyles.featuresSection}>
        <div className={homePageStyles.featuresContainer}>
          <h2 className={homePageStyles.featuresTitle}>¿Por qué elegir ToroGo?</h2>
          

          <div className={homePageStyles.RideSection}>

            <div className={homePageStyles.motoImageContainer}>
              <img 
                src="/src/assets/mototaxi.jpg" 
                alt="mototaxi" 
                className={homePageStyles.motoImage}
              />
            </div>


            <div className={homePageStyles.groupRideContent}>
              <h3 className={homePageStyles.groupRideTitle}>
                Viaja sin interrupciones
              </h3>
              <p className={homePageStyles.groupRideDescription}>
                Viajar ahora es más fácil: Establece un viaje 
                en la app de ToroGo y llega a tu destino.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};