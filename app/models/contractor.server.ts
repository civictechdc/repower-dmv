import { Contractor } from "@prisma/client";

import { prisma } from "~/db.server";
import { startCrawl, getCrawl, getCrawlErrors } from "~/lib/firecrawl.server";
import { analyzeCrawlMarkdown } from "~/lib/gemini.server";
import { sortByDistanceFromZip } from "~/lib/distances";
import { getPlaceDetails, textSearchPlace, textSearchCandidates } from "~/lib/googlePlaces.server";
import {
  Certification,
  Service,
  State,
  CreateContractorPayload,
  ContractorFilters
} from "~/types";

export const getContractorById = async (id: Contractor["id"]) => {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: {
        certifications: true,
        services: true,
        statesServed: true,
      },
    });
    return contractor;
  } catch (error) {
    console.error(`Error fetching contractor by ID ${id}:`, error);
    throw new Error("Failed to fetch contractor");
  }
};

//get contractor by name
export async function getContractorByName(name: Contractor["name"]) {
  try {
    const contractor = await prisma.contractor.findFirst({
      where: { name },
      include: {
        certifications: true,
        services: true,
        statesServed: true,
      },
    });
    return contractor;
  } catch (error) {
    console.error(`Error fetching contractor by name ${name}:`, error);
    throw new Error("Failed to fetch contractor");
  }
}

export const getContractors = async ({zip, certifications, services, stateServed}:ContractorFilters, page = 1, pageSize = 10) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const filterBy: any = { isDraft: false };

  if (certifications && certifications.length > 0) {
    filterBy["certifications"] = {
      some: {
        shortName: {
          in: certifications,
        },
      },
    };
  }

  if (services && services.length > 0) {
    filterBy["services"] = {
      some: {
        name: {
          in: services,
        },
      },
    };
  }

  if (stateServed) {
    filterBy["statesServed"] = {
      some: {
        name: stateServed,
      },
    };
  }

  // Query DB for contractors matching the filters specified
  // todo: ensure indices exist as necessary to ensure optimized searched for any permutation of filters
  let contractors;
  try {
    contractors = await prisma.contractor.findMany({
      include: {
        certifications: true,
        services: true,
        statesServed: true,
      },
      orderBy: {
        name: "asc",
      },
      where: filterBy,
    });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    throw new Error("Failed to fetch contractors");
  }

  // If there's a zip filter then go fetch distances and sort by distance
  if (zip) {
    try {
      contractors = await sortByDistanceFromZip(contractors, zip) as typeof contractors;
    } catch (error) {
      console.log("Error fetching distances from zip: ", error);
      throw new Error("Failed to fetch distances from zip");
    }
  }

  const totalContractors = contractors.length;
  const startPage = (page - 1) * pageSize;
  contractors = contractors.slice(startPage, startPage + pageSize);

  return {
    contractors,
    totalPages: Math.ceil(totalContractors / pageSize),
    currentPage: page,
  };
};

export async function createContractor(contractor: CreateContractorPayload) {
  try {
    const statesServed = [];
    for (const stateName of contractor["statesServed"]) {
      const state: State = await prisma.state.findFirstOrThrow({
        where: { name: stateName },
      });
      statesServed.push(state);
    }
    const services = [];
    for (const serviceName of contractor["services"]) {
      const service: Service = await prisma.service.findFirstOrThrow({
        where: { name: serviceName },
      });
      services.push(service);
    }
    const certifications = [];
    for (const certificationName of contractor["certifications"]) {
      const certification: Certification =
        await prisma.certification.findFirstOrThrow({
          where: { shortName: certificationName },
        });
      certifications.push(certification);
    }

    return prisma.contractor.create({
      data: {
        ...contractor,
        statesServed: {
          connect: statesServed,
        },
        services: {
          connect: services,
        },
        certifications: {
          connect: certifications,
        },
        isDraft: true,
      },
    });
  } catch (error) {
    console.error("Error creating contractor", error);
    throw new Error("Could not create contractor listing");
  }
}

