// Models.ts
export interface RideRequest {
  id: string;
  pickup: string;
  drop: string;
  price: number;
  passenger: Passenger;
}

export interface Passenger {
  id: string;
  name: string;
  rating: number;
}
