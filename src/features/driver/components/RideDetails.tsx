import { useMemo, useState } from "react";
import type { RideRequest } from "../pages/Models";
import EnRoutePanel from "./panels/EnRoutePanel";
import WaitingPanel from "./panels/WaitingPanel";
import InTripPanel from "./panels/InTripPanel";
import FinishedPanel from "./panels/FinishedPanel";

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
  const fare = typeof (ride as any).price === "number" ? (ride as any).price : undefined;

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
          </div>
        </div>

        {/* 3. Bloque de Detalles del Viaje/Ruta (¡Reubicado aquí!) */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 uppercase mb-3">Ruta y Tarifas</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-green-500 mt-0.5 font-bold text-base">🟢</div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Origen</p>
                <p className="text-sm font-medium text-gray-900">{ride.pickup}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">ETA</p>
                <p className="text-sm font-medium text-gray-700">{etaToPickup}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-red-500 mt-0.5 font-bold text-base">🏁</div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Destino</p>
                <p className="text-sm font-medium text-gray-900">{ride.drop}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">ETA</p>
                <p className="text-sm font-medium text-gray-700">{etaToDestination}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500 font-semibold">Tarifa estimada</div>
              <div className="text-lg font-extrabold text-gray-900">{fare !== undefined ? `$${fare.toFixed(2)}` : "—"}</div>
            </div>
          </div>
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