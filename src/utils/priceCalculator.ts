export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const aa = sinDlat * sinDlat + sinDlon * sinDlon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

export function estimatePriceMeters(distanceMeters: number, type: string) {
  const km = distanceMeters / 1000;
  // base fares and per-km rates (simple example)
  let base = 3.5;
  let perKm = 2.5;
  switch (type) {
    case 'Económico':
      base = 3.5; perKm = 2.0; break;
    case 'Confort':
      base = 4.5; perKm = 2.8; break;
    case 'XL':
      base = 6.0; perKm = 3.8; break;
    default:
      base = 3.5; perKm = 2.0; break;
  }
  const price = base + perKm * km;
  return Math.max(3.5, Math.round(price * 10) / 10); // round to 0.1
}
