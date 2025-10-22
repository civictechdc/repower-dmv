import { describe, it, expect } from "vitest";
import { createCertification, deleteCertification, listCertifications } from "~/models/certification.server";

describe("certifications model helpers", () => {
  it("creates, lists, and deletes a certification", async () => {
    const created = await createCertification({ name: "X Test", shortName: "XT", description: "" });
    const all = await listCertifications();
    expect(all.some(c => c.id === created.id)).toBe(true);
    await deleteCertification(created.id);
    const after = await listCertifications();
    expect(after.some(c => c.id === created.id)).toBe(false);
  });
});


