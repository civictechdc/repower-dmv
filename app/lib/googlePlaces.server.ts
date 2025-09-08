type TextSearchResult = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
};

type PlaceDetails = {
  place_id: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  website?: string;
};

const ensureApiKey = () => {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("Google Places API key is not configured");
  return key;
};

export async function textSearchPlace(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TextSearchResult | null> {
  const key = ensureApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", key);
  const res = await fetchImpl(url.toString());
  if (!res.ok) throw new Error(`Places textsearch failed: ${res.status}`);
  const data = await res.json();
  const first = (data.results?.[0] ?? null) as any;
  if (!first) return null;
  return {
    place_id: first.place_id,
    name: first.name,
    rating: first.rating,
    user_ratings_total: first.user_ratings_total,
  };
}

export async function getPlaceDetails(
  placeId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PlaceDetails | null> {
  const key = ensureApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "rating,user_ratings_total,url,website,place_id");
  url.searchParams.set("key", key);
  const res = await fetchImpl(url.toString());
  if (!res.ok) throw new Error(`Places details failed: ${res.status}`);
  const data = await res.json();
  const result = data.result as any;
  if (!result) return null;
  return {
    place_id: result.place_id || placeId,
    rating: result.rating,
    user_ratings_total: result.user_ratings_total,
    url: result.url,
    website: result.website,
  };
}

export function buildGoogleReviewsUrl(placeId: string): string {
  // Use the documented query_place_id link
  return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
}

