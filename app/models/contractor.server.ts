import { Contractor } from "@prisma/client";

import { prisma } from "~/db.server";
import { sortByDistanceFromZip } from "~/lib/distances";
import { getPlaceDetails, textSearchPlace, buildGoogleReviewsUrl } from "~/lib/googlePlaces.server";
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
  const filterBy: any = { isDraft: 0 };

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
      contractors = await sortByDistanceFromZip(contractors, zip);
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
        isDraft: 1,
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
  isDraft: number,
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
      googleReviewsUrl: details?.place_id ? buildGoogleReviewsUrl(details.place_id) : null,
      website: details?.website ?? undefined,
    },
  });
}

export async function lookupAndSetContractorPlaceId(id: Contractor["id"]) {
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) throw new Error("Contractor not found");
  const query = `${contractor.name} ${contractor.addressLine1} ${contractor.city} ${contractor.state}`;
  const match = await textSearchPlace(query);
  if (!match) return contractor;
  return updateContractorPlaceId(id, match.place_id);
}

export async function refreshContractorGoogleData(id: Contractor["id"]) {
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) throw new Error("Contractor not found");
  if (!contractor.googlePlacesId) throw new Error("No place_id set");
  const details = await getPlaceDetails(contractor.googlePlacesId);
  return prisma.contractor.update({
    where: { id },
    data: {
      googleRating: details?.rating ?? null,
      googleNumRatings: details?.user_ratings_total ?? null,
      googleReviewsUrl: details?.place_id ? buildGoogleReviewsUrl(details.place_id) : contractor.googleReviewsUrl,
      website: details?.website ?? undefined,
    },
  });
}

export async function lookupByNameAndZipAndSetPlaceId(
  id: Contractor["id"],
  name: string,
  zip: string,
) {
  const query = `${name} ${zip}`;
  const match = await textSearchPlace(query);
  if (!match) return prisma.contractor.findUnique({ where: { id } });
  return updateContractorPlaceId(id, match.place_id);
}
