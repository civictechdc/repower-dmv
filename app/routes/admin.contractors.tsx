import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useSearchParams, useRevalidator } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";

import { listAllContractorsForAdmin, setContractorDraftStatus, deleteContractorById, updateContractorPlaceId, lookupAndSetContractorPlaceId, refreshContractorGoogleData, lookupByNameAndZipAndSetPlaceId, bulkRefreshAllContractorsGoogle, previewTopGoogleCandidates, clearContractorPlaceId, updateContractorByAdmin, startContractorWebsiteCrawl, pollContractorCrawl, analyzeContractorCrawl, getContractorCrawlPreview } from "~/models/contractor.server";
import { listStates } from "~/models/state.server";
import { listServices } from "~/models/service.server";
import { listCertifications } from "~/models/certification.server";
import { requireAdmin } from "~/session.server";

function CandidatePanel({ contractorId }: { contractorId: string }) {
  const fetcher = useFetcher();
  const candidates = (fetcher.data as any)?.candidates ?? [];
  const queries = (fetcher.data as any)?.queries ?? [];
  return (
    <details className="mt-2 rounded border border-gray-200 p-2" open={candidates.length > 0 || fetcher.state !== "idle" || !!fetcher.data}>
      <summary className="cursor-pointer text-sm text-gray-700">Show candidates</summary>
      <div className="mt-2 space-y-2">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="preview-google-candidates" />
          <input type="hidden" name="id" value={contractorId} />
          <button className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">Load candidates</button>
        </fetcher.Form>
        {candidates.length ? (
          <ul className="space-y-2">
            {candidates.slice(0, 3).map((cand: any) => (
              <li key={cand.place_id} className="rounded border border-gray-100 p-2">
                <div className="text-sm font-medium">{cand.name}</div>
                <div className="text-xs text-gray-600">{cand.formatted_address || '-'}</div>
                <div className="text-xs text-gray-600">rating: {cand.rating ?? '-'} ({cand.user_ratings_total ?? 0})</div>
                <Form method="post" replace className="mt-1">
                  <input type="hidden" name="intent" value="save-place-id" />
                  <input type="hidden" name="id" value={contractorId} />
                  <input type="hidden" name="place_id" value={cand.place_id} />
                  <button className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">Use this</button>
                </Form>
              </li>
            ))}
          </ul>
        ) : fetcher.data ? (
          <div className="text-xs text-gray-600">
            No candidates found. Tried queries: {queries.join(" · ") || "-"}
          </div>
        ) : null}
      </div>
    </details>
  );
}

