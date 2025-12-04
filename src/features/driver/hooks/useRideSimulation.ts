import React from 'react';
import type { Location } from '../utils/movementSimulator';
import { simulateMovement } from '../utils/movementSimulator';

/**
 * Hook personalizado para simular el viaje del driver
 * Maneja la animación desde pickup hasta drop
 */
export const useRideSimulation = () => {
  const [routePhase, setRoutePhase] = React.useState<'idle' | 'toPickup' | 'toDrop'>('idle');
  const [routeProgress, setRouteProgress] = React.useState(0);
  const [simSpeed, setSimSpeed] = React.useState(1);
  const cancelSimRef = React.useRef<(() => void) | null>(null);

  /**
   * Simula el movimiento hacia pickup
   */
  const startSimulationToPickup = (
    from: Location,
    to: Location,
    onProgress: (loc: Location) => void,
    onComplete: () => void
  ) => {
    if (cancelSimRef.current) cancelSimRef.current();

    setRoutePhase('toPickup');
    setRouteProgress(0);

    // Duración base: 5 segundos (escalable con simSpeed)
    const baseDuration = 5000;
    const duration = baseDuration / simSpeed;

    cancelSimRef.current = simulateMovement(from, to, duration, (loc, progress) => {
      setRouteProgress(progress);
      onProgress(loc);
    }, () => {
      setRouteProgress(1);
      onComplete();
    });
  };

  /**
   * Simula el movimiento hacia destino
   */
  const startSimulationToDestination = (
    from: Location,
    to: Location,
    onProgress: (loc: Location) => void,
    onComplete: () => void
  ) => {
    if (cancelSimRef.current) cancelSimRef.current();

    setRoutePhase('toDrop');
    setRouteProgress(0);

    // Duración base: 8 segundos para el viaje principal (más largo)
    const baseDuration = 8000;
    const duration = baseDuration / simSpeed;

    cancelSimRef.current = simulateMovement(from, to, duration, (loc, progress) => {
      setRouteProgress(progress);
      onProgress(loc);
    }, () => {
      setRouteProgress(1);
      onComplete();
    });
  };

  /**
   * Cancela la simulación en curso
   */
  const cancelSimulation = () => {
    if (cancelSimRef.current) {
      cancelSimRef.current();
      cancelSimRef.current = null;
    }
    setRoutePhase('idle');
    setRouteProgress(0);
  };

  return {
    routePhase,
    routeProgress,
    simSpeed,
    setSimSpeed,
    startSimulationToPickup,
    startSimulationToDestination,
    cancelSimulation,
  };
};