export const listAllContractorsForAdmin = async () => {
  try {
    return await prisma.contractor.findMany({
      include: {
        certifications: true,
        services: true,
        statesServed: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error listing contractors for admin:", error);
    throw new Error("Failed to list contractors for admin");
  }
};

export const setContractorDraftStatus = async (
  id: Contractor["id"],
  isDraft: boolean,
) => {
  try {
    return await prisma.contractor.update({
      where: { id },
      data: { isDraft },
    });
  } catch (error) {
    console.error(`Error updating contractor draft status for ${id}:`, error);
    throw new Error("Failed to update contractor draft status");
  }
};

export const deleteContractorById = async (id: Contractor["id"]) => {
  try {
    return await prisma.contractor.delete({ where: { id } });
  } catch (error) {
    console.error(`Error deleting contractor ${id}:`, error);
    throw new Error("Failed to delete contractor");
  }
};

export async function updateContractorPlaceId(
  id: Contractor["id"],
  placeId: string,
) {
  const details = await getPlaceDetails(placeId);
  return prisma.contractor.update({
    where: { id },
    data: {
      googlePlacesId: placeId,
      googleRating: details?.rating ?? null,
      googleNumRatings: details?.user_ratings_total ?? null,
      googleReviewsUrl: details?.place_id ? details.place_id : null,
      website: details?.website ?? undefined,
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      googleMapsUri: details?.googleMapsUri ?? undefined,
      googleBusinessStatus: details?.businessStatus ?? undefined,
      googlePhoneNumber: details?.phoneNumber ?? undefined,
      googlePrimaryType: details?.primaryType ?? undefined,
      googlePrimaryTypeDisplayName: details?.primaryTypeDisplayName ?? undefined,
      googleTypes: (details?.types as any) ?? undefined,
      googleLocation: (details?.location as any) ?? undefined,
      googleEditorialSummary: (details?.editorialSummary as any) ?? undefined,
      googleGenerativeSummary: (details?.generativeSummary as any)?.overview?.text ?? undefined,
      googleReviewSummary: (details?.reviewSummary as any) ?? undefined,
    },
  });
}

export async function clearContractorPlaceId(id: Contractor["id"]) {
  return prisma.contractor.update({
    where: { id },
    data: {
      googlePlacesId: null,
      googleRating: null,
      googleNumRatings: null,
      googleReviewsUrl: null,
    },
  });
}

export async function lookupAndSetContractorPlaceId(id: Contractor["id"]) {
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) throw new Error("Contractor not found");
  const queries = [
    `${contractor.name} ${contractor.zip ?? ""}`,
    `${contractor.name} ${contractor.city ?? ""} ${contractor.state ?? ""}`,
    `${contractor.name}`,
  ]
    .map((s) => s.trim())
    .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i);
  for (const q of queries) {
    const match = await textSearchPlace(q);
    if (match?.place_id) {
      return updateContractorPlaceId(id, match.place_id);
    }
  }
  return contractor;
}

export async function refreshContractorGoogleData(id: Contractor["id"]) {
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) throw new Error("Contractor not found");
  if (!contractor.googlePlacesId) throw new Error("No place_id set");
  const details = await getPlaceDetails(contractor.googlePlacesId);
  console.log(details);
  return prisma.contractor.update({
    where: { id },
    data: {
      googleRating: details?.rating ?? null,
      googleNumRatings: details?.user_ratings_total ?? null,
      googleReviewsUrl: details?.place_id ? details.place_id : contractor.googleReviewsUrl,
      website: details?.website ?? undefined,
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      googleMapsUri: details?.googleMapsUri ?? undefined,
      googleBusinessStatus: details?.businessStatus ?? undefined,
      googlePhoneNumber: details?.phoneNumber ?? undefined,
      googlePrimaryType: details?.primaryType ?? undefined,
      googlePrimaryTypeDisplayName: details?.primaryTypeDisplayName ?? undefined,
      googleTypes: (details?.types as any) ?? undefined,
      googleLocation: (details?.location as any) ?? undefined,
      googleEditorialSummary: (details?.editorialSummary as any) ?? undefined,
      googleGenerativeSummary: (details?.generativeSummary as any)?.overview?.text ?? undefined,
      googleReviewSummary: (details?.reviewSummary as any) ?? undefined,
    },
  });
}

