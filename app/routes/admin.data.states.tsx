import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { createState, deleteState, listStates } from "~/models/state.server";
import { requireAdmin } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const states = await listStates();
  return json({ states });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = form.get("intent")?.toString();
  if (intent === "create") {
    const name = form.get("name")?.toString() || "";
    if (!name) return json({ error: "Missing fields" }, { status: 400 });
    await createState({ name });
    return redirect("/admin/data/states");
  }
  if (intent === "delete") {
    const id = Number(form.get("id"));
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    await deleteState(id);
    return redirect("/admin/data/states");
  }
  return json({ error: "Unknown intent" }, { status: 400 });
}

export default function AdminStates() {
  const { states } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-bold">States</h1>
      <Form method="post" className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input className="rounded border p-2" name="name" placeholder="Name" />
        <input type="hidden" name="intent" value="create" />
        <button className="rounded bg-blue-600 px-4 py-2 text-white md:w-40">Add</button>
      </Form>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {states.map((s: any) => (
            <tr key={s.id}>
              <td className="px-4 py-3">{s.name}</td>
              <td className="px-4 py-3">
                <Form method="post" replace onSubmit={(e) => { if (!confirm("Delete this state?")) e.preventDefault(); }}>
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={s.id} />
                  <button className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Delete</button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


