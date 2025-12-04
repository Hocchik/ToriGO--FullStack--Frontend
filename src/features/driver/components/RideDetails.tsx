import { useMemo, useState } from "react";
import type { RideRequest } from "../pages/Models";
import EnRoutePanel from "./panels/EnRoutePanel";
import WaitingPanel from "./panels/WaitingPanel";
import InTripPanel from "./panels/InTripPanel";
import FinishedPanel from "./panels/FinishedPanel";
import GoogleMapsLink from "./GoogleMapsLink";

interface Props {
  ride: RideRequest;
  onCancel: () => void;
  onArrived: () => void;
  onPaid: () => void;
}

const STATE_DEFS = {
  EN_CAMINO: { label: "En camino" },
  ESPERANDO: { label: "Esperando" },
  EN_CURSO: { label: "En curso" },
  FINALIZADO: { label: "Finalizado" },
} as const;

type TripState = keyof typeof STATE_DEFS;

export default function RideDetails({ ride, onCancel, onArrived, onPaid }: Props) {
  const [state, setState] = useState<TripState>("EN_CAMINO");

  const etaToPickup = useMemo(() => {
    const minutes = Math.max(2, Math.min(15, Math.floor((ride.pickup?.length || 0) * 0.8)));
    return `${minutes} min`;
  }, [ride.pickup]);

  const etaToDestination = useMemo(() => {
    const minutes = Math.max(
      4,
      Math.min(45, Math.floor(((ride.drop?.length || 0) + (ride.pickup?.length || 0)) * 0.7))
    );
    return `${minutes} min`;
  }, [ride.drop, ride.pickup]);

  const passenger = ride.passenger ?? { id: "", name: "Pasajero", rating: 0 };
  const fare = typeof (ride as any).price === "number" ? (ride as any).price : (ride as any).price_snapshot?.estimated_fare;
  const vehiclePlate = (ride as any).driver_info?.motorcycle?.plate ?? (ride as any).vehicle_plate ?? '';

  // Handlers advance state and call parent callbacks where applicable
  const handleArrived = () => {
    try { onArrived(); } catch {}
    setState("ESPERANDO");
  };
  const handleStartTrip = () => setState("EN_CURSO");
  const handleFinishTrip = () => {
    setState("FINALIZADO");
    // notify parent/app that trip finished
    try { window.dispatchEvent(new CustomEvent('toriGO:tripFinished')); } catch {}
  };
  const handleSubmitRating = (rating: number, comment: string) => {
    try { onPaid(); } catch {}
    window.dispatchEvent(new CustomEvent("toriGO:openRequests", { detail: { rating, comment } }));
  };

  // dispatch event when trip starts so parent can begin moving driver marker
  const handleStartTripWithEvent = () => {
    try { window.dispatchEvent(new CustomEvent('toriGO:tripStarted')); } catch {}
    handleStartTrip();
  };

  return (
    <div className="flex flex-col bg-gray-50 text-gray-800">
      {/* 1. Encabezado de Estado */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-bold">{STATE_DEFS[state].label}</h1>
      </div>

      <div className="p-3 space-y-3">
        
        {/* 2. Bloque de Información del Pasajero (Siempre visible) */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase">Pasajero</p>
            <p className="text-lg font-bold text-gray-900">{passenger.name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-800">⭐ {Number(passenger.rating || 0).toFixed(1)}</div>
            {vehiclePlate && <div className="text-xs text-gray-500">Placa: <span className="font-medium text-gray-900">{vehiclePlate}</span></div>}
          </div>
        </div>

        {/* 3. Bloque de Detalles del Viaje/Ruta con Google Maps */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Ruta y Tarifas</p>

          <div className="space-y-3">
            {/* Origen */}
            <div className="flex items-start gap-3">
              <div className="text-green-500 mt-0.5 font-bold text-lg">📍</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Origen</p>
                <p className="text-sm font-medium text-gray-900 truncate">{ride.pickup}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">ETA</p>
                <p className="text-sm font-bold text-blue-600">{etaToPickup}</p>
              </div>
            </div>

            {/* Línea de ruta */}
            <div className="flex justify-center py-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-red-400 rounded"></div>
            </div>

            {/* Destino */}
            <div className="flex items-start gap-3">
              <div className="text-red-500 mt-0.5 font-bold text-lg">🏁</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-semibold">Destino</p>
                <p className="text-sm font-medium text-gray-900 truncate">{ride.drop}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">ETA</p>
                <p className="text-sm font-bold text-blue-600">{etaToDestination}</p>
              </div>
            </div>

            {/* Tarifa */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-transparent p-3 rounded-lg">
              <div className="text-sm text-gray-600 font-semibold">💰 Tarifa estimada</div>
              <div className="text-xl font-extrabold text-green-600">{fare !== undefined ? `S/. ${fare.toFixed(2)}` : "—"}</div>
            </div>
          </div>

          {/* Google Maps Link - Solo mostrar en EN_CAMINO */}
          {state === "EN_CAMINO" && (ride.pickupCoords || ride.dropCoords) && (
            <GoogleMapsLink
              toLat={ride.pickupCoords?.lat || -12.0464}
              toLng={ride.pickupCoords?.lng || -77.0428}
              toLabel="Punto de recogida"
              className="w-full justify-center"
            />
          )}
        </div>
        
        {/* 4. Paneles de Acción por Estado */}
        {state === "EN_CAMINO" && (
          <EnRoutePanel etaToPickup={etaToPickup} onArrived={handleArrived} />
        )}

        {state === "ESPERANDO" && (
          <WaitingPanel passengerName={passenger.name} onStartTrip={handleStartTripWithEvent} />
        )}

        {state === "EN_CURSO" && (
          <InTripPanel etaToDestination={etaToDestination} onFinishTrip={handleFinishTrip} />
        )}

        {state === "FINALIZADO" && (
          <FinishedPanel
            passengerName={passenger.name}
            fare={fare ?? 0} // Usamos 0 si fare es undefined para evitar errores, asumiendo que debe ser un número en FinishedPanel
            onClose={onCancel}
            onSubmitRating={handleSubmitRating}
          />
        )}
      </div>
    </div>
  );
}