import { Contractor } from "@prisma/client";
import { prisma } from "~/db.server";

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
      throw new Error('Failed to fetch contractor');
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
        throw new Error('Failed to fetch contractor');
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
      });
  
      const totalContractors = await prisma.contractor.count();
      
      return {
        contractors,
        totalPages: Math.ceil(totalContractors / pageSize),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching contractors:', error);
      throw new Error('Failed to fetch contractors');
    }
  };
  

  
