import React, { useState } from 'react';
import { useDispatch, /* useSelector */ } from 'react-redux';
import { authService } from '../../../services/AuthService';
import { registerDriver } from '../authSlice';
import { Eye, EyeOff } from 'lucide-react';
import type { registerDriverRequest } from '../../../types/auth';

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

interface CountryCode {
  code: string;
  country: string;
}

export const DriverRegisterForm = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('+51');
  const [showPhoneCode, setShowPhoneCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countryCodes: CountryCode[] = [
    { code: '+51', country: 'Perú' },
    { code: '+52', country: 'México' },
    { code: '+56', country: 'Chile' },
    { code: '+54', country: 'Argentina' },
    { code: '+57', country: 'Colombia' },
    { code: '+34', country: 'España' },
    { code: '+1', country: 'USA' }
  ];
  const [formData, setFormData] = useState<registerDriverRequest>({
    name: '',
    last_name: '',
    dni: '',
    plate: '',
    license_number: '',
    license_expiration_date: '',
    insurance_policy_number: 'SOAT-',
    insurance_policy_expiration_date: '',
    email: '',
    phone: '',
    password: '',
    role: 'DRIVER'
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
      if (numericValue.length === 9) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    // Validación especial para Placa - formato ABC-123
    if (name === 'plate') {
      let raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const letters = raw.replace(/[^A-Z]/g, '').slice(0, 2);
      const numbers = raw.replace(/[^0-9]/g, '').slice(0, 4);
      let plateValue = letters;
      if (numbers.length > 0) {
        plateValue += '-' + numbers;
      }
      // Solo permitir formato XX-1234
      if (plateValue.length <= 7) {
        setFormData(prev => ({ ...prev, [name]: plateValue }));
      }
      return;
    }
    
    // Validación especial para Licencia - formato A-1234567
    if (name === 'license_number') {
      // Permitir que el usuario escriba cualquier valor, pero solo guardar si cumple el formato
      /* let licenseValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ''); */
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }
  
    // Validación especial para SOAT - mantener "SOAT" al inicio
    if (name === 'insurance_policy_number') {
      let soatValue = value.replace(/[^A-Z0-9-]/gi, '');
      setFormData(prev => ({ ...prev, [name]: 'SOAT-' + soatValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validación básica del Step 1
    if (!formData.name || !formData.last_name || !formData.dni || 
        !formData.plate || !formData.license_number || 
        !formData.license_expiration_date || 
        !formData.insurance_policy_number || 
        !formData.insurance_policy_expiration_date) {
      setError('Por favor complete todos los campos del paso 1');
      console.error('Por favor complete todos los campos del paso 1');
      return;
    }
    // Validar nombres y apellidos (máximo 3 palabras)
    if (formData.name.trim().split(' ').length > 3) {
      setError('Máximo 3 nombres permitidos');
      console.error('Máximo 3 nombres permitidos');
      return;
    }
    if (formData.last_name.trim().split(' ').length > 3) {
      setError('Máximo 3 apellidos permitidos');
      console.error('Máximo 3 apellidos permitidos');
      return;
    }
    if (formData.dni.length !== 8) {
      setError('El DNI debe tener exactamente 8 dígitos');
      console.error('El DNI debe tener exactamente 8 dígitos');
      return;
    }
    if (formData.plate.length !== 7 || !formData.plate.includes('-')) {
      setError('La placa debe tener el formato XX-1234');
      console.error('La placa debe tener el formato XX-1234');
      return;
    }
    // Validar licencia: debe empezar con A o B y tener 9 caracteres (1 letra + 8 números)
    if (!/^[AB][0-9]{8}$/.test(formData.license_number)) {
      setError('La licencia debe tener el formato A12345678 o B12345678');
      console.error('La licencia debe tener el formato A12345678 o B12345678');
      return;
    }
    if (!formData.insurance_policy_number.startsWith('SOAT-')) {
      setError('El SOAT debe comenzar con "SOAT-"');
      console.error('El SOAT debe comenzar con "SOAT-"');
      return;
    }
    // Verificación con backend usando AuthService (separado)
    try {
      // Verificar Licencia
      const licenseRes = await authService.verifyLicense({
        license_number: formData.license_number,
        license_expiration_date: formData.license_expiration_date,
        name: formData.name.split(' ')[0],
        last_name: formData.last_name.split(' ')[0]
      });
      if (!licenseRes.valid) {
        setError(licenseRes.error || 'Licencia inválida o no existe');
        console.error(licenseRes.error || 'Licencia inválida o no existe');
        return;
      }
      // Verificar SOAT
      const soatRes = await authService.verifySoat({
        insurance_policy_number: formData.insurance_policy_number,
        insurance_policy_expiration_date: formData.insurance_policy_expiration_date,
        plate: formData.plate
      });
      if (!soatRes.valid) {
        setError(soatRes.error || 'SOAT inválido o no existe');
        console.error(soatRes.error || 'SOAT inválido o no existe');
        return;
      }
    } catch (err) {
      setError('Error al verificar licencia/SOAT. Intente nuevamente.');
      console.error('Error al verificar licencia/SOAT. Intente nuevamente.', err);
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validación básica del Step 2
    if (!formData.email || !formData.phone || !formData.password) {
      setError('Por favor complete todos los campos del paso 2');
      console.error('Por favor complete todos los campos del paso 2');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      console.error('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    try {
      // Formatear el teléfono antes de enviar
      let phone = formData.phone;
      if (selectedCountry === '+51') {
        if (!phone.startsWith('+51 ')) {
          phone = `+51 ${phone}`;
        }
      } else {
        if (!phone.startsWith(selectedCountry)) {
          phone = `${selectedCountry} ${phone}`;
        }
      }
      const payload = { ...formData, phone };
      // @ts-ignore
      const resultAction = await dispatch(registerDriver(payload));
      if (resultAction.payload && !resultAction.error) {
        // Login automático después del registro
        let emailorphone = payload.phone.trim();
        // Si es solo números, prepende '+51 '
        if (/^\d{9}$/.test(payload.phone)) {
          emailorphone = `+51 ${payload.phone}`;
        }
        // @ts-ignore
        const loginResult = await dispatch(loginUser({ emailorphone, password: payload.password }));
        if (loginResult.payload && !loginResult.error) {
          window.location.href = '/'; // Redirigir a la página principal
        } else {
          const loginError = typeof loginResult.payload === 'string' ? loginResult.payload : 'Error al iniciar sesión';
          setError(loginError);
          console.error(loginError);
        }
      } else {
        const errorMsg = typeof resultAction.payload === 'string' ? resultAction.payload : 'Error al registrar conductor';
        setError(errorMsg);
        console.error(errorMsg);
      }
    } catch (err) {
      setError('Error inesperado al registrar conductor');
      console.error('Error inesperado al registrar conductor', err);
    }
    setLoading(false);
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
          {error && (
            <div style={{ color: 'red', marginBottom: 8, fontWeight: 'bold' }}>{error}</div>
          )}
          <form onSubmit={handleStep1Submit} className={driverRegisterStyles.form}>
            {/* Nombres */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Nombres
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                required
              />
            </div>
            {/* Apellidos */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Apellidos
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
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
                placeholder="AB-3123"
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
                placeholder="A1234567"
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                maxLength={9}
                required
              />
            </div>
            {/* Fecha Emisión */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Fecha de Expiración (Licencia)
              </label>
              <input
                type="date"
                name="license_expiration_date"
                value={formData.license_expiration_date}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                required
              />
            </div>
            {/* SOAT */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                SOAT Código
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value="SOAT-"
                  disabled
                  style={{
                    width: '70px',
                    background: '#f3f4f6',
                    color: '#888',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontFamily: 'Montserrat, sans-serif',
                    border: '1px solid #d1d5db',
                    textAlign: 'center'
                  }}
                />
                <input
                  type="text"
                  name="insurance_policy_number"
                  value={formData.insurance_policy_number.replace('SOAT-', '')}
                  onChange={e => handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: 'insurance_policy_number',
                      value: e.target.value
                    }
                  })}
                  className={driverRegisterStyles.input}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                  }}
                  maxLength={15}
                  required
                  placeholder="NR-1357-2025"
                />
              </div>
            </div>
            {/* Fecha Expiración */}
            <div className={driverRegisterStyles.inputGroup}>
              <label className={driverRegisterStyles.label} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Fecha de Expiración (SOAT)
              </label>
              <input
                type="date"
                name="insurance_policy_expiration_date"
                value={formData.insurance_policy_expiration_date}
                onChange={handleInputChange}
                className={driverRegisterStyles.input}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
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
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {loading && <div style={{ color: 'gray', marginBottom: 8 }}>Registrando...</div>}
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
                placeholder="987654321"
                maxLength={9}
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