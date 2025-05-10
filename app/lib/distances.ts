import { Contractor } from "../types";
export function sortByDistanceFromZip(
  contractors: Contractor[],
  zip: string,
): Promise<Contractor[]> {
  const contractorsWithDistances = contractors.map((contractor) => ({
    ...contractor,
    distance: parseFloat((Math.random() * 27).toFixed(1)),
  }));

  // Sort by distance
  contractorsWithDistances.sort((a, b) => a.distance - b.distance);

  return Promise.resolve(contractorsWithDistances);
}
