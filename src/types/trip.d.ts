export type RideRequest = {
  pickup: string;
  destination: string;
  type: string;
  payment: string;
  pickupCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  price?: number;
  external_id?: string;
};
