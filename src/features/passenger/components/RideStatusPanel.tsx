// features/passenger/components/RideStatusPanel.tsx
import type { RideRequest } from "../../../types/trip";

export default function RideStatusPanel({
  ride,
  accepted,
  onCancel,
}: {
  ride: RideRequest;
  accepted: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="w-[350px] bg-white p-4 border-r shadow-lg flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Estado del viaje</h2>
      <p><strong>Origen:</strong> {ride.pickup}</p>
      <p><strong>Destino:</strong> {ride.destination}</p>
      <p><strong>Tipo:</strong> {ride.type}</p>
      <p><strong>Pago:</strong> {ride.payment}</p>
      <p className="text-green-600 font-semibold">
        {accepted ? "Mototaxi en camino 🚕" : "Esperando confirmación..."}
      </p>
      <button
        onClick={onCancel}
        className="bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition"
      >
        Cancelar viaje
      </button>
    </div>
  );
}