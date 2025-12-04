import React from 'react';
import GoogleMapsLink from './GoogleMapsLink';

interface TripPhaseControlsProps {
  phase: 'toPickup' | 'toDestination' | 'completed';
  pickupAddress: string;
  dropAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  progress: number; // 0 a 1
  onPhaseNext: () => void;
  onCancel: () => void;
}

/**
 * Panel de controles que cambia según la fase del viaje
 * Proporciona instrucciones claras y botones contextuales
 */
export const TripPhaseControls: React.FC<TripPhaseControlsProps> = ({
  phase,
  pickupAddress,
  dropAddress,
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  progress,
  onPhaseNext,
  onCancel,
}) => {
  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white p-4 rounded-xl border border-blue-200 shadow-md space-y-4">
      {phase === 'toPickup' && (
        <>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-blue-900">🚗 Dirigiéndose al punto de recogida</h3>
            <p className="text-sm text-gray-700">
              Sigue las indicaciones para recoger al pasajero en:
            </p>
            <p className="text-base font-semibold text-blue-700 bg-blue-100 p-2 rounded-lg">
              📍 {pickupAddress}
            </p>
          </div>

          {/* Google Maps Link */}
          {pickupLat && pickupLng && (
            <GoogleMapsLink
              toLat={pickupLat}
              toLng={pickupLng}
              toLabel={pickupAddress}
              className="w-full justify-center"
            />
          )}

          {/* Progreso */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">PROGRESO DEL VIAJE A PICKUP</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Botón para marcar como llegado */}
          <button
            onClick={onPhaseNext}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
          >
            ✓ He llegado al punto de recogida
          </button>

          <button
            onClick={onCancel}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all text-sm"
          >
            ✕ Cancelar viaje
          </button>
        </>
      )}

      {phase === 'toDestination' && (
        <>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-green-900">🏁 Pasajero a bordo - Dirigiéndose a destino</h3>
            <p className="text-sm text-gray-700">
              Lleva al pasajero a:
            </p>
            <p className="text-base font-semibold text-green-700 bg-green-100 p-2 rounded-lg">
              🏁 {dropAddress}
            </p>
          </div>

          {/* Google Maps Link */}
          {dropLat && dropLng && (
            <GoogleMapsLink
              toLat={dropLat}
              toLng={dropLng}
              toLabel={dropAddress}
              className="w-full justify-center"
            />
          )}

          {/* Progreso */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">PROGRESO AL DESTINO</span>
              <span className="text-sm font-bold text-green-600">{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Botón para marcar como completado */}
          <button
            onClick={onPhaseNext}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
          >
            ✓ Viaje completado
          </button>

          <button
            onClick={onCancel}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all text-sm"
          >
            ✕ Cancelar viaje
          </button>
        </>
      )}

      {phase === 'completed' && (
        <>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-green-900">✅ ¡Viaje completado!</h3>
            <p className="text-sm text-gray-700">
              El pasajero ha sido entregado en:
            </p>
            <p className="text-base font-semibold text-green-700 bg-green-100 p-2 rounded-lg">
              🏁 {dropAddress}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-center text-green-800 font-semibold">
              Gracias por completar el viaje 🎉
            </p>
          </div>

          <button
            onClick={onCancel}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            ← Volver a solicitudes
          </button>
        </>
      )}
    </div>
  );
};

export default TripPhaseControls;
