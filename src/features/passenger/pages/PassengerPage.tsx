// features/passenger/PassengerPage.tsx
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { requestRide, confirmRide, finishLoading, cancelRide } from "../passengerSlice";
import PassengerRequestPanel from "../components/PassengerRequestPanel";
import RideStatusPanel from "../components/RideStatusPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RideRequest } from "../../../types/trip";

export const PassengerPage = () => {
  const dispatch = useAppDispatch();
  const { ride, loading, accepted } = useAppSelector((state) => state.passenger);

  const handleRequestRide = (rideData: RideRequest) => {
    dispatch(requestRide(rideData));
    setTimeout(() => {
      dispatch(finishLoading());
      setTimeout(() => dispatch(confirmRide()), 1500);
    }, 1200);
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
            <div className="absolute inset-0 -z-10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.123456789!2d-77.042793!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8c123456789%3A0xabcdef123456789!2sAv.%20Emancipaci%C3%B3n%20202!5e0!3m2!1ses!2spe!4v1690000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </>
      ) : (
        <>
          <PassengerRequestPanel onSubmit={handleRequestRide} />
          <div className="flex-1 relative">
            <div className="absolute inset-0 -z-10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.123456789!2d-77.042793!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8c123456789%3A0xabcdef123456789!2sAv.%20Emancipaci%C3%B3n%20202!5e0!3m2!1ses!2spe!4v1690000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </>
      )}
    </div>
  );
};