type AdminContractorItem = {
  id: string;
  name: string;
  city: string;
  state: string;
  website: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string;
  addressLine2?: string | null;
  isDraft: boolean;
  googlePlacesId: string | null;
  googleRating: number | null;
  googleNumRatings: number | null;
  zip: string | null;
  stateIds?: number[];
  serviceIds?: number[];
  certificationIds?: number[];
  googleMapsUri?: string | null;
  googleBusinessStatus?: string | null;
  googlePhoneNumber?: string | null;
  googlePrimaryType?: string | null;
  googlePrimaryTypeDisplayName?: string | null;
  googleTypes?: any | null;
  googleLocation?: any | null;
  googleEditorialSummary?: any | null;
  googleGenerativeSummary?: any | null;
  googleReviewSummary?: any | null;
  // Crawl fields
  crawlId?: string | null;
  crawlStatus?: string | null;
  crawlSummary?: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const [all, states, services, certs] = await Promise.all([
    listAllContractorsForAdmin(),
    listStates(),
    listServices(),
    listCertifications(),
  ]);
  const contractors: AdminContractorItem[] = all.map((c: any) => ({
    id: c.id,
    name: c.name,
    city: c.city,
    state: c.state,
    website: c.website,
    email: c.email ?? null,
    phone: c.phone ?? null,
    addressLine1: c.addressLine1,
    addressLine2: c.addressLine2 ?? null,
    isDraft: Boolean(c.isDraft),
    googlePlacesId: (c as any).googlePlacesId ?? null,
    googleRating: (c as any).googleRating ?? null,
    googleNumRatings: (c as any).googleNumRatings ?? null,
    zip: (c as any).zip ?? null,
    stateIds: (c.statesServed || []).map((s: any) => s.id),
    serviceIds: (c.services || []).map((s: any) => s.id),
    certificationIds: (c.certifications || []).map((s: any) => s.id),
    googleMapsUri: (c as any).googleMapsUri ?? null,
    googleBusinessStatus: (c as any).googleBusinessStatus ?? null,
    googlePhoneNumber: (c as any).googlePhoneNumber ?? null,
    googlePrimaryType: (c as any).googlePrimaryType ?? null,
    googlePrimaryTypeDisplayName: (c as any).googlePrimaryTypeDisplayName ?? null,
    googleTypes: (c as any).googleTypes ?? null,
    googleLocation: (c as any).googleLocation ?? null,
    googleEditorialSummary: (c as any).googleEditorialSummary ?? null,
    googleGenerativeSummary: (c as any).googleGenerativeSummary ?? null,
    googleReviewSummary: (c as any).googleReviewSummary ?? null,
    crawlId: (c as any).crawlId ?? null,
    crawlStatus: (c as any).crawlStatus ?? null,
    crawlSummary: (c as any).crawlSummary ?? null,
  }));
  return json({ contractors, states, services, certs });
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

  if (intent === "save-place-id") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const placeId = form.get("place_id")?.toString() || "";
    if (!placeId) return json({ error: "Missing place_id" }, { status: 400 });
    await updateContractorPlaceId(id, placeId);
    return redirect(next);
  }

  if (intent === "clear-place-id") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    await clearContractorPlaceId(id);
    return redirect(next);
  }

  if (intent === "lookup-place-id") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    await lookupAndSetContractorPlaceId(id);
    return redirect(next);
  }

  if (intent === "preview-google-candidates") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const res = await previewTopGoogleCandidates(id);
    return json(res);
  }

  if (intent === "refresh-google") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    await refreshContractorGoogleData(id);
    return redirect(next);
  }

  if (intent === "bulk-refresh-google") {
    const summary = await bulkRefreshAllContractorsGoogle();
    const msg = new URLSearchParams();
    msg.set("msg", `Bulk: refreshed ${summary.refreshedExisting}, looked up ${summary.lookedUpNew}`);
    return redirect(`${next}?${msg.toString()}`);
  }

  if (intent === "start-crawl") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const result = await startContractorWebsiteCrawl(id);
    return json({ success: true, result });
  }

  if (intent === "poll-crawl") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const result = await pollContractorCrawl(id);
    return json({ success: true, result });
  }

  if (intent === "analyze-crawl") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const result = await analyzeContractorCrawl(id);
    return json({ success: true, result });
  }

  if (intent === "crawl-preview") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const data = await getContractorCrawlPreview(id);
    return json(data);
  }

  if (intent === "update-contractor") {
    if (!id) return json({ error: "Missing id" }, { status: 400 });
    const get = (k: string) => form.get(k)?.toString().trim();
    const getNumArray = (k: string) => {
      const arr = form.getAll(k).map(String).map((s) => s.trim()).filter(Boolean);
      return arr.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
    };
    const parseJsonOrNull = (k: string) => {
      const raw = get(k) || "";
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    };
    const stringOrJson = (k: string) => {
      const raw = get(k) || "";
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return raw; // treat as plain string
      }
    };

    await updateContractorByAdmin(id, {
      name: get("name") || undefined,
      email: get("email") || null,
      phone: get("phone") || null,
      website: get("website") || null,
      addressLine1: get("addressLine1") || undefined,
      addressLine2: get("addressLine2") || null,
      city: get("city") || undefined,
      state: get("state") || undefined,
      zip: get("zip") || undefined,
      isDraft: get("isDraft") === "true" ? true : get("isDraft") === "false" ? false : undefined,
      googlePlacesId: get("googlePlacesId") || null,
      googleRating: get("googleRating") ? Number(get("googleRating")) : null,
      googleNumRatings: get("googleNumRatings") ? Number(get("googleNumRatings")) : null,
      googleReviewsUrl: get("googleReviewsUrl") || null,
      googleMapsUri: get("googleMapsUri") || null,
      googleBusinessStatus: get("googleBusinessStatus") || null,
      googlePhoneNumber: get("googlePhoneNumber") || null,
      googlePrimaryType: get("googlePrimaryType") || null,
      googlePrimaryTypeDisplayName: get("googlePrimaryTypeDisplayName") || null,
      googleTypes: parseJsonOrNull("googleTypes"),
      googleLocation: parseJsonOrNull("googleLocation"),
      googleEditorialSummary: parseJsonOrNull("googleEditorialSummary"),
      googleGenerativeSummary: stringOrJson("googleGenerativeSummary"),
      googleReviewSummary: parseJsonOrNull("googleReviewSummary"),
      stateIds: getNumArray("stateIds"),
      serviceIds: getNumArray("serviceIds"),
      certificationIds: getNumArray("certificationIds"),
    });
    return redirect(next);
  }

  if (!id || typeof enable === "undefined") {
    return json({ error: "Missing parameters" }, { status: 400 });
  }

  const isDraft = enable === "true" ? false : true;
  await setContractorDraftStatus(id, isDraft);
  return redirect(next);
}

