export default function ConfirmTripModal({
  open,
  onClose,
  onConfirm,
  origin,
  destination,
  price,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  origin: string;
  destination: string;
  price?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-[420px] p-6">
        <h3 className="text-lg font-semibold mb-2">Confirmar viaje</h3>
        <p className="text-sm text-gray-700"><strong>Origen:</strong> {origin}</p>
        <p className="text-sm text-gray-700"><strong>Destino:</strong> {destination}</p>
        {typeof price === 'number' && (
          <p className="text-sm text-gray-700 mt-2">Precio estimado: <strong>S/{price}</strong></p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white">Confirmar viaje</button>
        </div>
      </div>
    </div>
  );
}
