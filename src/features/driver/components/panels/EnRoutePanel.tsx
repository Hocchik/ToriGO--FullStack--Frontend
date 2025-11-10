

interface EnRoutePanelProps {
    etaToPickup: string;
    onArrived: () => void;
}

export default function EnRoutePanel({ etaToPickup, onArrived }: EnRoutePanelProps) {
    return (
        <div className="bg-green-50 p-4 rounded-xl border border-green-300 shadow-md space-y-3">
            <p className="text-sm text-green-800 font-bold flex items-center">
                <span className="text-lg mr-2">📍</span>
                **En camino.** Dirígete al punto de recogida del pasajero.
            </p>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                <div>
                    <p className="text-xs text-gray-500">Tiempo estimado de llegada (ETA)</p>
                    {/* ETA calculada de forma simulada en el componente padre */}
                    <div className="text-2xl font-extrabold text-green-600">{etaToPickup}</div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Distancia restante</p>
                    <div className="text-xl font-bold text-gray-900">3.2 km</div>
                </div>
            </div>

            <button
                onClick={onArrived}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg hover:bg-green-700 transition-colors"
            >
                He llegado al lugar
            </button>
        </div>
    );
}