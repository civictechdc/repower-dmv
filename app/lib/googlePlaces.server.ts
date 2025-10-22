type LanguageText = { text?: string; languageCode?: string } | null;

type PlaceEditorialSummary = { overview?: LanguageText } | null;
type PlaceGenerativeSummary =
  | { overview?: LanguageText; overviewFlagContentUri?: string; disclosureText?: LanguageText }
  | null;

type PlaceReviewText = { text?: string; languageCode?: string } | null;
type PlaceReviewAuthor = { displayName?: string; uri?: string; photoUri?: string } | null;
type PlaceReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: PlaceReviewText;
  originalText?: PlaceReviewText;
  authorAttribution?: PlaceReviewAuthor;
  publishTime?: string;
  flagContentUri?: string;
  googleMapsUri?: string;
} | null;
type PlaceReviewSummary = Record<string, unknown> | null;

type PlaceAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
  languageCode?: string;
};

type LatLngLiteral = { latitude?: number; longitude?: number } | null;

type TextSearchResult = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_address?: string;
  types?: string[];
  serviceArea?: unknown;
  location?: LatLngLiteral;
  businessStatus?: string;
  phoneNumber?: string;
  generativeSummary?: PlaceGenerativeSummary;
  editorialSummary?: PlaceEditorialSummary;
  reviews?: PlaceReview[];
  reviewSummary?: PlaceReviewSummary;
  primaryType?: string;
  googleMapsUri?: string;
  primaryTypeDisplayName?: string;
  website?: string;
  addressComponents?: PlaceAddressComponent[];
  displayName?: LanguageText;
};


const ensureApiKey = () => {
  const key =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "AIzaSyA-oFHDCIARxUazurnikvkmrhJ31JvHJ30";
  if (!key) throw new Error("Google Places API key is not configured");
  return key;
};

function normalizeName(s: string | undefined) {
  return (s || "").toLowerCase().trim();
}

function normalizeAddress(s: string | undefined) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

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
  const results = (Array.isArray(data.results) ? data.results : []) as any[];
  if (!results.length) return null;

  const mapped: TextSearchResult[] = results.map((r) => ({
    place_id: r.place_id,
    name: r.name,
    rating: r.rating,
    user_ratings_total: r.user_ratings_total,
    formatted_address: r.formatted_address,
  }));

  // Prefer any result that has non-zero reviews; among those, pick the most-reviewed
  const withReviews = mapped.filter((c) => (c.user_ratings_total ?? 0) > 0);
  if (withReviews.length) {
    return withReviews.reduce((a, b) =>
      (a.user_ratings_total ?? 0) >= (b.user_ratings_total ?? 0) ? a : b
    );
  }

  // Prefer entries with reviews when there are duplicates with same name+address
  const groups = new Map<string, TextSearchResult[]>();
  for (const r of mapped) {
    const key = `${normalizeName(r.name)}|${normalizeAddress(r.formatted_address)}`;
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }
  const multiGroups = Array.from(groups.values()).filter((g) => g.length > 1);
  if (multiGroups.length) {
    // Among duplicates, pick the one with most user ratings
    const candidates = multiGroups.flat();
    const withReviews = candidates.filter((c) => (c.user_ratings_total ?? 0) > 0);
    const pick = (withReviews.length ? withReviews : candidates).reduce((a, b) =>
      (a.user_ratings_total ?? 0) >= (b.user_ratings_total ?? 0) ? a : b
    );
    return pick;
  }

  // Fallback: just return the first result
  return mapped[0];
}

export async function textSearchCandidates(
  query: string,
  limit = 3,
  fetchImpl: typeof fetch = fetch,
): Promise<TextSearchResult[]> {
  const key = ensureApiKey();
  const url = new URL("https://places.googleapis.com/v1/places:searchText");

  const requestBody = {
    textQuery: query,
    includePureServiceAreaBusinesses: true,
  };

  const res = await fetchImpl(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.displayName,places.id,places.types,places.name,places.rating,places.userRatingCount,places.formattedAddress,places.location,places.businessStatus,places.internationalPhoneNumber,places.generativeSummary,places.editorialSummary,places.reviews,places.reviewSummary,places.primaryType,places.googleMapsUri,places.primaryTypeDisplayName,places.websiteUri',
    },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) throw new Error(`Places textsearch failed: ${res.status}`);
  const data = await res.json();
  const results = (Array.isArray(data.places) ? data.places : []) as any[];
  const mapped: TextSearchResult[] = results.map((r) => ({
    place_id: r.id,
    name: r.displayName?.text || r.name,
    rating: r.rating,
    user_ratings_total: r.userRatingCount,
    formatted_address: r.formattedAddress,
    types: r.types,
    serviceArea: r.serviceArea,
    location: r.location,
    businessStatus: r.businessStatus,
    phoneNumber: r.internationalPhoneNumber,
    generativeSummary: r.generativeSummary,
    editorialSummary: r.editorialSummary,
    reviews: r.reviews,
    reviewSummary: r.reviewSummary,
    primaryType: r.primaryType,
    googleMapsUri: r.googleMapsUri,
    primaryTypeDisplayName: r.primaryTypeDisplayName?.text,
    website: r.websiteUri,
    displayName: r.displayName,
  }));
  return mapped.slice(0, Math.max(0, limit));
}
export async function getPlaceDetails(
  placeId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TextSearchResult | null> {
  const key = ensureApiKey();
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);

  const res = await fetchImpl(url.toString(), {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': key,
      // Request explicit subfields for summaries to ensure content
      'X-Goog-FieldMask': [
        'id',
        'displayName',
        'types',
        'name',
        'rating',
        'userRatingCount',
        'addressComponents',
        'formattedAddress',
        'location',
        'businessStatus',
        'internationalPhoneNumber',
        'generativeSummary',
        'editorialSummary',
        'reviewSummary',
        'primaryType',
        'googleMapsUri',
        'primaryTypeDisplayName',
        'websiteUri',
        'reviews',
      ].join(','),
    },
  });
  if (!res.ok) throw new Error(`Places details failed: ${res.status}`);
  const data = await res.json();
  if (!data) return null;
  return {
    place_id: data.id || placeId,
    name: data.displayName?.text || data.name,
    rating: data.rating,
    user_ratings_total: data.userRatingCount,
    formatted_address: data.formattedAddress,
    googleMapsUri: data.googleMapsUri,
    reviews: data.reviews,
    reviewSummary: data.reviewSummary,
    editorialSummary: data.editorialSummary,
    generativeSummary: data.generativeSummary,
    primaryType: data.primaryType,
    primaryTypeDisplayName: data.primaryTypeDisplayName?.text,
    types: data.types,
    location: data.location,
    businessStatus: data.businessStatus,
    phoneNumber: data.internationalPhoneNumber,
    website: data.websiteUri,
    addressComponents: data.addressComponents,
    displayName: data.displayName,
  };
}