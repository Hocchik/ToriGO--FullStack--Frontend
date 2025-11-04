import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Estilos del formulario de registro de conductor
export const driverRegisterStyles = {
  // Container principal
  container: "w-full max-w-md mx-auto",
  formCard: "bg-white p-8 rounded-2xl shadow-2xl border border-gray-100",
  
  // Header
  headerContainer: "text-center mb-6",
  headerTitle: "text-2xl font-bold text-gray-800 mb-2",
  headerSubtitle: "text-gray-600 text-sm",
  
  // Form
  form: "space-y-4",
  
  // Input groups
  inputGroup: "space-y-1",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50",
  
  // Phone section
  phoneContainer: "flex",
  phoneButton: "px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-1",
  phoneButtonText: "text-sm font-medium",
  phoneDropdown: "absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto",
  phoneDropdownItem: "w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm",
  phoneInput: "flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50",
  
  // Password section
  passwordContainer: "relative",
  passwordInput: "w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50",
  passwordToggle: "absolute inset-y-0 right-0 pr-3 flex items-center",
  
  // Buttons
  primaryButton: "w-full bg-red-700 text-white py-3 px-4 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-semibold",
  buttonGroup: "flex space-x-3",
  secondaryButton: "flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-semibold",
  primaryButtonHalf: "flex-1 bg-red-700 text-white py-3 px-4 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-semibold",
  
  // Icons
  arrowIcon: "w-4 h-4 text-gray-600",
  eyeIcon: "h-5 w-5 text-gray-400"
};

// Interfaces para los datos del formulario
interface DriverFormData {
  // Step 1 - Datos del vehículo y licencia
  full_name: string;
  dni: string;
  plate: string;
  license_number: string;
  issue_date: string;
  expiration_date: string;
  soat_expiration: string;
  // Step 2 - Datos de contacto
  email: string;
  phone: string;
  password: string;
}

interface CountryCode {
  code: string;
  country: string;
}