export async function updateContractorByAdmin(
  id: Contractor["id"],
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    zip?: string;
    isDraft?: boolean;
    // Google scalar fields
    googlePlacesId?: string | null;
    googleRating?: number | null;
    googleNumRatings?: number | null;
    googleReviewsUrl?: string | null;
    googleMapsUri?: string | null;
    googleBusinessStatus?: string | null;
    googlePhoneNumber?: string | null;
    googlePrimaryType?: string | null;
    googlePrimaryTypeDisplayName?: string | null;
    // Google JSON-ish fields
    googleTypes?: any | null;
    googleLocation?: any | null;
    googleEditorialSummary?: any | null;
    googleGenerativeSummary?: any | null;
    googleReviewSummary?: any | null;
    // Relations
    stateIds?: number[];
    serviceIds?: number[];
    certificationIds?: number[];
  },
) {
  const { stateIds, serviceIds, certificationIds, ...scalars } = data;
  // Normalize generative summary: store only the overview text string when an object is provided
  const normalizedScalars = {
    ...scalars,
    googleGenerativeSummary:
      typeof scalars.googleGenerativeSummary === 'string'
        ? scalars.googleGenerativeSummary
        : (scalars.googleGenerativeSummary as any)?.overview?.text ?? null,
  } as typeof scalars;
  return prisma.contractor.update({
    where: { id },
    data: {
      ...normalizedScalars,
      ...(typeof stateIds !== "undefined"
        ? { statesServed: { set: (stateIds || []).map((id) => ({ id })) } }
        : {}),
      ...(typeof serviceIds !== "undefined"
        ? { services: { set: (serviceIds || []).map((id) => ({ id })) } }
        : {}),
      ...(typeof certificationIds !== "undefined"
        ? { certifications: { set: (certificationIds || []).map((id) => ({ id })) } }
        : {}),
    },
    include: {
      certifications: true,
      services: true,
      statesServed: true,
    },
  });
}

export async function lookupByNameAndZipAndSetPlaceId(
  id: Contractor["id"],
  name: string,
  zip: string,
) {
  const c = await prisma.contractor.findUnique({ where: { id } });
  if (!c) throw new Error("Contractor not found");

  const candidates = [
    `${name} ${zip}`,
    `${name} ${c.city} ${c.state}`,
    `${name}`,
  ]
    .map((s) => s.trim())
    .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i);

  for (const q of candidates) {
    try {
      const match = await textSearchPlace(q);
      if (match?.place_id) {
        await updateContractorPlaceId(id, match.place_id);
        return { updated: true, matchedQuery: q, placeId: match.place_id } as const;
      }
    } catch (e) {
      // continue to next candidate on error
    }
  }
  return { updated: false } as const;
}

