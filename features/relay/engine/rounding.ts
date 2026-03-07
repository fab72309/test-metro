export function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function clampMin(value: number, min = 0): number {
  return Math.max(min, value);
}

// Doctrine: arrondi au nombre entier ou demi supérieur (16.3 -> 16.5, 12.8 -> 13)
export function roundPressureDoctrine(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.ceil(value * 2) / 2;
}

export function floorHoses40(distanceM: number): number {
  return floorHoses(distanceM, 40);
}

export function floorHoses(distanceM: number, hoseLengthM: number): number {
  if (!Number.isFinite(distanceM) || distanceM <= 0) return 0;
  if (!Number.isFinite(hoseLengthM) || hoseLengthM <= 0) return 0;
  return Math.floor(distanceM / hoseLengthM);
}