export const DriverRegisterForm = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('+51');
  const [showPhoneCode, setShowPhoneCode] = useState(false);
  
  const countryCodes: CountryCode[] = [
    { code: '+51', country: 'Perú' },
    { code: '+52', country: 'México' },
    { code: '+56', country: 'Chile' },
    { code: '+54', country: 'Argentina' },
    { code: '+57', country: 'Colombia' },
    { code: '+34', country: 'España' },
    { code: '+1', country: 'USA' }
  ];
  
  const [formData, setFormData] = useState<DriverFormData>({
    full_name: '',
    dni: '',
    plate: '',
    license_number: '',
    issue_date: '',
    expiration_date: '',
    soat_expiration: '4SOAT',
    email: '',
    phone: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validación especial para DNI - solo números, máximo 8 dígitos
    if (name === 'dni') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    // Validación especial para Teléfono - solo números, máximo 8 dígitos
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    // Validación especial para Placa - formato ABC-123
    if (name === 'plate') {
      let plateValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (plateValue.length <= 6) {
        if (plateValue.length > 3) {
          plateValue = plateValue.slice(0, 3) + '-' + plateValue.slice(3);
        }
        setFormData(prev => ({ ...prev, [name]: plateValue }));
      }
      return;
    }
    
    // Validación especial para Licencia - formato A-1234567
    if (name === 'license_number') {
      let licenseValue = value.toUpperCase();
      
      // Permitir solo letras al inicio y números después del guión
      if (licenseValue.length === 1 && /[A-Z]/.test(licenseValue)) {
        setFormData(prev => ({ ...prev, [name]: licenseValue }));
      } else if (licenseValue.length === 2 && licenseValue[1] === '-') {
        setFormData(prev => ({ ...prev, [name]: licenseValue }));
      } else if (licenseValue.length > 2 && licenseValue.includes('-')) {
        const parts = licenseValue.split('-');
        if (parts[0].length === 1 && /[A-Z]/.test(parts[0]) && /^\d*$/.test(parts[1]) && parts[1].length <= 7) {
          setFormData(prev => ({ ...prev, [name]: licenseValue }));
        }
      }
      return;
    }
    
    // Validación especial para SOAT - mantener "4SOAT" al inicio
    if (name === 'soat_expiration') {
      if (value.startsWith('4SOAT')) {
        const additionalChars = value.slice(5);
        if (additionalChars.length <= 10) {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: '4SOAT' + value }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica del Step 1
    if (!formData.full_name || !formData.dni || !formData.plate || 
        !formData.license_number || !formData.issue_date || 
        !formData.expiration_date || !formData.soat_expiration) {
      alert('Por favor complete todos los campos del paso 1');
      return;
    }
    
    if (formData.dni.length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos');
      return;
    }
    
    if (formData.plate.length !== 7 || !formData.plate.includes('-')) {
      alert('La placa debe tener el formato ABC-123');
      return;
    }
    
    if (!formData.license_number.includes('-') || formData.license_number.length < 3) {
      alert('La licencia debe tener el formato A-1234567');
      return;
    }
    
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica del Step 2
    if (!formData.email || !formData.phone || !formData.password) {
      alert('Por favor complete todos los campos del paso 2');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Aquí enviarías todos los datos del formulario
    console.log('Datos completos del conductor:', formData);
    alert('Registro de conductor completado exitosamente');
  };

  const goBackToStep1 = () => {
    setStep(1);
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setShowPhoneCode(false);
  };

  if (step === 1) {
    return (
      <div className={driverRegisterStyles.container}>
        <div className={driverRegisterStyles.formCard}>
          <div className={driverRegisterStyles.headerContainer}>
            <h2 className={driverRegisterStyles.headerTitle} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Datos del Conductor
            </h2>
            <p className={driverRegisterStyles.headerSubtitle}>Paso 1 de 2</p>
          </div>

          <form onSubmit={handleStep1Submit} className={driverRegisterStyles.form}>
            {/* Nombre Completo */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Nombre Completo
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                required
              />
            </div>

            {/* DNI */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                DNI
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                placeholder="12345678"
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                maxLength={8}
                required
              />
            </div>

            {/* Placa */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Placa
              </label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleInputChange}
                placeholder="ABC-123"
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                maxLength={7}
                required
              />
            </div>

            {/* Licencia */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Licencia
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                placeholder="A-1234567"
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                maxLength={9}
                required
              />
            </div>

            {/* Fecha Emisión */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Fecha Emisión
              </label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                required
              />
            </div>

            {/* Fecha Expiración */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Fecha Expiración
              </label>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                required
              />
            </div>

            {/* SOAT */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                SOAT: Expiración
              </label>
              <input
                type="text"
                name="soat_expiration"
                value={formData.soat_expiration}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                maxLength={15}
                required
              />
            </div>

            <button
              type="submit"
              className={driverRegisterStyles.primaryButton}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Siguiente Paso →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2 - Datos de contacto
  return (
    <div className={driverRegisterStyles.container}>
      <div className={driverRegisterStyles.formCard}>
        <div className={driverRegisterStyles.headerContainer}>
          <h2 className={driverRegisterStyles.headerTitle} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Información de Contacto
          </h2>
          <p className={driverRegisterStyles.headerSubtitle}>Paso 2 de 2</p>
        </div>

        <form onSubmit={handleStep2Submit} className={driverRegisterStyles.form}>
          {/* Email */}
          <div className={driverRegisterStyles.inputGroup}>
            <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={driverRegisterStyles.input}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              required
            />
          </div>

          {/* Teléfono con selector de país */}
          <div className={driverRegisterStyles.inputGroup}>
            <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Teléfono
            </label>
            <div className={driverRegisterStyles.phoneContainer}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPhoneCode(!showPhoneCode)}
                  className={driverRegisterStyles.phoneButton}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <span className={driverRegisterStyles.phoneButtonText}>{selectedCountry}</span>
                  <svg className={driverRegisterStyles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showPhoneCode && (
                  <div className={driverRegisterStyles.phoneDropdown}>
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country.code)}
                        className={driverRegisterStyles.phoneDropdownItem}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <span className="font-medium">{country.code}</span> {country.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={driverRegisterStyles.phoneInput}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                placeholder="98765432"
                maxLength={8}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={driverRegisterStyles.inputGroup}>
            <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Contraseña
            </label>
            <div className={driverRegisterStyles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={driverRegisterStyles.passwordInput}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={driverRegisterStyles.passwordToggle}
              >
                {showPassword ? (
                  <EyeOff className={driverRegisterStyles.eyeIcon} />
                ) : (
                  <Eye className={driverRegisterStyles.eyeIcon} />
                )}
              </button>
            </div>
          </div>

          <div className={driverRegisterStyles.buttonGroup}>
            <button
              type="button"
              onClick={goBackToStep1}
              className={driverRegisterStyles.secondaryButton}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              ← Atrás
            </button>
            
            <button
              type="submit"
              className={driverRegisterStyles.primaryButtonHalf}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Registrar Conductor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};