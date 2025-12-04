import React from 'react';

interface TripProgressProps {
  phase: 'toPickup' | 'toDrop' | 'completed';
  progress: number; // 0 a 1
  pickupAddress: string;
  dropAddress: string;
}

/**
 * Componente que muestra el progreso visual del viaje
 * Animación de línea y puntos que se van completando
 */
export const TripProgress: React.FC<TripProgressProps> = ({
  phase,
  progress,
  pickupAddress,
  dropAddress,
}) => {
  const phaseLabels = {
    toPickup: 'Dirigiéndose a recoger',
    toDrop: 'Dirigiéndose a destino',
    completed: 'Viaje completado',
  };

  const phaseColors = {
    toPickup: 'from-blue-500 to-green-500',
    toDrop: 'from-green-500 to-red-500',
    completed: 'from-green-500 to-gray-500',
  };

  const dotColors = {
    toPickup: { current: 'bg-blue-600', next: 'bg-green-400', done: 'bg-blue-600' },
    toDrop: { current: 'bg-green-600', next: 'bg-red-400', done: 'bg-green-600' },
    completed: { current: 'bg-green-600', next: 'bg-gray-400', done: 'bg-green-600' },
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* Encabezado */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{phaseLabels[phase]}</h3>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${phaseColors[phase]} transition-all duration-500 ease-out`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{Math.round(progress * 100)}% completado</p>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-4">
        {/* Inicio - Pickup */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full ${dotColors[phase].done} flex items-center justify-center text-white font-bold shadow-md`}>
            📍
          </div>
          <p className="text-xs font-medium text-gray-700 mt-2 max-w-[80px] text-center truncate">{pickupAddress}</p>
        </div>

        {/* Línea de progreso */}
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${phaseColors[phase]} transition-all duration-500`}
            style={{ width: phase === 'toPickup' ? `${progress * 100}%` : '100%' }}
          />
        </div>

        {/* Destino */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full ${phase === 'completed' ? dotColors[phase].done : dotColors[phase].next} flex items-center justify-center text-white font-bold shadow-md`}>
            🏁
          </div>
          <p className="text-xs font-medium text-gray-700 mt-2 max-w-[80px] text-center truncate">{dropAddress}</p>
        </div>
      </div>

      {/* Porcentaje detallado */}
      <div className="mt-4 flex justify-between text-xs text-gray-600 px-2">
        <span>Inicio</span>
        <span className="font-semibold">{Math.round(progress * 100)}%</span>
        <span>Completo</span>
      </div>
    </div>
  );
};

export default TripProgress;
