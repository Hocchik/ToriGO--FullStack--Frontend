import React, { useState } from 'react';
import { /* Camera, */ User, /* Phone, Mail */ MapPin, Star, /* Clock, */ CreditCard, ChevronRight } from 'lucide-react';

interface PassengerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  rating: number;
  totalTrips: number;
  memberSince: string;
  favoriteDestinations: string[];
  paymentMethod: string;
  dni: string;
}

const PassengerProfile: React.FC = () => {
  /* const [isEditing, setIsEditing] = useState(false); */
  const [profileData, setProfileData] = useState<PassengerData>({
    id: '1',
    firstName: 'Ana',
    lastName: 'García Mendoza',
    email: 'ana.garcia@email.com',
    phone: '+51 987 654 321',
    profileImage: '',
    rating: 4.8,
    totalTrips: 47,
    memberSince: 'Enero 2024',
    favoriteDestinations: ['Centro de Lima', 'Miraflores', 'San Isidro'],
    paymentMethod: 'Tarjeta Visa ****1234',
    dni: '12345678'
  });

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

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto overflow-hidden">
                    {profileData.profileImage ? (
                      <img 
                        src={profileData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <User size={48} className="text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-red-600 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-700 transition-colors">
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
            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Star className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profileData.rating}</div>
                      <div className="text-sm text-gray-500">Calificación</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profileData.totalTrips}</div>
                      <div className="text-sm text-gray-500">Viajes Totales</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      placeholder="Nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      placeholder="Apellidos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DNI</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.dni}
                        onChange={(e) => handleInputChange('dni', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 border-none rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors pr-10"
                        placeholder="12345678"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favorite Destinations */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Destinos Favoritos</h3>
                  <div className="space-y-2">
                    {profileData.favoriteDestinations.map((destination, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <MapPin className="text-gray-400" size={16} />
                          <span className="text-gray-700">{destination}</span>
                        </div>
                        <ChevronRight className="text-gray-400" size={16} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Método de Pago</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="text-gray-400" size={20} />
                      <span className="text-gray-700">{profileData.paymentMethod}</span>
                    </div>
                    <ChevronRight className="text-gray-400" size={16} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-6 flex justify-end space-x-3">
                  <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                    Cancelar
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Guardar Cambios
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

export default PassengerProfile;