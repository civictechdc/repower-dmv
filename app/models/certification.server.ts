import type { Certification } from "@prisma/client";
import { prisma } from "~/db.server";

export async function listCertifications(): Promise<Certification[]> {
  return prisma.certification.findMany({ orderBy: { name: "asc" } });
}

export async function createCertification(data: {
  name: string;
  shortName: string;
  description: string;
}): Promise<Certification> {
  return prisma.certification.create({ data });
}

export async function deleteCertification(id: number): Promise<Certification> {
  return prisma.certification.delete({ where: { id } });
}


