export type RideRequest = {
  pickup: string;
  destination: string;
  type: string;
  payment: string;
  pickupCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  price?: number;
  external_id?: string;
  // Optional driver info injected by backend: { user, driver, motorcycle }
  driver_info?: {
    user?: { id?: string; name?: string; last_name?: string; phone?: string; email?: string };
    driver?: { id?: string; driver_license?: string; rating?: number | string };
    motorcycle?: { id?: string; plate?: string; color?: string; soat?: string; technical_review_date?: string };
  };
};
