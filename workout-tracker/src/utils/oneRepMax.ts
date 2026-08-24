/** Epley-style estimated one-rep max. A trend estimate only, not a tested max. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}
