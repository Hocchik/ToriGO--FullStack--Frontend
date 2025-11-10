
interface InTripPanelProps {
    etaToDestination: string;
    onFinishTrip: () => void;
}

export default function InTripPanel({ etaToDestination, onFinishTrip }: InTripPanelProps) {
    return (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-300 shadow-md space-y-3">
            <p className="text-sm text-blue-800 font-bold flex items-center">
                <span className="text-lg mr-2">📍</span>
                **Viaje en curso.** Dirígete al destino.
            </p>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                <div>
                    <p className="text-xs text-gray-500">ETA al destino</p>
                    <div className="text-2xl font-extrabold text-blue-600">{etaToDestination}</div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Kilómetros recorridos (Aprox.)</p>
                    <div className="text-xl font-bold text-gray-900">12.5 km</div>
                </div>
            </div>

            <button
                onClick={onFinishTrip}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg hover:bg-red-700 transition-colors"
            >
                Finalizar viaje
            </button>
        </div>
    );
}