export async function bulkRefreshAllContractorsGoogle() {
  const contractors = await prisma.contractor.findMany({
    select: {
      id: true,
      name: true,
      addressLine1: true,
      city: true,
      state: true,
      zip: true,
      googlePlacesId: true,
    },
  });
  const summary = {
    refreshedExisting: 0,
    lookedUpNew: 0,
    matchedBy: new Map<string, number>(),
  } as const;
  for (const c of contractors) {
    try {
      if (c.googlePlacesId) {
        await refreshContractorGoogleData(c.id);
        // @ts-ignore - readonly for simplicity in const
        summary.refreshedExisting++;
        continue;
      }

      const candidates = [
        `${c.name} ${c.zip ?? ""}`,
        `${c.name} ${c.city ?? ""} ${c.state ?? ""}`,
        `${c.name}`,
      ]
        .map((s) => s.trim())
        .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i);

      for (const q of candidates) {
        try {
          const match = await textSearchPlace(q);
          if (match?.place_id) {
            await updateContractorPlaceId(c.id, match.place_id);
            // @ts-ignore
            summary.lookedUpNew++;
            // @ts-ignore
            summary.matchedBy.set(q, (summary.matchedBy.get(q) ?? 0) + 1);
            break;
          }
        } catch (e) {
          // try next candidate
        }
      }
    } catch (e) {
      console.warn("Bulk refresh error for", c.id, e);
    }
  }
  // Collapse matchedBy for readability
  const matchedByObj: Record<string, number> = {};
  // @ts-ignore
  for (const [k, v] of summary.matchedBy.entries()) matchedByObj[k] = v;
  return {
    refreshedExisting: summary.refreshedExisting,
    lookedUpNew: summary.lookedUpNew,
    matchedBy: matchedByObj,
  };
}

export async function previewTopGoogleCandidates(id: Contractor["id"]) {
  const c = await prisma.contractor.findUnique({ where: { id } });
  if (!c) throw new Error("Contractor not found");
  const queries = [
    `${c.name} ${c.zip ?? ""}`,
    `${c.name} ${c.city ?? ""} ${c.state ?? ""}`,
    `${c.name}`,
  ]
    .map((s) => s.trim())
    .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i);

  const agg: Record<string, { place_id: string; name: string; formatted_address?: string; rating?: number; user_ratings_total?: number; fromQuery: string }>
    = {};
  for (const q of queries) {
    try {
      const results = await textSearchCandidates(q, 5);
      console.log(results)
      console.log(q)
      for (const r of results) {
        if (!agg[r.place_id]) {
          agg[r.place_id] = { ...r, fromQuery: q } as any;
        }
      }
    } catch (e) {
      // ignore and continue
    }
  }
  const list = Object.values(agg);
  list.sort((a, b) => (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0) || (b.rating ?? 0) - (a.rating ?? 0));
  return { candidates: list.slice(0, 3), queries };
}

export async function startContractorWebsiteCrawl(id: Contractor["id"]) {
  const c = await prisma.contractor.findUnique({ where: { id }, select: { id: true, website: true } });
  if (!c) throw new Error("Contractor not found");
  const url = c.website?.trim();
  if (!url) throw new Error("Contractor has no website to crawl");

  // Configure crawl to be more permissive - only exclude truly problematic paths
  // Firecrawl has restrictive default exclude patterns, so we set minimal exclusions
  const crawlId = await startCrawl(url, {
    limit: 20, // Allow more pages to get comprehensive data
    excludePaths: [
      '/wp-admin/*',
      '/wp-includes/*',
      '/admin/*',
      '/login/*',
      '/wp-login.php*',
      '/xmlrpc.php*',
      '/wp-json/*',
      '/feed/*',
      '/rss/*',
      '/trackback/*',
    ],
    crawlEntireDomain: true,
    maxConcurrency: 2, // Be respectful with concurrency
    delay: 1000, // 1 second delay between requests
  });
  await prisma.contractor.update({
    where: { id },
    data: {
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlId,
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlStatus: "queued",
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlStartedAt: new Date(),
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlCompletedAt: null,
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlLastCheckedAt: new Date(),
    },
  });
  return { crawlId } as const;
}

