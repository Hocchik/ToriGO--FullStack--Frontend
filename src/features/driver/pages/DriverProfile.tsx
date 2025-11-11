import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Star,
  MapPin,
  Calendar,
  Home,
  LogOut,
  Menu,
  Shield,
  CreditCard,
  UserCircle,
  Clock
} from 'lucide-react';
import logoNavbar from '../../../assets/logoNavbar.png';
import iconMoto from '../../../assets/iconmoto.png';

interface DriverData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  rating: number;
  totalTrips: number;
  earnings: number;
  memberSince: string;
  licenseNumber: string;
  dni: string;
  vehicleInfo: {
    type: string;
    motorCc: string;
    year: string;
    plate: string;
    color: string;
    chassisNumber: string;
  };
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseStatus: string;
  soatNumber: string;
  soatExpiryDate: string;
  soatInsurer: string;
  soatCertificate: string;
  status: 'active' | 'inactive' | 'busy';
  achievements: string[];
}

/* --- Navbar --- */
const DriverNavbar: React.FC<{ profileImage?: string; name?: string }> = ({ profileImage, name }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // limpia almacenamiento local y redirige a login
    localStorage.removeItem('token');
    // si usas redux, aquí podrías dispatch(logout())
    navigate('/auth/login');
  };

  return (
    <header className="bg-red-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
              <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src={logoNavbar} 
                alt="ToroGo Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Right: CTA + Profile */}
          <div className="flex items-center space-x-4">
            <Link
              to="/driver/request-trip"
              className="hidden sm:inline-block bg-white text-red-500 px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              INICIA TU VIAJE
            </Link>

            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-white/30 overflow-hidden flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/30 overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>
                </div>
                <span className="hidden sm:block text-sm">{name ?? 'Mi Cuenta'}</span>
                <Menu size={16} className="text-white" />
              </button>

              {/* Menú despegable */}
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
                  <nav className="py-1">
                    <Link
                      to="/driver/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Home size={16} /> Inicio
                    </Link>

                    <Link
                      to="/driver/trip-history"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Clock size={16} /> Historial de viajes
                    </Link>

                    <Link
                      to="/profile/driver"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} /> Perfil
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
/* --- Fin Navbar --- */

