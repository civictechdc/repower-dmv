import { describe, it, expect } from "vitest";
import { sortByDistanceFromZip } from "./distances";

type MiniContractor = { id: string; name: string; zip: string };

describe("sortByDistanceFromZip", () => {
  it("sorts contractors by ascending distance from a given zip", async () => {
    const contractors: MiniContractor[] = [
      { id: "1", name: "Near DC", zip: "20001" }, // DC
      { id: "2", name: "NYC", zip: "10001" },     // NYC
      { id: "3", name: "SF", zip: "94103" },      // San Francisco
    ];

    const sorted = await sortByDistanceFromZip(contractors, "20001");

    // Expect the DC entry first, then NYC, then SF (closest to farthest from DC)
    expect(sorted.map((c) => c.id)).toEqual(["1", "2", "3"]);

    // Distances should be non-decreasing and defined for valid zips
    const distances = sorted.map((c) => c.distance ?? Number.POSITIVE_INFINITY);
    expect(distances[0]).toBeLessThanOrEqual(distances[1]);
    expect(distances[1]).toBeLessThanOrEqual(distances[2]);
  });

  it("returns original order if zip is invalid", async () => {
    const contractors: MiniContractor[] = [
      { id: "a", name: "A", zip: "10001" },
      { id: "b", name: "B", zip: "94103" },
    ];
    const sorted = await sortByDistanceFromZip(contractors, "abcde");
    expect(sorted.map((c) => c.id)).toEqual(["a", "b"]);
  });
});