export function shouldRevalidate(args: any) {
  try {
    const intent = args.formData?.get?.("intent");
    if (intent === "preview-google-candidates" || intent === "crawl-preview") return false;
  } catch (_) { }
  return true;
}

export default function AdminContractors() {
  const { contractors, states, services, certs } = useLoaderData<typeof loader>() as any;
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = editingId ? contractors.find((x: any) => x.id === editingId) : null;
  const [crawlForId, setCrawlForId] = useState<string | null>(null);
  const crawlFetcher = useFetcher();
  const crawlData = (crawlFetcher.data as any) || null;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [search] = useSearchParams();
  const msg = search.get("msg");
  const revalidator = useRevalidator();

  // Fetchers for crawl actions
  const startCrawlFetcher = useFetcher();
  const pollCrawlFetcher = useFetcher();
  const analyzeCrawlFetcher = useFetcher();

  // Automatic polling for active crawls
  const autoPollFetcher = useFetcher();

  // Track last revalidation time to prevent hammering
  const lastRevalidationRef = useRef<number>(0);

  useEffect(() => {
    const activeCrawls = contractors.filter((c: AdminContractorItem) =>
      c.crawlStatus && c.crawlStatus !== 'completed' && c.crawlStatus !== 'failed'
    );
    if (activeCrawls.length === 0) return;

    const interval = setInterval(() => {
      // Poll all active crawls
      activeCrawls.forEach((contractor: AdminContractorItem) => {
        autoPollFetcher.submit(
          { intent: 'poll-crawl', id: contractor.id },
          { method: 'post' }
        );
      });

      // Revalidate immediately after submitting polls (throttled)
      const now = Date.now();
      if (now - lastRevalidationRef.current > 10000) {
        lastRevalidationRef.current = now;
        revalidator.revalidate();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [contractors, autoPollFetcher, revalidator]);
  return (
    <>
      <div className="mx-auto w-full max-w-none px-4">
        <h1 className="mb-4 text-2xl font-bold">Contractors Admin</h1>
        {msg ? (
          <div className="mb-4 rounded border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {msg}
          </div>
        ) : null}
        <p className="mb-6 text-sm text-gray-600">Toggle visibility of contractor listings. Visible entries have draft status = 0.</p>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {contractors.some((c: AdminContractorItem) => c.crawlStatus && c.crawlStatus !== 'completed' && c.crawlStatus !== 'failed') && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Auto-polling active crawls
              </div>
            )}
          </div>
          <Form method="post" replace>
            <input type="hidden" name="intent" value="bulk-refresh-google" />
            <button className="rounded bg-purple-700 px-3 py-1 text-sm text-white hover:bg-purple-800">Bulk Update Google Data</button>
          </Form>
        </div>
        <div className="w-full overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City/State</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Google</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {contractors.map((c: AdminContractorItem) => {
                const isVisible = c.isDraft === false || c.isDraft === true ? !c.isDraft : Boolean(!c.isDraft);
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.city}, {c.state}</td>
                    <td className="px-4 py-3">{c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="underline">Website</a> : "-"}</td>
                    <td className="px-4 py-3">{isVisible ? "Enabled" : "Disabled"}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">place_id: {c.googlePlacesId || "-"}</div>
                        <div className="text-xs text-gray-600">rating: {c.googleRating ?? "-"} ({c.googleNumRatings ?? 0})</div>
                        <div className="flex flex-wrap gap-2">
                          <Form method="post" replace className="inline">
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="intent" value="lookup-place-id" />
                            <button className="rounded bg-slate-600 px-3 py-1 text-sm text-white hover:bg-slate-700">Lookup</button>
                          </Form>
                          <Form method="post" replace className="inline">
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="intent" value="refresh-google" />
                            <button className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700">Refetch</button>
                          </Form>
                        </div>
                        <Form method="post" replace className="flex gap-2">
                          <input type="hidden" name="intent" value="save-place-id" />
                          <input type="hidden" name="id" value={c.id} />
                          <input name="place_id" defaultValue={c.googlePlacesId || ""} placeholder="place_id" className="w-44 rounded border p-1 text-sm" />
                          <button className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300">Save</button>
                        </Form>
                        <Form method="post" replace className="inline" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { if (!confirm("Clear the Google place_id for this contractor?")) { e.preventDefault(); } }}>
                          <input type="hidden" name="intent" value="clear-place-id" />
                          <input type="hidden" name="id" value={c.id} />
                          <button className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800 hover:bg-orange-200">Clear place_id</button>
                        </Form>
                        {/* Website Crawl */}
                        <div className="mt-3 rounded border border-gray-100 p-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-700">Crawl:</span>
                            {c.crawlStatus ? (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                c.crawlStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                c.crawlStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                c.crawlStatus === 'active' || c.crawlStatus === 'scraping' ? 'bg-blue-100 text-blue-800' :
                                c.crawlStatus === 'queued' ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800' // Default to blue for unknown active statuses
                              }`}>
                                {c.crawlStatus}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                            {c.crawlId && <span className="text-gray-500">(id: {c.crawlId})</span>}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <startCrawlFetcher.Form method="post" className="inline">
                              <input type="hidden" name="id" value={c.id} />
                              <input type="hidden" name="intent" value="start-crawl" />
                              <button
                                disabled={startCrawlFetcher.state !== "idle"}
                                className={`rounded px-3 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  c.crawlStatus && c.crawlStatus !== 'failed'
                                    ? 'bg-orange-600 hover:bg-orange-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                              >
                                {startCrawlFetcher.state !== "idle" ? "Starting..." : c.crawlStatus && c.crawlStatus !== 'failed' ? "Restart Crawl" : "Start Crawl"}
                              </button>
                            </startCrawlFetcher.Form>
                            {c.crawlStatus && c.crawlStatus !== 'completed' && c.crawlStatus !== 'failed' && (
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                Auto-polling
                              </div>
                            )}
                            <analyzeCrawlFetcher.Form method="post" className="inline">
                              <input type="hidden" name="id" value={c.id} />
                              <input type="hidden" name="intent" value="analyze-crawl" />
                              <button
                                disabled={analyzeCrawlFetcher.state !== "idle" || c.crawlStatus !== 'completed'}
                                className="rounded bg-fuchsia-600 px-3 py-1 text-xs text-white hover:bg-fuchsia-700 disabled:bg-fuchsia-400 disabled:cursor-not-allowed"
                              >
                                {analyzeCrawlFetcher.state !== "idle" ? "Analyzing..." : "Analyze"}
                              </button>
                            </analyzeCrawlFetcher.Form>
                            <button type="button" onClick={() => { setCrawlForId(c.id); crawlFetcher.submit({ intent: 'crawl-preview', id: c.id }, { method: 'post' }); }} className="rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200">View Details</button>
                          </div>
                          {c.crawlSummary ? (
                            <div className="mt-2 text-xs text-gray-700">
                              <div className="font-medium">Crawl Summary</div>
                              <div className="whitespace-pre-wrap">{c.crawlSummary}</div>
                            </div>
                          ) : null}
                        </div>
                        <CandidatePanel contractorId={c.id} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button type="button" onClick={() => setEditingId(c.id)} className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700">
                          Edit
                        </button>
                        <Form method="post" replace className="inline">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="enable" value={(!isVisible).toString()} />
                          <button className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white shadow-sm ${isVisible ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                            {isVisible ? "Disable" : "Enable"}
                          </button>
                        </Form>
                        <Form method="post" replace className="inline" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { if (!confirm("Delete this contractor?")) { e.preventDefault(); } }}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="intent" value="delete" />
                          <button className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rose-700">
                            Delete
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {editing ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingId(null)}></div>
          <div className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto max-w-5xl bg-white p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Contractor</h2>
                <button type="button" onClick={() => setEditingId(null)} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Close</button>
              </div>
              {/* Summaries preview */}
              <div className="mb-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                <div className="mb-1 font-medium">Summaries</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Generative</div>
                    <div>
                      {typeof (editing as any)?.googleGenerativeSummary === 'string'
                        ? (editing as any).googleGenerativeSummary
                        : (editing as any)?.googleGenerativeSummary?.overview?.text || <span className="text-gray-400">No generative summary</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Editorial</div>
                    <div>{(editing as any)?.googleEditorialSummary?.overview?.text || <span className="text-gray-400">No editorial summary</span>}</div>
                  </div>
                </div>
              </div>
              <Form method="post" replace className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input type="hidden" name="intent" value="update-contractor" />
                <input type="hidden" name="id" value={editing.id} />
                <label className="text-xs">Name<input name="name" defaultValue={editing.name} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">Email<input name="email" defaultValue={editing.email ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">Phone<input name="phone" defaultValue={editing.phone ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">Website<input name="website" defaultValue={editing.website ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">Address 1<input name="addressLine1" defaultValue={editing.addressLine1 ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">Address 2<input name="addressLine2" defaultValue={editing.addressLine2 ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">City<input name="city" defaultValue={editing.city ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">State
                  <select name="state" defaultValue={editing.state} className="w-full rounded border p-1 text-sm">
                    {states.map((s: any) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">Zip<input name="zip" defaultValue={editing.zip ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                <label className="text-xs">Visible
                  <select name="isDraft" defaultValue={(editing.isDraft).toString()} className="w-full rounded border p-1 text-sm">
                    <option value="false">Yes</option>
                    <option value="true">No</option>
                  </select>
                </label>

                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="text-xs">States Served
                    <select name="stateIds" multiple defaultValue={(editing.stateIds || []).map(String)} className="h-28 w-full rounded border p-1 text-sm">
                      {states.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">Services
                    <select name="serviceIds" multiple defaultValue={(editing.serviceIds || []).map(String)} className="h-28 w-full rounded border p-1 text-sm">
                      {services.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">Certifications
                    <select name="certificationIds" multiple defaultValue={(editing.certificationIds || []).map(String)} className="h-28 w-full rounded border p-1 text-sm">
                      {certs.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.shortName}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="col-span-1 sm:col-span-2 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="text-xs">Google Place ID<input name="googlePlacesId" defaultValue={editing.googlePlacesId ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Google Reviews URL<input name="googleReviewsUrl" defaultValue={(editing as any).googleReviewsUrl ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Google Rating<input name="googleRating" defaultValue={editing.googleRating ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Google Num Ratings<input name="googleNumRatings" defaultValue={editing.googleNumRatings ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Maps URI<input name="googleMapsUri" defaultValue={(editing as any).googleMapsUri ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Business Status<input name="googleBusinessStatus" defaultValue={(editing as any).googleBusinessStatus ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Phone Number<input name="googlePhoneNumber" defaultValue={(editing as any).googlePhoneNumber ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Primary Type<input name="googlePrimaryType" defaultValue={(editing as any).googlePrimaryType ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Primary Type Name<input name="googlePrimaryTypeDisplayName" defaultValue={(editing as any).googlePrimaryTypeDisplayName ?? ''} className="w-full rounded border p-1 text-sm" /></label>
                  <label className="text-xs">Types (JSON)<textarea name="googleTypes" defaultValue={JSON.stringify((editing as any).googleTypes ?? null)} className="h-24 w-full rounded border p-1 text-sm"></textarea></label>
                  <label className="text-xs">Location (JSON)<textarea name="googleLocation" defaultValue={JSON.stringify((editing as any).googleLocation ?? null)} className="h-24 w-full rounded border p-1 text-sm"></textarea></label>
                  <label className="text-xs">Editorial Summary (JSON)<textarea name="googleEditorialSummary" defaultValue={JSON.stringify((editing as any).googleEditorialSummary ?? null)} className="h-24 w-full rounded border p-1 text-sm"></textarea></label>
                  <label className="text-xs">Generative Summary (string or JSON)
                    <textarea name="googleGenerativeSummary" defaultValue={
                      typeof (editing as any).googleGenerativeSummary === 'string'
                        ? (editing as any).googleGenerativeSummary
                        : JSON.stringify((editing as any).googleGenerativeSummary ?? null)
                    } className="h-24 w-full rounded border p-1 text-sm"></textarea>
                  </label>
                  <label className="text-xs">Review Summary (JSON)<textarea name="googleReviewSummary" defaultValue={JSON.stringify((editing as any).googleReviewSummary ?? null)} className="h-24 w-full rounded border p-1 text-sm"></textarea></label>
                </div>

                <div className="col-span-1 sm:col-span-2 mt-3 flex items-center gap-2">
                  <button className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">Save Changes</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300">Cancel</button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      ) : null}
      {crawlForId ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCrawlForId(null)}></div>
          <div className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto max-w-5xl bg-white p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Crawl Preview</h2>
                <button type="button" onClick={() => setCrawlForId(null)} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">Close</button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
                  <div>
                    {crawlData?.crawlStatus ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        crawlData.crawlStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        crawlData.crawlStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        crawlData.crawlStatus === 'active' || crawlData.crawlStatus === 'scraping' ? 'bg-blue-100 text-blue-800' :
                        crawlData.crawlStatus === 'queued' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800' // Default to blue for unknown active statuses
                      }`}>
                        {crawlData.crawlStatus}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Pages</div>
                  <div>{crawlData?.pagesCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Started</div>
                  <div>{crawlData?.crawlStartedAt ? new Date(crawlData.crawlStartedAt).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Completed</div>
                  <div>{crawlData?.crawlCompletedAt ? new Date(crawlData.crawlCompletedAt).toLocaleString() : '-'}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 font-medium">Sample Pages</div>
                <div className="grid grid-cols-1 gap-2">
                  {(crawlData?.samplePages || []).map((p: any, idx: number) => (
                    <div key={idx} className="rounded border border-gray-200 p-2">
                      <div className="text-xs text-gray-600 break-all">{p.url}</div>
                      <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-gray-800">{p.markdownSnippet || ''}</pre>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 font-medium">Errors</div>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-2 text-xs">{JSON.stringify(crawlData?.errors ?? null, null, 2)}</pre>
              </div>
              <div className="mt-4">
                <div className="mb-1 font-medium">Analysis Summary</div>
                <div className="rounded border border-gray-200 bg-gray-50 p-2 text-sm whitespace-pre-wrap">{crawlData?.summary || 'No analysis yet.'}</div>
              </div>
              {crawlData?.extract ? (
                <div className="mt-3">
                  <div className="mb-1 text-sm font-medium">Extract JSON</div>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-2 text-xs">{JSON.stringify(crawlData.extract, null, 2)}</pre>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {crawlData?.crawlStatus && crawlData.crawlStatus !== 'completed' && crawlData.crawlStatus !== 'failed' && (
                  <div className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Crawl in progress - auto-updating
                  </div>
                )}
                <analyzeCrawlFetcher.Form method="post" className="inline">
                  <input type="hidden" name="id" value={crawlForId} />
                  <input type="hidden" name="intent" value="analyze-crawl" />
                  <button
                    disabled={analyzeCrawlFetcher.state !== "idle" || (crawlData?.crawlStatus !== 'completed')}
                    className={`rounded px-3 py-1 text-sm text-white ${analyzeCrawlFetcher.state !== "idle" ? 'bg-fuchsia-400' : 'bg-fuchsia-600 hover:bg-fuchsia-700'} ${crawlData?.crawlStatus !== 'completed' ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {analyzeCrawlFetcher.state !== "idle" ? 'Analyzing…' : 'Run Analysis'}
                  </button>
                </analyzeCrawlFetcher.Form>
                <button type="button" onClick={() => { crawlFetcher.submit({ intent: 'crawl-preview', id: crawlForId! }, { method: 'post' }) }} className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200">Refresh</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
