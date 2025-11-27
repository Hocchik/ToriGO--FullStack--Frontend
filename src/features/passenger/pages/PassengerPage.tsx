// features/passenger/PassengerPage.tsx
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { requestRide, confirmRide, finishLoading, cancelRide, createTrip } from "../passengerSlice";
import PassengerRequestPanel from "../components/PassengerRequestPanel";
import PassengerMap from '../../../components/PassengerMap';
import RideStatusPanel from "../components/RideStatusPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RideRequest } from "../../../types/trip";
import { useState } from "react";

export const PassengerPage = () => {
  const dispatch = useAppDispatch();
  const { ride, loading, accepted } = useAppSelector((state) => state.passenger);

  const handleRequestRide = async (rideData: RideRequest) => {
    // build payload including coords and price and an external id
    const external_id = `ext_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payload: any = {
      external_id,
      pickup: rideData.pickup,
      destination: rideData.destination,
      type: rideData.type,
      payment: rideData.payment,
      pickup_coords: rideData.pickupCoords,
      destination_coords: rideData.destinationCoords,
      price: rideData.price,
      created_at: new Date().toISOString(),
    };

    // optimistic UI: dispatch local ride request state
    dispatch(requestRide({ ...rideData, external_id }));

    try {
      await dispatch(createTrip(payload));
      // simulate search and notify passenger when driver available (placeholder)
      setTimeout(() => {
        dispatch(finishLoading());
        setTimeout(() => dispatch(confirmRide()), 1200);
      }, 1200);
    } catch (e) {
      console.error('Failed to create trip (thunk)', e);
      // revert optimistic state
      dispatch(cancelRide());
      alert('No se pudo crear el viaje. Intenta de nuevo.');
    }
  };

    // Map selection state
    const [pickupCoords, setPickupCoords] = useState<{lat:number; lng:number}>({ lat: -12.0460, lng: -77.0425 });
    const [destCoords, setDestCoords] = useState<{lat:number; lng:number}>({ lat: -12.0500, lng: -77.0300 });
    const [selecting, setSelecting] = useState<'pickup'|'destination'|null>(null);

    const handleMapClick = (loc: {lat:number; lng:number}) => {
      if (selecting === 'pickup') {
        setPickupCoords(loc);
        setSelecting(null);
      } else if (selecting === 'destination') {
        setDestCoords(loc);
        setSelecting(null);
      }
    };

  const handleCancelRide = () => {
    dispatch(cancelRide());
  };

  return (
    <div className="relative w-full h-screen flex overflow-hidden">
      {loading && <LoadingOverlay message="Buscando mototaxi..." />}
      {ride ? (
        <>
          <RideStatusPanel ride={ride} accepted={accepted} onCancel={handleCancelRide} />
          <div className="flex-1 relative">
            <div className="absolute inset-0 z-0">
              <PassengerMap
                origin={pickupCoords}
                destination={destCoords}
                onMapClick={handleMapClick}
                showRoute={false}
              />
            </div>

          </div>
        </>
      ) : (
        <>
          <PassengerRequestPanel onSubmit={handleRequestRide} onPickOnMap={(t) => setSelecting(t)} selecting={selecting} pickupCoords={pickupCoords} destinationCoords={destCoords} />
          <div className="flex-1 relative">
            <div className="absolute inset-0 z-0">
              <PassengerMap
                origin={pickupCoords}
                destination={destCoords}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};