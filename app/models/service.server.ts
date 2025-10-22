import type { Service } from "@prisma/client";
import { prisma } from "~/db.server";

export async function listServices(): Promise<Service[]> {
  return prisma.service.findMany({ orderBy: { name: "asc" } });
}

export async function createService(data: {
  name: string;
  description: string;
}): Promise<Service> {
  return prisma.service.create({ data });
}

export async function deleteService(id: number): Promise<Service> {
  return prisma.service.delete({ where: { id } });
}