export async function pollContractorCrawl(id: Contractor["id"]) {
  const c = (await prisma.contractor.findUnique({ where: { id } })) as any;
  if (!c) throw new Error("Contractor not found");
  if (!c.crawlId) throw new Error("No crawl started");
  const status = await getCrawl(c.crawlId);
  const errors = await getCrawlErrors(c.crawlId).catch(() => null);
  const isDone = status.status === "completed" || status.status === "failed";
  const itemsCandidate = (status as any)?.items
    ?? (status as any)?.data
    ?? (status as any)?.documents
    ?? (status as any)?.pages
    ?? (status as any)?.results;
  const items = Array.isArray(itemsCandidate) ? (itemsCandidate as any[]) : undefined;
  await prisma.contractor.update({
    where: { id },
    data: {
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlStatus: (status.status as any) ?? null,
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlLastCheckedAt: new Date(),
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlCompletedAt: isDone ? new Date() : null,
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlPages: (items ? (items as any) : undefined) as any,
      // @ts-ignore
      crawlErrors: (errors as any) ?? undefined,
    },
  });
  return { status: status.status, items: items?.length ?? 0 } as const;
}

export async function analyzeContractorCrawl(id: Contractor["id"]) {
  const c = (await prisma.contractor.findUnique({ where: { id } })) as any;
  if (!c) throw new Error("Contractor not found");
  const items = (Array.isArray((c as any).crawlPages) ? ((c as any).crawlPages as any[]) : []) as Array<any>;
  const jsonPayloads = items
    .map((p: any) => p?.json)
    .filter((x: any) => x && typeof x === 'object');

  if (jsonPayloads.length > 0) {
    // Merge structured outputs from Firecrawl JSON schema
    const toSet = new Set<string>();
    const toSet2 = new Set<string>();
    const toSet3 = new Set<string>();
    let summary: string | null = null;
    for (const j of jsonPayloads) {
      for (const s of Array.isArray(j.services) ? j.services : []) toSet.add(String(s));
      for (const s of Array.isArray(j.certifications) ? j.certifications : []) toSet2.add(String(s));
      for (const s of Array.isArray(j.accredited) ? j.accredited : []) toSet3.add(String(s));
      if (!summary && j.summary) summary = String(j.summary);
    }
    const extract = {
      services: Array.from(toSet),
      certifications: Array.from(toSet2),
      accredited: Array.from(toSet3),
      summary: summary || "",
    } as const;
    await prisma.contractor.update({
      where: { id },
      data: {
        // @ts-ignore prisma client may be out-of-date locally; field exists in schema
        crawlSummary: extract.summary || null,
        // @ts-ignore
        crawlExtract: extract as any,
      },
    });
    return extract as any;
  }

  // Fallback to Gemini if JSON schema content is not present
  const condensed = items.map((p: any) => ({ url: String(p?.url || ""), markdown: p?.markdown || "" }));
  const analysis = await analyzeCrawlMarkdown(condensed);
  await prisma.contractor.update({
    where: { id },
    data: {
      // @ts-ignore prisma client may be out-of-date locally; field exists in schema
      crawlSummary: analysis.summary || null,
      // @ts-ignore
      crawlExtract: analysis as any,
    },
  });
  return analysis;
}

export async function getContractorCrawlPreview(id: Contractor["id"]) {
  const c = (await prisma.contractor.findUnique({ where: { id } })) as any;
  if (!c) throw new Error("Contractor not found");
  const pages = Array.isArray(c.crawlPages) ? (c.crawlPages as any[]) : [];
  const errors = c.crawlErrors ?? null;
  const samplePages = pages.slice(0, 10).map((p: any) => {
    const snippet = p?.json
      ? JSON.stringify(p.json).slice(0, 500)
      : String(p?.markdown || "").slice(0, 500);
    return {
      url: String(p?.url || ""),
      markdownSnippet: snippet,
    };
  });
  return {
    crawlId: c.crawlId ?? null,
    crawlStatus: c.crawlStatus ?? null,
    crawlStartedAt: c.crawlStartedAt ?? null,
    crawlCompletedAt: c.crawlCompletedAt ?? null,
    crawlLastCheckedAt: c.crawlLastCheckedAt ?? null,
    pagesCount: pages.length,
    samplePages,
    errors,
    summary: c.crawlSummary ?? null,
    extract: c.crawlExtract ?? null,
  } as const;
}
