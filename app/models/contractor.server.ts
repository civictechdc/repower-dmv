import { Contractor, ContractorStatus } from "@prisma/client";

import { prisma } from "~/db.server";
import { sortByDistanceFromZip } from "~/lib/distances";
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

export const getContractors = async ({zip, certifications, services, stateServed, status}:ContractorFilters, page = 1, pageSize = 10) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const filterBy: any = {};
  
  if (status && status.length > 0) {
    filterBy.status = { in: status };
  } else {
    filterBy.status = ContractorStatus.APPROVED;
  }

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
        status: ContractorStatus.DRAFT,
      },
    });
  } catch (error) {
    console.error("Error creating contractor", error);
    throw new Error("Could not create contractor listing");
  }
}
