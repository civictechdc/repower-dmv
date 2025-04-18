import { Contractor } from "@prisma/client";

import { prisma } from "~/db.server";
import { Certification, Service, State } from "~/types";

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

export const getContractors = async (page = 1, pageSize = 10) => {
  try {
    const contractors = await prisma.contractor.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        certifications: true,
        services: true,
        statesServed: true,
      },
      where: {
        isDraft: 0
      }
    });

    const totalContractors = await prisma.contractor.count();

    return {
      contractors,
      totalPages: Math.ceil(totalContractors / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching contractors:", error);
    throw new Error("Failed to fetch contractors");
  }
};

export async function createContractor(data) {
  try {
    const statesServed = []
    for (const stateName of data["statesServed"]) {
      const state: State = await prisma.state.findFirst({where: {name: stateName}});
      if (state == null) {
        throw new Error("Could not find state " + stateName);
      }
      statesServed.push(state);
    }
    const services = [];
    for (const serviceName of data["services"]) {
      const service: Service = await prisma.service.findFirst({where: {name: serviceName}});
      if (service == null) {
        throw new Error("Could not find service " + serviceName);
      }
      services.push(service);
    }
    const certifications = [];
    for (const certificationName of data["certifications"]) {
      const certification: Certification = await prisma.certification.findFirst({where: {shortName: certificationName}});
      if (certification == null) {
        throw new Error("Could not find certification " + certificationName);
      }
      certifications.push(certification);
    }

    return prisma.contractor.create({
      data: {
        ...data,
        statesServed: {
          connect: statesServed 
        },
        services: {
          connect: services
        },
        certifications: {
          connect: certifications
        },
        isDraft: 1
      }
    });
  } catch (error) {
    console.log("Error creating contractor", error);
    throw new Error("Could not create contractor listing");
  }
};
