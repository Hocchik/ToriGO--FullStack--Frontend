import { useEffect, useState } from "react";
import type { RideRequest } from "../pages/Models";

interface Props {
  requests: RideRequest[];
  onAccept: (ride: RideRequest) => void;
  onExpire: (rideId: string) => void;
}

export default function RideNotificationQueue({ requests, onAccept, onExpire }: Props) {
  const [current, setCurrent] = useState<RideRequest | null>(null);
  /* const [queue, setQueue] = useState<RideRequest[]>([]); */

  useEffect(() => {
    if (!current && requests.length > 0) {
      setCurrent(requests[0]);
      /* setQueue(requests.slice(1)); */
    }
  }, [requests, current]);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      onExpire(current.id);
      setCurrent(null);
    }, 8000);

    return () => clearTimeout(timer);
  }, [current, onExpire]);

  const handleAccept = () => {
    if (current) {
      onAccept(current);
      setCurrent(null);
    }
  };

  return current ? (
      <div 
  className="
    fixed bottom-4 left-1/2 -translate-x-1/2 z-50 
    w-[95%] max-w-sm 
    bg-white 
    border border-red-300 
    rounded-2xl 
    p-5 
    animate-fade-in
  "
>
  {/* Fila 1: Nombre del Pasajero y Rating (Símbolo de Usuario Cambiado) */}
  <div className="flex justify-between items-center mb-3 pb-2 border-b border-red-100">
    
    {/* Nombre del Pasajero como Título (Cambiado de 👤 a 🧑) */}
    <h3 className="text-xl font-extrabold text-black-700 flex items-center">
       {current.passenger.name}
    </h3>
    
    {/* Rating del pasajero */}
    <span className="text-lg font-bold text-gray-600 bg-red-50 px-2 py-0.5 rounded-full">
        ⭐ {current.passenger.rating.toFixed(1)}
    </span>
  </div>

  {/* Fila 2: Detalles del Viaje (Origen, Destino, Tarifa) */}
  <div className="text-sm text-gray-700 space-y-2">
    
    {/* Origen */}
    <p className="flex justify-between">
      <strong className="text-gray-900 flex items-center">📍 Origen:</strong>
      <span className="font-medium truncate ml-2">{current.pickup}</span>
    </p>
    
    {/* Destino */}
    <p className="flex justify-between">
      <strong className="text-gray-900 flex items-center">🏁 Destino:</strong>
      <span className="font-medium truncate ml-2">{current.drop}</span>
    </p>

    {/* Tarifa destacada (Símbolo de dinero quitado) */}
    <div className="flex justify-between items-center pt-2 border-t border-dashed border-red-200">
        <p className="font-extrabold text-xl text-red-700 flex items-center">
            Tarifa:
        </p>
        <p className="font-extrabold text-xl text-red-700">
            S/. {current.price.toFixed(2)}
        </p>
    </div>
  </div>

  {/* Botón de Acción */}
  <button
    onClick={handleAccept}
    className="
      mt-4 w-full 
      bg-green-600 text-white text-lg 
      py-3 rounded-xl 
      font-bold uppercase tracking-wider 
      hover:bg-green-700 transition-all
      shadow-lg shadow-green-500/50
    "
  >
    Aceptar Viaje
  </button>
</div>
  ) : null;
}