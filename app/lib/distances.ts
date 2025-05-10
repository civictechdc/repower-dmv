import { Contractor } from "../types";
export function sortByDistanceFromZip(
  // @ts-ignore
  contractors: DBContractor[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
