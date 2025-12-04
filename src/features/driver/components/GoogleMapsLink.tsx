import React, { useEffect, useState } from 'react';

interface GoogleMapsLinkProps {
  fromLat?: number;
  fromLng?: number;
  toLat: number;
  toLng: number;
  toLabel?: string;
  fromLabel?: string;
  className?: string;
}

/**
 * Componente que genera un link a Google Maps con ruta desde ubicación actual
 * Si no hay ubicación actual (desktop), usa Lima, Perú como default
 * Al hacer click, abre Google Maps en nueva pestaña con la ruta
 */
export const GoogleMapsLink: React.FC<GoogleMapsLinkProps> = ({
  fromLat,
  fromLng,
  toLat,
  toLng,
  toLabel = 'Destino',
  fromLabel = 'Mi ubicación',
  className = ''
}) => {
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Lima, Perú como ubicación default (plaza mayor)
  const LIMA_DEFAULT = { lat: -12.0464, lng: -77.0428 };

  useEffect(() => {
    const getLocation = () => {
      // Si se proporcionan coordenadas explícitamente, usarlas
      if (fromLat !== undefined && fromLng !== undefined) {
        setFromCoords({ lat: fromLat, lng: fromLng });
        setLoading(false);
        return;
      }

      // Intentar obtener ubicación del dispositivo
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFromCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLoading(false);
          },
          () => {
            // Si falla, usar Lima como default
            setFromCoords(LIMA_DEFAULT);
            setLoading(false);
          },
          { timeout: 5000 }
        );
      } else {
        // Si geolocation no está disponible, usar Lima
        setFromCoords(LIMA_DEFAULT);
        setLoading(false);
      }
    };

    getLocation();
  }, [fromLat, fromLng]);

  const handleOpenGoogleMaps = () => {
    if (!fromCoords) return;

    // URL de Google Maps con ruta
    const url = `https://www.google.com/maps/dir/?api=1&origin=${fromCoords.lat},${fromCoords.lng}&destination=${toLat},${toLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium opacity-50 cursor-not-allowed ${className}`}
      >
        Cargando ubicación...
      </button>
    );
  }

  return (
    <button
      onClick={handleOpenGoogleMaps}
      className={`
        flex items-center gap-2
        px-4 py-3
        bg-gradient-to-r from-blue-600 to-blue-700
        text-white
        rounded-xl
        font-bold
        hover:from-blue-700 hover:to-blue-800
        transition-all duration-300
        shadow-lg hover:shadow-xl
        active:scale-95
        ${className}
      `}
      title={`Ver ruta en Google Maps: desde ${fromLabel} hasta ${toLabel}`}
    >
      <span className="text-lg">🗺️</span>
      <span>Ver ruta en Google Maps</span>
    </button>
  );
};

export default GoogleMapsLink;
