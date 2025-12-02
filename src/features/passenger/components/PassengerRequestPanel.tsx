// PassengerFloatingPanel.tsx
import { useState } from "react";
import type { RideRequest } from "../../../types/trip";

import { useEffect } from "react";
import { haversineMeters, estimatePriceMeters } from '../../../utils/priceCalculator';
// removed unused useRef import

export default function PassengerFloatingPanel({ onSubmit, onPickOnMap, onCoordsChange, selecting, pickupCoords, destinationCoords }: { onSubmit: (ride: RideRequest) => void; onPickOnMap?: (type: 'pickup'|'destination') => void; onCoordsChange?: (type: 'pickup'|'destination', coords: {lat:number;lng:number}, address?: string) => void; selecting?: 'pickup'|'destination'|null; pickupCoords?: {lat:number;lng:number}; destinationCoords?: {lat:number;lng:number} }) {
    const [pickup, setPickup] = useState("Corredor Metropolitano, 100");
    const [destination, setDestination] = useState("Av. Emancipación 202");
    const [type, setType] = useState("Económico");
    const [payment, setPayment] = useState("Efectivo");
    const [price, setPrice] = useState<number | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        const gmapsKey = (import.meta.env as any).VITE_GMAPS_KEY || localStorage.getItem('gMapsKey');
        (async () => {
            if (!pickupCoords || !destinationCoords) return;
            // Prefer Google Distance Matrix if key available
            if (gmapsKey) {
                try {
                    const origins = `${pickupCoords.lat},${pickupCoords.lng}`;
                    const destinations = `${destinationCoords.lat},${destinationCoords.lng}`;
                    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${gmapsKey}`;
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('Distance Matrix failed');
                    const json = await res.json();
                    const el = json?.rows?.[0]?.elements?.[0];
                    if (el && el.distance && !cancelled) {
                        const meters = el.distance.value as number;
                        const p = estimatePriceMeters(meters, type);
                        setPrice(p);
                        return;
                    }
                } catch (e) {
                    // fall back to haversine
                }
            }
            if (!cancelled) {
                const meters = haversineMeters(pickupCoords, destinationCoords);
                const p = estimatePriceMeters(meters, type);
                setPrice(p);
            }
        })();
        return () => { cancelled = true; };
    }, [pickupCoords, destinationCoords, type]);

    // Auto-fill the address inputs when coordinates are selected on the map
    // Reverse-geocode coordinates selected on map to a human readable address
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!pickupCoords) return;
            try {
                if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Geocoder) {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: pickupCoords.lat, lng: pickupCoords.lng } }, (results: any) => {
                        if (cancelled) return;
                        if (results && results[0]) {
                            setPickup(results[0].formatted_address || `Seleccionado en mapa: ${pickupCoords.lat.toFixed(5)}, ${pickupCoords.lng.toFixed(5)}`);
                        } else {
                            setPickup(`Seleccionado en mapa: ${pickupCoords.lat.toFixed(5)}, ${pickupCoords.lng.toFixed(5)}`);
                        }
                        if (onCoordsChange) onCoordsChange('pickup', pickupCoords, results?.[0]?.formatted_address);
                    });
                } else {
                    setPickup(`Seleccionado en mapa: ${pickupCoords.lat.toFixed(5)}, ${pickupCoords.lng.toFixed(5)}`);
                    if (onCoordsChange) onCoordsChange('pickup', pickupCoords);
                }
            } catch (e) {
                setPickup(`Seleccionado en mapa: ${pickupCoords.lat.toFixed(5)}, ${pickupCoords.lng.toFixed(5)}`);
                if (onCoordsChange) onCoordsChange('pickup', pickupCoords);
            }
        })();
        return () => { cancelled = true; };
    }, [pickupCoords]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!destinationCoords) return;
            try {
                if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Geocoder) {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: destinationCoords.lat, lng: destinationCoords.lng } }, (results: any) => {
                        if (cancelled) return;
                        if (results && results[0]) {
                            setDestination(results[0].formatted_address || `Seleccionado en mapa: ${destinationCoords.lat.toFixed(5)}, ${destinationCoords.lng.toFixed(5)}`);
                        } else {
                            setDestination(`Seleccionado en mapa: ${destinationCoords.lat.toFixed(5)}, ${destinationCoords.lng.toFixed(5)}`);
                        }
                        if (onCoordsChange) onCoordsChange('destination', destinationCoords, results?.[0]?.formatted_address);
                    });
                } else {
                    setDestination(`Seleccionado en mapa: ${destinationCoords.lat.toFixed(5)}, ${destinationCoords.lng.toFixed(5)}`);
                    if (onCoordsChange) onCoordsChange('destination', destinationCoords);
                }
            } catch (e) {
                setDestination(`Seleccionado en mapa: ${destinationCoords.lat.toFixed(5)}, ${destinationCoords.lng.toFixed(5)}`);
                if (onCoordsChange) onCoordsChange('destination', destinationCoords);
            }
        })();
        return () => { cancelled = true; };
    }, [destinationCoords]);

    // Autocomplete suggestions state
    const [pickupSuggestions, setPickupSuggestions] = useState<Array<{description:string, placeId:string}>>([]);
    const [destSuggestions, setDestSuggestions] = useState<Array<{description:string, placeId:string}>>([]);

    // Query predictions when user types
    const fetchPredictions = (input: string, target: 'pickup'|'destination') => {
        if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.places) return;
        try {
            const service = new (window as any).google.maps.places.AutocompleteService();
            service.getPlacePredictions({ input }, (preds: any[], _status: any) => {
                if (!preds || !preds.length) {
                    if (target === 'pickup') setPickupSuggestions([]); else setDestSuggestions([]);
                    return;
                }
                const items = preds.map(p => ({ description: p.description, placeId: p.place_id }));
                if (target === 'pickup') setPickupSuggestions(items); else setDestSuggestions(items);
            });
        } catch (e) {}
    };

    // When user selects a suggestion, fetch place details (geometry + formatted_address)
    const selectPrediction = (placeId: string, target: 'pickup'|'destination') => {
        if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.places) return;
        const svc = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
        svc.getDetails({ placeId }, (place: any, _status: any) => {
            if (!place) return;
            const address = place.formatted_address || place.name || place.vicinity || '';
            const loc = place.geometry?.location;
            if (loc && typeof loc.lat === 'function') {
                const coords = { lat: loc.lat(), lng: loc.lng() };
                if (target === 'pickup') {
                    setPickup(address);
                    setPickupSuggestions([]);
                    if (onCoordsChange) onCoordsChange('pickup', coords, address);
                } else {
                    setDestination(address);
                    setDestSuggestions([]);
                    if (onCoordsChange) onCoordsChange('destination', coords, address);
                }
            } else {
                if (target === 'pickup') { setPickup(address); setPickupSuggestions([]); } else { setDestination(address); setDestSuggestions([]); }
            }
        });
    };

    const handleSubmit = () => {
        onSubmit({ pickup, destination, type, payment, pickupCoords, destinationCoords, price });
    };

    return (
        <div className="relative m-4">
            <div className="bg-white w-[340px] rounded-xl px-5 py-6 flex flex-col gap-4 shadow-lg text-gray-900">

      <h2 className="text-lg font-semibold text-gray-800">📍 Solicitar Mototaxi</h2>

      {/* Punto Inicial */}
        <div>
        <h3 className="text-sm font-semibold text-gray-700">Punto Inicial</h3>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-green-600 text-lg">✔️</span>
            <div className="relative flex-1">
            <input
            value={pickup}
            onChange={(e) => { setPickup(e.target.value); fetchPredictions(e.target.value, 'pickup'); }}
            placeholder="Dirección de origen"
            className="flex-1 border px-3 py-2 rounded text-sm text-gray-800"
            />
            {pickupSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border mt-1 rounded z-40 max-h-48 overflow-auto">
                    {pickupSuggestions.map(s => (
                        <div key={s.placeId} onClick={() => selectPrediction(s.placeId, 'pickup')} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">{s.description}</div>
                    ))}
                </div>
            )}
            </div>
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
            <div className="relative flex-1">
            <input
            value={destination}
            onChange={(e) => { setDestination(e.target.value); fetchPredictions(e.target.value, 'destination'); }}
            placeholder="Dirección de destino"
            className="flex-1 border px-3 py-2 rounded text-sm text-gray-800"
            />
            {destSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border mt-1 rounded z-40 max-h-48 overflow-auto">
                    {destSuggestions.map(s => (
                        <div key={s.placeId} onClick={() => selectPrediction(s.placeId, 'destination')} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">{s.description}</div>
                    ))}
                </div>
            )}
            </div>
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