import { describe, it, expect } from "vitest";
import { createService, deleteService, listServices } from "~/models/service.server";

describe("services model helpers", () => {
  it("creates, lists, and deletes a service", async () => {
    const created = await createService({ name: "Y Test", description: "" });
    const all = await listServices();
    expect(all.some(s => s.id === created.id)).toBe(true);
    await deleteService(created.id);
    const after = await listServices();
    expect(after.some(s => s.id === created.id)).toBe(false);
  });
});


