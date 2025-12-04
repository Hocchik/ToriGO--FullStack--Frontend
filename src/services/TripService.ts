import api from './api';

const TripService = {
  // Upsert trip by external tripId
  upsertTrip: (payload: any) => api.post('/trips', payload),
  // Request a new trip (passenger)
  requestTrip: (payload: any) => api.post('/trips/request', payload),

  // Append trace points to a trip
  appendTrace: (tripId: string, traceChunk: Array<any>) => api.post(`/trips/${encodeURIComponent(tripId)}/trace`, { points: traceChunk }),

  // Helpers for driver lifecycle
  markArrived: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/arrived`, body || {}),
  markBoarded: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/boarded`, body || {}),
  markStarted: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/start`, body || {}),
  markFinished: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/finish`, body || {}),
  markCanceled: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/cancel`, body || {}),

  // Get available trips
  // Normalize backend response: backend may return { trips: [...] } or the array directly
  getAvailable: (params?: any) => {
    console.error('[DEBUG] 🌐 TripService.getAvailable() called');
    return api.get('/trips/available', { params })
      .then((res) => {
        console.error('[DEBUG] 📥 TripService: API Response raw:', res);
        console.error('[DEBUG] 📥 TripService: res.data =', res?.data);
        console.error('[DEBUG] 📥 TripService: res.data type =', typeof res?.data);
        
        // Backend returns { data: [...] } or { trips: [...] } or just [...]
        let trips = [];
        if (Array.isArray(res?.data)) {
          trips = res.data;
        } else if (res?.data?.trips && Array.isArray(res.data.trips)) {
          trips = res.data.trips;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          trips = res.data.data;
        } else if (res?.data) {
          trips = [res.data];
        }
        
        console.error('[DEBUG] ✅ TripService: Normalized to array, count:', trips.length);
        console.error('[DEBUG] 📊 TripService: First trip sample:', trips[0]);
        
        return { data: trips };
      })
      .catch((err) => {
        console.error('[DEBUG] ❌ TripService.getAvailable() error:', err);
        throw err;
      });
  },
  // Driver accept a trip
  acceptTrip: (body: any) => {
    // prefer authenticated per-trip accept: POST /trips/:trip_id/accept
    const tripId = body?.tripId || body?.id || body?.trip_id;
    if (tripId) {
      return api.post(`/trips/${encodeURIComponent(tripId)}/accept`, body);
    }
    // fallback to legacy public accept (requires driver_id in body)
    return api.post('/trips/accept', body);
  },
  // Set driver availability
  setAvailability: (body: any) => api.post('/drivers/availability', body),
  // Update driver location (for a specific trip)
  updateLocation: (body: any) => {
    const tripId = body?.tripId || body?.trip_id;
    if (tripId) {
      // backend expects POST /trips/:trip_id/location with { lat, lng }
      const payload = { lat: body.lat ?? body.latitude, lng: body.lng ?? body.longitude };
      return api.post(`/trips/${encodeURIComponent(tripId)}/location`, payload);
    }
    // If no tripId provided, try legacy endpoint (not implemented server-side)
    return Promise.reject(new Error('tripId is required to update driver location'));
  },
  // Batch traces: prefer per-trip append, fallback to upsert trip
  traceBatch: (body: any) => {
    const tripId = body?.tripId || body?.external_id || body?.externalId || body?.trip_id;
    if (tripId) {
      const points = body.points || body.trace || body.driverTrace || body;
      return api.post(`/trips/${encodeURIComponent(tripId)}/trace`, { points });
    }
    // fallback: send upsert trip payload containing driverTrace
    return api.post('/trips', body);
  },
  getTrip: (tripId: string, params?: any) => api.get(`/trips/${encodeURIComponent(tripId)}`, { params }),
};

export default TripService;
