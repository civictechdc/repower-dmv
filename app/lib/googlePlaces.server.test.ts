import { describe, it, expect, beforeAll } from "vitest";
import { getPlaceDetails, textSearchPlace,   } from "./googlePlaces.server";

describe("googlePlaces utils", () => {
  beforeAll(() => {
    process.env.GOOGLE_PLACES_API_KEY = "LOL_TEST_KEY";
  });
  it("parses text search response", async () => {
    const fakeFetch = async () => ({ ok: true, json: async () => ({ results: [{ place_id: "pid", name: "Name", rating: 4.2, user_ratings_total: 10 }] }) }) as any;
    const res = await textSearchPlace("query", fakeFetch);
    expect(res?.place_id).toBe("pid");
    expect(res?.rating).toBe(4.2);
    expect(res?.user_ratings_total).toBe(10);
  });

  it("parses place details response (v1)", async () => {
    const fakeFetch = async () => ({ ok: true, json: async () => ({ id: "pid", rating: 4.5, userRatingCount: 5, websiteUri: "w", googleMapsUri: "u" }) }) as any;
    const res = await getPlaceDetails("pid", fakeFetch);
    expect(res?.place_id).toBe("pid");
    expect(res?.rating).toBe(4.5);
    expect(res?.user_ratings_total).toBe(5);
    expect(res?.website).toBe("w");
    expect(res?.googleMapsUri).toBe("u");
  });
});

