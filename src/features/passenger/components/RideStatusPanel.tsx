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
      <p><strong>Destino:</strong> {ride.destination ?? '—'}</p>
      <p><strong>Tipo:</strong> {ride.type}</p>
      <p><strong>Pago:</strong> {ride.payment}</p>

      {/* Driver info injected by backend as `driver_info: { user, driver, motorcycle }` */}
      { (ride as any).driver_info && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500">Conductor asignado</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="font-semibold text-gray-900">{(ride as any).driver_info.user?.name ?? ((ride as any).driver_info.user?.email ?? 'Conductor')}</p>
              <p className="text-sm text-gray-600">⭐ {(Number((ride as any).driver_info.driver?.rating) || 0).toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Placa</p>
              <p className="font-semibold text-gray-900">{(ride as any).driver_info.motorcycle?.plate ?? '—'}</p>
            </div>
          </div>
        </div>
      )}
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