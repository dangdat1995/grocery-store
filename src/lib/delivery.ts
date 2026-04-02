import { DELIVERY_TIERS, MAX_DELIVERY_RADIUS_KM } from "./constants";

/**
 * Calculate delivery fee based on distance in km.
 * Returns null if outside delivery zone.
 */
export function getDeliveryFee(distanceKm: number): number | null {
  if (distanceKm > MAX_DELIVERY_RADIUS_KM) return null;
  const tier = DELIVERY_TIERS.find((t) => distanceKm <= t.maxKm);
  return tier?.fee ?? null;
}

/**
 * Calculate distance between two points using Haversine formula (km).
 * For quick client-side estimation. Use Google Maps API for accurate distance.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
