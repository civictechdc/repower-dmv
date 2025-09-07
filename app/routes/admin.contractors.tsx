import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { listAllContractorsForAdmin, setContractorDraftStatus, deleteContractorById } from "~/models/contractor.server";
import { requireAdmin } from "~/session.server";

type AdminContractorItem = {
  id: string;
  name: string;
  city: string;
  state: string;
  website: string | null;
  isDraft: number;
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const all = await listAllContractorsForAdmin();
  const contractors: AdminContractorItem[] = all.map((c) => ({
    id: c.id,
    name: c.name,
    city: c.city,
    state: c.state,
    website: c.website,
    isDraft: c.isDraft,
  }));
  return json({ contractors });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = form.get("id")?.toString();
  const next = form.get("next")?.toString() ?? "/admin/contractors";
  const enable = form.get("enable")?.toString();
  const intent = form.get("intent")?.toString();

  if (intent === "delete") {
    if (!id) {
      return json({ error: "Missing id" }, { status: 400 });
    }
    await deleteContractorById(id);
    return redirect(next);
  }

  if (!id || typeof enable === "undefined") {
    return json({ error: "Missing parameters" }, { status: 400 });
  }

  const isDraft = enable === "true" ? 0 : 1;
  await setContractorDraftStatus(id, isDraft);
  return redirect(next);
}

export default function AdminContractors() {
  const { contractors } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-bold">Contractors Admin</h1>
      <p className="mb-6 text-sm text-gray-600">Toggle visibility of contractor listings. Visible entries have draft status = 0.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City/State</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {contractors.map((c: AdminContractorItem) => {
              const isVisible = c.isDraft === 0;
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.city}, {c.state}</td>
                  <td className="px-4 py-3">{c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="underline">Website</a> : "-"}</td>
                  <td className="px-4 py-3">{isVisible ? "Enabled" : "Disabled"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Form method="post" replace className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="enable" value={(!isVisible).toString()} />
                      <button className={`rounded px-3 py-1 text-sm ${isVisible ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"}`}>
                        {isVisible ? "Disable" : "Enable"}
                      </button>
                    </Form>
                    <Form method="post" replace className="inline" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { if (!confirm("Delete this contractor?")) { e.preventDefault(); } }}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="intent" value="delete" />
                      <button className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700">
                        Delete
                      </button>
                    </Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

