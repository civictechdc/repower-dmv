import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { requireAdmin } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ ok: true });
}

export default function AdminDataIndex() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Admin Data</h1>
      <ul className="list-disc pl-6">
        <li><Link to="/admin/contractors" className="text-blue-600 underline">Contractors</Link></li>
        <li><Link to="/admin/data/certifications" className="text-blue-600 underline">Certifications</Link></li>
        <li><Link to="/admin/data/services" className="text-blue-600 underline">Services</Link></li>
        <li><Link to="/admin/data/states" className="text-blue-600 underline">States</Link></li>
      </ul>
    </div>
  );
}


