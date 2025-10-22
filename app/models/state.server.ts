import type { State } from "@prisma/client";
import { prisma } from "~/db.server";

export async function listStates(): Promise<State[]> {
  return prisma.state.findMany({ orderBy: { name: "asc" } });
}

export async function createState(data: { name: string }): Promise<State> {
  return prisma.state.create({ data });
}

export async function deleteState(id: number): Promise<State> {
  return prisma.state.delete({ where: { id } });
}


