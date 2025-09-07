import { describe, it, expect } from "vitest";
import { createState, deleteState, listStates } from "~/models/state.server";

describe("states model helpers", () => {
  it("creates, lists, and deletes a state", async () => {
    const created = await createState({ name: "ZZ" });
    const all = await listStates();
    expect(all.some(s => s.id === created.id)).toBe(true);
    await deleteState(created.id);
    const after = await listStates();
    expect(after.some(s => s.id === created.id)).toBe(false);
  });
});

