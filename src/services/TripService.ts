import api from './api';

const TripService = {
  // Upsert trip by external tripId
  upsertTrip: (payload: any) => api.post('/trips', payload),
  // Request a new trip (passenger)
  requestTrip: (payload: any) => api.post('/trips/request', payload),

  // Append trace points to a trip
  appendTrace: (tripId: string, traceChunk: Array<any>) => api.post(`/trips/${encodeURIComponent(tripId)}/trace`, { trace: traceChunk }),

  // Helpers for driver lifecycle
  markArrived: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/arrived`, body || {}),
  markBoarded: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/boarded`, body || {}),
  markStarted: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/start`, body || {}),
  markFinished: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/finish`, body || {}),
  markCanceled: (tripId: string, body?: any) => api.post(`/trips/${encodeURIComponent(tripId)}/cancel`, body || {}),

  // Get available trips
  getAvailable: (params?: any) => api.get('/trips/available', { params }),
  // Driver accept a trip
  acceptTrip: (body: any) => api.post('/drivers/accept', body),
  // Set driver availability
  setAvailability: (body: any) => api.post('/drivers/availability', body),
  // Update driver location
  updateLocation: (body: any) => api.post('/drivers/location', body),
  // Batch traces (supports external_id)
  traceBatch: (body: any) => api.post('/trips/trace-upsert', body),
  getTrip: (tripId: string) => api.get(`/trips/${encodeURIComponent(tripId)}`),
};

export default TripService;