const DriverProfile: React.FC = () => {
  /* const [isEditing, setIsEditing] = useState(false); */
  const [profileData, setProfileData] = useState<DriverData>({
    id: '1',
    firstName: 'Carlos',
    lastName: 'Mendoza Rivera',
    email: 'carlos.mendoza@email.com',
    phone: '+51 987 123 456',
    profileImage: '',
    rating: 4.9,
    totalTrips: 342,
    earnings: 2850.50,
    memberSince: 'Marzo 2023',
    licenseNumber: 'L12345678',
    dni: '12345678',
    vehicleInfo: {
      type: 'Mototaxi',
      motorCc: '125',
      year: '2022',
      plate: '4417-SA',
      color: 'Amarillo',
      chassisNumber: 'CHS-987654'
    },
    licenseIssueDate: '2020-06-15',
    licenseExpiryDate: '2025-06-15',
    licenseStatus: 'Vigente',
    soatNumber: '120240123456789',
    soatExpiryDate: '2025-12-31',
    soatInsurer: 'RIMAC Seguros',
    soatCertificate: 'CERT-RIMAC-2024-789123',
    status: 'active',
    achievements: ['Conductor del Mes', '100 Viajes Completados', 'Excelente Servicio']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof DriverData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getField = (key: string) => {
    if (key.includes('.')) {
      const [p, c] = key.split('.');
      return (profileData as any)[p]?.[c];
    }
    return (profileData as any)[key];
  };

  const validateAll = () => {
    const required = [
      'firstName','lastName','phone','email','dni','licenseNumber',
      'vehicleInfo.type','vehicleInfo.motorCc','vehicleInfo.chassisNumber','vehicleInfo.color',
      'soatNumber','soatInsurer','soatExpiryDate','soatCertificate',
      'licenseIssueDate','licenseExpiryDate','licenseStatus'
    ];

    const newErrors: Record<string,string> = {};
    for (const k of required) {
      const v = getField(k);
      if (v === undefined || v === null || String(v).trim() === '') {
        newErrors[k] = 'Campo obligatorio';
      }
    }

    // email simple validation
    const email = getField('email') as string;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRe.test(email)) newErrors['email'] = 'Correo inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = validateAll();
    if (!ok) {
      // scroll to top of form (optional)
      const el = document.querySelector('.p-6');
      el?.scrollIntoView({ behavior: 'smooth' });
      setIsSaving(false);
      return;
    }

    try {
      // TODO: call API to save profileData
      console.log('Saving profileData', profileData);
      // simulate success
      alert('Perfil guardado correctamente');
      setErrors({});
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <DriverNavbar profileImage={profileData.profileImage} name={profileData.firstName} />

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Image and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mx-auto overflow-hidden">
                    {profileData.profileImage ? (
                      <img 
                        src={profileData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                        <User size={48} className="text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-red-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-600 transition-colors">
                    Cambiar foto de perfil
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{profileData.totalTrips}</div>
                    <div className="text-sm text-gray-500">Viajes Completados</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{profileData.rating}</div>
                    <div className="text-sm text-gray-500">Calificación</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <button className="w-full text-left text-red-600 hover:text-red-700 font-medium">
                ELIMINAR CUENTA
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Datos Personales */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <UserCircle className="mr-2 text-green-600" size={20} />
                    Datos Personales
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['firstName'] ? 'border border-red-400' : ''}`}
                      placeholder="Nombre"
                    />
                    {errors['firstName'] && <p className="text-xs text-red-600 mt-1">{errors['firstName']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['lastName'] ? 'border border-red-400' : ''}`}
                      placeholder="Apellidos"
                    />
                    {errors['lastName'] && <p className="text-xs text-red-600 mt-1">{errors['lastName']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['phone'] ? 'border border-red-400' : ''}`}
                      placeholder="Número de teléfono"
                    />
                    {errors['phone'] && <p className="text-xs text-red-600 mt-1">{errors['phone']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['email'] ? 'border border-red-400' : ''}`}
                      placeholder="correo@ejemplo.com"
                    />
                    {errors['email'] && <p className="text-xs text-red-600 mt-1">{errors['email']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.dni}
                        readOnly
                        className={`w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed pr-10 ${errors['dni'] ? 'border border-red-400' : ''}`}
                        placeholder="12345678"
                      />
                      {errors['dni'] && <p className="text-xs text-red-600 mt-1">{errors['dni']}</p>}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mototaxi Información */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <img src={iconMoto} alt="Mototaxi" className="mr-2 w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    Mototaxi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                      <input
                        type="text"
                        value={profileData.vehicleInfo.type}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                      <input
                        type="text"
                        value={profileData.vehicleInfo.plate}
                        readOnly
                        placeholder="4417-SA"
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <input
                        type="text"
                        value={profileData.vehicleInfo.color}
                        onChange={(e) => handleInputChange('vehicleInfo.color', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['vehicleInfo.color'] ? 'border border-red-400' : ''}`}
                        placeholder="Color del vehículo"
                      />
                      {errors['vehicleInfo.color'] && <p className="text-xs text-red-600 mt-1">{errors['vehicleInfo.color']}</p>}
                    </div>
                  </div>
                </div>

                {/* SOAT Información - Seguro Obligatorio de Accidentes de Tránsito (Perú) */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Shield className="mr-2 text-blue-600" size={20} />
                    SOAT
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Póliza
                      </label>
                      <input
                        type="text"
                        value={profileData.soatNumber}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                        placeholder="120240123456789"
                      />
                      <p className="text-xs text-gray-500 mt-1">Formato: 15 dígitos numéricos</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compañía Aseguradora
                      </label>
                      <select
                        value={profileData.soatInsurer}
                        onChange={(e) => handleInputChange('soatInsurer', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors ${errors['soatInsurer'] ? 'border border-red-400' : ''}`}
                      >
                        <option value="RIMAC Seguros">RIMAC Seguros</option>
                        <option value="Pacífico Seguros">Pacífico Seguros</option>
                        <option value="La Positiva Seguros">La Positiva Seguros</option>
                        <option value="Mapfre Perú">Mapfre Perú</option>
                        <option value="Interseguro">Interseguro</option>
                        <option value="Chubb Seguros">Chubb Seguros Perú</option>
                        <option value="HDI Seguros">HDI Seguros</option>
                        <option value="Crecer Seguros">Crecer Seguros</option>
                      </select>
                      {errors['soatInsurer'] && <p className="text-xs text-red-600 mt-1">{errors['soatInsurer']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de vencimiento
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={profileData.soatExpiryDate}
                          onChange={(e) => handleInputChange('soatExpiryDate', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors pr-10 ${errors['soatExpiryDate'] ? 'border border-red-400' : ''}`}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Vigencia mínima: 1 año desde la emisión</p>
                      {errors['soatExpiryDate'] && <p className="text-xs text-red-600 mt-1">{errors['soatExpiryDate']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Certificado
                      </label>
                      <input
                        type="text"
                        value={profileData.soatCertificate}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                        placeholder="CERT-RIMAC-2024-789123"
                      />
                      <p className="text-xs text-gray-500 mt-1">Certificado emitido por la aseguradora</p>
                    </div>
                  </div>
                </div>

                {/* Licencia Información */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <CreditCard className="mr-2 text-purple-600" size={20} />
                    Licencia de Conducir
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Licencia
                      </label>
                      <input
                        type="text"
                        value={profileData.licenseNumber}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-200 border-none rounded-md text-gray-600 cursor-not-allowed"
                        placeholder="L12345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de emisión
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={profileData.licenseIssueDate}
                          onChange={(e) => handleInputChange('licenseIssueDate', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors pr-10 ${errors['licenseIssueDate'] ? 'border border-red-400' : ''}`}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors['licenseIssueDate'] && <p className="text-xs text-red-600 mt-1">{errors['licenseIssueDate']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de vencimiento
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={profileData.licenseExpiryDate}
                          onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                          className={`w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors pr-10 ${errors['licenseExpiryDate'] ? 'border border-red-400' : ''}`}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                      {errors['licenseExpiryDate'] && <p className="text-xs text-red-600 mt-1">{errors['licenseExpiryDate']}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado de licencia
                      </label>
                      <select
                        value={profileData.licenseStatus}
                        onChange={(e) => handleInputChange('licenseStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                      >
                        <option value="Vigente">Vigente</option>
                        <option value="Por vencer">Por vencer</option>
                        <option value="Vencida">Vencida</option>
                        <option value="Suspendida">Suspendida</option>
                        <option value="En trámite">En trámite</option>
                        <option value="Renovación pendiente">Renovación pendiente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Acción Buttons */}
                <div className="border-t pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-red-900 text-white hover:bg-red-700'}`}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;