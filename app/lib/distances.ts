import zipcodes from "zipcodes";

export function sortByDistanceFromZip<T extends { zip: string }>(
  contractors: T[],
  zip: string,
): Promise<(T & { distance?: number })[]> {
  const normalizedZip = (zip || "").trim();
  if (!/^[0-9]{5}$/.test(normalizedZip)) {
    return Promise.resolve(contractors as (T & { distance?: number })[]);
  }

  const contractorsWithDistances = contractors.map((contractor) => {
    const contractorZip = (contractor.zip || "").trim();
    let distanceMiles: number | undefined = undefined;
    try {
      const d = (zipcodes as unknown as { distance: (a: string, b: string) => number | undefined }).distance(normalizedZip, contractorZip);
      if (typeof d === "number" && isFinite(d)) {
        distanceMiles = Math.round(d * 10) / 10; // one decimal place
      }
    } catch {
      // ignore lookup errors; leave distance undefined
    }
    return { ...contractor, distance: distanceMiles } as T & { distance?: number };
  });

  contractorsWithDistances.sort((a, b) => {
    const ad = typeof a.distance === "number" ? a.distance : Number.POSITIVE_INFINITY;
    const bd = typeof b.distance === "number" ? b.distance : Number.POSITIVE_INFINITY;
    return ad - bd;
  });

  return Promise.resolve(contractorsWithDistances);
}
