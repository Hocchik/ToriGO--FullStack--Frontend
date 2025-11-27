// PassengerFloatingPanel.tsx
import { useState } from "react";
import type { RideRequest } from "../../../types/trip";

import { useEffect } from "react";
import { haversineMeters, estimatePriceMeters } from '../../../utils/priceCalculator';

export default function PassengerFloatingPanel({ onSubmit, onPickOnMap, selecting, pickupCoords, destinationCoords }: { onSubmit: (ride: RideRequest) => void; onPickOnMap?: (type: 'pickup'|'destination') => void; selecting?: 'pickup'|'destination'|null; pickupCoords?: {lat:number;lng:number}; destinationCoords?: {lat:number;lng:number} }) {
    const [pickup, setPickup] = useState("Corredor Metropolitano, 100");
    const [destination, setDestination] = useState("Av. Emancipación 202");
    const [type, setType] = useState("Económico");
    const [payment, setPayment] = useState("Efectivo");
    const [price, setPrice] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (pickupCoords && destinationCoords) {
            const meters = haversineMeters(pickupCoords, destinationCoords);
            const p = estimatePriceMeters(meters, type);
            setPrice(p);
        }
    }, [pickupCoords, destinationCoords, type]);

    // Auto-fill the address inputs when coordinates are selected on the map
    useEffect(() => {
        if (pickupCoords) {
            setPickup(`Seleccionado en mapa: ${pickupCoords.lat.toFixed(5)}, ${pickupCoords.lng.toFixed(5)}`);
        }
    }, [pickupCoords]);

    useEffect(() => {
        if (destinationCoords) {
            setDestination(`Seleccionado en mapa: ${destinationCoords.lat.toFixed(5)}, ${destinationCoords.lng.toFixed(5)}`);
        }
    }, [destinationCoords]);

    const handleSubmit = () => {
        onSubmit({ pickup, destination, type, payment, pickupCoords, destinationCoords, price });
    };

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[340px] bg-[#8B1E3F]/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg p-5 z-50 flex flex-col gap-4 text-gray-900">
        <div className="bg-white w-full rounded-xl px-5 py-6 flex flex-col gap-4 text-gray-900">

      <h2 className="text-lg font-semibold text-gray-800">📍 Solicitar Mototaxi</h2>

      {/* Punto Inicial */}
        <div>
        <h3 className="text-sm font-semibold text-gray-700">Punto Inicial</h3>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-green-600 text-lg">✔️</span>
            <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Dirección de origen"
            className="flex-1 border px-3 py-2 rounded text-sm text-gray-800"
            />
                        <button
                            type="button"
                            onClick={() => onPickOnMap && onPickOnMap('pickup')}
                            className={`ml-2 px-2 py-1 rounded text-xs ${selecting === 'pickup' ? 'bg-yellow-200' : 'bg-white'}`}
                        >{selecting === 'pickup' ? 'Seleccionando...' : 'Seleccionar en mapa'}</button>
        </div>
        </div>

        {/* Destino */}
        <div>
        <h3 className="text-sm font-semibold text-gray-700">Destino</h3>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-red-500 text-lg">❓</span>
            <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Dirección de destino"
            className="flex-1 border px-3 py-2 rounded text-sm text-gray-800"
            />
                        <button
                            type="button"
                            onClick={() => onPickOnMap && onPickOnMap('destination')}
                            className={`ml-2 px-2 py-1 rounded text-xs ${selecting === 'destination' ? 'bg-yellow-200' : 'bg-white'}`}
                        >{selecting === 'destination' ? 'Seleccionando...' : 'Seleccionar en mapa'}</button>
        </div>
        </div>

        {/* Agregar parada y botón Buscar */}
        <div className="flex items-center justify-between gap-4">
        <button
            onClick={() => {
            // lógica para agregar parada (puedes extender con un array de stops si lo deseas)
            console.log("Agregar parada");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition text-sm"
        >
            <span className="text-xl text-gray-600">➕</span>
            <span>Agregar Parada</span>
        </button>

        <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition text-sm"
        >
                        Buscar
        </button>
        </div>

                {/* Price preview */}
                <div className="mt-2">
                    <h3 className="text-sm font-semibold text-gray-700">Resumen</h3>
                    <div className="text-sm text-gray-600 mt-1">
                        {pickupCoords && destinationCoords ? (
                            <div>Precio estimado: <strong>S/{price ?? '—'}</strong></div>
                        ) : (
                            <div>Selecciona origen y destino en el mapa para ver el precio</div>
                        )}
                    </div>
                </div>

        {/* Tipos de viaje */}
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Tipo de viaje</h3>
            <div className="grid grid-cols-3 gap-2">
                {["Económico", "Confort", "XL"].map((option) => (
                <button
                    key={option}
                    onClick={() => setType(option)}
                    className={`flex flex-col items-center justify-center border rounded-lg px-2 py-3 text-sm transition ${
                    type === option ? "bg-blue-200 border-blue-600" : "bg-white"
                    }`}
                >
                    <img src={`/icons/${option.toLowerCase()}.png`} alt={option} className="w-6 h-6 mb-1" />
                    <span>{option}</span>
                    <span className="text-xs text-gray-500">desde S/6.7</span>
                </button>
                ))}
            </div>
        </div>

        {/* Métodos de Pago */}
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Métodos de Pago</h3>
            <div className="grid grid-cols-2 gap-2">
                {["Efectivo", "Yape"].map((method) => (
                <button
                    key={method}
                    onClick={() => setPayment(method)}
                    className={`flex flex-col items-center justify-center rounded-xl px-3 py-3 text-sm transition ${
                    payment === method ? "bg-blue-200 shadow-md" : "bg-white"
                    }`}
                    style={{ border: "none" }}
                >
                    <img src={`/icons/${method.toLowerCase()}.png`} alt={method} className="w-8 h-8 mb-1" />
                    <span>{method}</span>
                </button>
                ))}
            </div>
        </div>

      {/* Pedido para otra persona */}
      <div className="flex items-center gap-2 text-sm">
        <input type="checkbox" id="otherPerson" />
        <label htmlFor="otherPerson">Hacer pedido para otra persona</label>
      </div>
    </div>
    </div>
  );
}