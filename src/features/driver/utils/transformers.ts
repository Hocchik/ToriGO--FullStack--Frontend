import type { RideRequest } from '../pages/Models';

/**
 * Transforms trip data from backend format to RideRequest format
 * Handles multiple field name variations and type conversions
 */
export const transformTripToRideRequest = (trip: any): RideRequest => {
  console.error('[DEBUG] 🔄 Transforming trip from backend:', trip);

  // Extract passenger info with multiple fallbacks for different API response formats
  // Backend now includes: passenger_name, passenger_phone, passenger_rating
  const passengerName = trip.passenger_name || 
                        (trip.passenger && trip.passenger.name) || 
                        trip.passenger?.user?.name ||
                        'Pasajero';
  
  const passengerId = trip.passenger_id || 
                      (trip.passenger && trip.passenger.id) || 
                      'unknown';
  
  const passengerRating = Number(trip.passenger_rating) || 
                          Number(trip.passenger?.rating) || 
                          5;

  // Parse fare as number (comes as string "15.50")
  const fareValue = typeof trip.fare === 'string' ? parseFloat(trip.fare) : (trip.fare || 0);

  // Parse coordinates ensuring they're numbers
  const pickupCoords = (trip.origin_lat && trip.origin_lng)
    ? { lat: parseFloat(String(trip.origin_lat)), lng: parseFloat(String(trip.origin_lng)) }
    : undefined;

  const dropCoords = (trip.destination_lat && trip.destination_lng)
    ? { lat: parseFloat(String(trip.destination_lat)), lng: parseFloat(String(trip.destination_lng)) }
    : undefined;

  const transformed: RideRequest = {
    id: trip.id || trip.trip_id,
    pickup: trip.origin_address || 'Pickup',
    drop: trip.destination_address || 'Destination',
    price: fareValue,
    passenger: {
      id: passengerId,
      name: passengerName,
      rating: passengerRating,
    },
    pickupCoords,
    dropCoords,
  };

  console.error('[DEBUG] ✅ Transformed to RideRequest:', transformed);
  return transformed;
};

/**
 * Extracts array of trips from various possible API response formats
 */
export const extractTripsArray = (data: any): any[] => {
  console.error('[DEBUG] 📥 Extracting trips from data:', { type: typeof data, isArray: Array.isArray(data) });

  if (Array.isArray(data)) {
    console.error('[DEBUG] ✅ Data is already an array');
    return data;
  }

  if (data?.trips && Array.isArray(data.trips)) {
    console.error('[DEBUG] ✅ Found trips in data.trips');
    return data.trips;
  }

  if (data?.data && Array.isArray(data.data)) {
    console.error('[DEBUG] ✅ Found data in data.data');
    return data.data;
  }

  if (data) {
    console.error('[DEBUG] ⚠️  Wrapping single item in array');
    return [data];
  }

  console.error('[DEBUG] ⚠️  No data found, returning empty array');
  return [];
};
