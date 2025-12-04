/**
 * Utilidades para simular movimiento suave del driver en el mapa
 * Interpola entre dos puntos y genera traces simulados
 */

export interface Location {
  lat: number;
  lng: number;
}

/**
 * Calcula la distancia entre dos puntos en metros usando Haversine
 */
export const calculateDistance = (from: Location, to: Location): number => {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // en metros
};

/**
 * Interpola linealmente entre dos puntos usando parámetro t [0, 1]
 */
export const interpolateLocation = (from: Location, to: Location, t: number): Location => {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
};

/**
 * Genera un array de puntos interpolados entre dos ubicaciones
 * Útil para crear traces durante el movimiento simulado
 */
export const generatePathPoints = (
  from: Location,
  to: Location,
  pointCount: number
): Location[] => {
  const points: Location[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    points.push(interpolateLocation(from, to, t));
  }
  return points;
};

/**
 * Simula el movimiento del driver con callbacks periódicos
 * Retorna una función para cancelar la simulación
 */
export const simulateMovement = (
  from: Location,
  to: Location,
  durationMs: number,
  onProgress: (location: Location, progress: number) => void,
  onComplete?: () => void
): (() => void) => {
  let startTime: number | null = null;
  let animationFrameId: number | null = null;
  let cancelled = false;

  const animate = (currentTime: number) => {
    if (startTime === null) {
      startTime = currentTime;
    }

    if (cancelled) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);

    const currentLocation = interpolateLocation(from, to, progress);
    onProgress(currentLocation, progress);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  animationFrameId = requestAnimationFrame(animate);

  // Retorna función para cancelar
  return () => {
    cancelled = true;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
};

/**
 * Calcula el tiempo estimado de viaje en base a distancia y velocidad promedio
 * velocidadPromedioKmH: velocidad promedio en km/h (default 40 para mototaxi urbano)
 */
export const estimateTravelTime = (
  distance: number,
  velocidadPromedioKmH: number = 40
): number => {
  // distancia en metros, velocidad en km/h
  const distanceKm = distance / 1000;
  const timeHours = distanceKm / velocidadPromedioKmH;
  return Math.round(timeHours * 60); // retorna minutos
};

/**
 * Genera timestamps para una lista de puntos
 * Simula el registro de GPS a intervalos regulares
 */
export const generateTraceWithTimestamps = (
  points: Location[],
  startTime: Date = new Date()
): Array<Location & { ts: string }> => {
  return points.map((point, index) => ({
    ...point,
    ts: new Date(startTime.getTime() + (index * 1000)).toISOString(), // 1 segundo entre puntos
  }));
};
