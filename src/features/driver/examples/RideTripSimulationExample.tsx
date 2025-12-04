/**
 * EJEMPLO COMPLETO DE INTEGRACIÓN
 * Muestra cómo usar todos los componentes nuevos en conjunto
 * Copiar esta lógica en DriverPage.tsx para integración total
 */

import React, { useEffect } from 'react';
import { useRideSimulation } from '../hooks/useRideSimulation';
import type { RideRequest } from '../pages/Models';
import TripProgress from '../components/TripProgress';
import TripPhaseControls from '../components/TripPhaseControls';
import DriverMap from '../../../components/DriverMap';
import TripService from '../../../services/TripService';

interface RideTripSimulationExampleProps {
  ride: RideRequest;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * EJEMPLO: Componente que maneja el flujo completo del viaje simulado
 * Usar esta estructura como referencia para DriverPage.tsx
 */
export const RideTripSimulationExample: React.FC<RideTripSimulationExampleProps> = ({
  ride,
  onComplete,
  onCancel,
}) => {
  // Estado de simulación
  const {
    routePhase,
    routeProgress,
    simSpeed,
    setSimSpeed,
    startSimulationToPickup,
    startSimulationToDestination,
    cancelSimulation,
  } = useRideSimulation();

  // Ubicación del driver (iniciar en Lima si no hay GPS)
  const [driverLocation, setDriverLocation] = React.useState({
    lat: -12.0464,
    lng: -77.0428,
  });

  // Buffer de traces para enviar al backend
  const traceBufferRef = React.useRef<Array<{ lat: number; lng: number; ts: string }>>([]);

  // Pickup y drop coords (con defaults)
  const pickupCoords = ride.pickupCoords || { lat: -12.0464, lng: -77.0428 };
  const dropCoords = ride.dropCoords || { lat: -12.0465, lng: -77.0429 };

  /**
   * Efecto: Inicia la simulación automáticamente al montar el componente
   * (Cuando el driver acepta el viaje)
   */
  useEffect(() => {
    // Iniciar simulación hacia pickup
    startSimulationToPickup(
      driverLocation,
      pickupCoords,
      (newLocation) => {
        setDriverLocation(newLocation);
        // Guardar punto en trace
        traceBufferRef.current.push({
          lat: newLocation.lat,
          lng: newLocation.lng,
          ts: new Date().toISOString(),
        });
      },
      () => {
        // Callback cuando llega a pickup
        console.log('✅ Driver llegó a pickup');
      }
    );

    // Cleanup: cancelar simulación al desmontar
    return () => {
      cancelSimulation();
    };
  }, []);

  /**
   * Cuando el driver confirma que recogió al pasajero
   */
  const handleConfirmPickup = () => {
    // Transición a simulación hacia destino
    startSimulationToDestination(
      pickupCoords, // Desde el punto de pickup
      dropCoords,   // Hacia el destino
      (newLocation) => {
        setDriverLocation(newLocation);
        traceBufferRef.current.push({
          lat: newLocation.lat,
          lng: newLocation.lng,
          ts: new Date().toISOString(),
        });
      },
      () => {
        console.log('✅ Driver llegó a destino');
      }
    );
  };

  /**
   * Cuando el driver completa el viaje
   */
  const handleCompleteTrip = async () => {
    try {
      // Guardar traces en backend
      if (traceBufferRef.current.length > 0) {
        console.log(`📍 Enviando ${traceBufferRef.current.length} puntos de ruta`);
        await TripService.appendTrace(ride.id, traceBufferRef.current);
      }

      // Marcar viaje como completado
      await TripService.upsertTrip({
        external_id: ride.id,
        status: 'completed',
      });
      console.log('✅ Viaje completado en backend');

      onComplete();
    } catch (e) {
      console.error('Error al completar viaje:', e);
      alert('Error al completar el viaje');
    }
  };

  /**
   * Cancelar el viaje en curso
   */
  const handleCancelTrip = async () => {
    try {
      cancelSimulation();
      await TripService.upsertTrip({
        external_id: ride.id,
        status: 'canceled',
      });
      console.log('🚫 Viaje cancelado');
      onCancel();
    } catch (e) {
      console.error('Error al cancelar viaje:', e);
    }
  };

  // Determinar fase para componentes
  const controlPhase =
    routePhase === 'toPickup'
      ? 'toPickup'
      : routePhase === 'toDrop'
        ? 'toDestination'
        : 'completed';

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50">
      {/* 1. MAPA CON ANIMACIÓN */}
      <div className="flex-1 rounded-xl overflow-hidden shadow-lg">
        <DriverMap
          origin={pickupCoords}
          destination={dropCoords}
          driverLocation={driverLocation}
          showRoute={true}
          showMarkers={true}
          expandResolutionMeters={8}
        />
      </div>

      {/* 2. BARRA DE PROGRESO VISUAL */}
      <div className="shadow-md rounded-xl">
        <TripProgress
          phase={routePhase === 'toPickup' ? 'toPickup' : routePhase === 'toDrop' ? 'toDrop' : 'completed'}
          progress={routeProgress}
          pickupAddress={ride.pickup}
          dropAddress={ride.drop}
        />
      </div>

      {/* 3. PANEL DE CONTROLES CONTEXTUALES */}
      <div className="shadow-md">
        <TripPhaseControls
          phase={controlPhase}
          pickupAddress={ride.pickup}
          dropAddress={ride.drop}
          pickupLat={pickupCoords.lat}
          pickupLng={pickupCoords.lng}
          dropLat={dropCoords.lat}
          dropLng={dropCoords.lng}
          progress={routeProgress}
          onPhaseNext={
            routePhase === 'toPickup'
              ? handleConfirmPickup
              : routePhase === 'toDrop'
                ? handleCompleteTrip
                : onCancel
          }
          onCancel={handleCancelTrip}
        />
      </div>

      {/* 4. CONTROLES DE VELOCIDAD (SOLO DEV) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-white p-3 rounded-lg border border-yellow-300 text-sm space-y-2">
          <p className="font-bold text-yellow-700">⚙️ Controles de Desarrollo</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSimSpeed(0.5)}
              className={`px-3 py-1 rounded ${simSpeed === 0.5 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              Lento (0.5x)
            </button>
            <button
              onClick={() => setSimSpeed(1)}
              className={`px-3 py-1 rounded ${simSpeed === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              Normal (1x)
            </button>
            <button
              onClick={() => setSimSpeed(2)}
              className={`px-3 py-1 rounded ${simSpeed === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              Rápido (2x)
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Fase: {routePhase} | Progreso: {Math.round(routeProgress * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default RideTripSimulationExample;
