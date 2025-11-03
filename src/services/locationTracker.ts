// services/locationTracker.ts
import { ref, onValue } from 'firebase/database';
import { db } from '../utils/firebase';

export const trackDriverLocation = (
  driverId: string,
  callback: (location: { lat: number; lng: number }) => void
) => {
  const locationRef = ref(db, `drivers/${driverId}/location`);
  onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback({ lat: data.lat, lng: data.lng });
  });
};

export const startTrip = async () => {
  await fetch('/api/trip/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      driverId: 'driver123',
      passengerId: 'passenger456',
      origin,
      /* destination, */
    }),
  });
};
