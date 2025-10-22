import invariant from "tiny-invariant";

const BASE_URL = "https://api.firecrawl.dev/v2";

function getApiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  invariant(key, "FIRECRAWL_API_KEY is required");
  return key as string;
}

export type CrawlStartResponse = {
  success?: boolean;
  id?: string;
  url?: string;
  [key: string]: unknown;
};

export type CrawlItem = {
  url: string;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  [key: string]: unknown;
};

export type CrawlStatusResponse = {
  id?: string;
  status?: string; // queued | active | completed | failed
  url?: string;
  startedAt?: string;
  completedAt?: string | null;
  items?: CrawlItem[];
  [key: string]: unknown;
};

export async function startCrawl(
  url: string,
  opts: {
    includePaths?: string[];
    excludePaths?: string[];
    limit?: number;
    delay?: number;
    maxConcurrency?: number;
    crawlEntireDomain?: boolean;
    maxDiscoveryDepth?: number;
    sitemap?: "skip" | "ignore" | "only";
  } = {},
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const apiKey = getApiKey();
  const outputSchema = {
    type: "object",
    properties: {
      services: {
        type: "array",
        description: "The services this contractor offers",
        items: {
          type: "string",
          enum: [
            "HOME_ENERGY_AUDIT",
            "ELECTRIFICATION_READINESS_PLAN",
            "MANUAL_J_LOAD_CALC",
            "BLOWER_DOOR_TEST",
            "DUCT_LEAKAGE_TEST",
            "HEAT_PUMP_HVAC",
            "GEOTHERMAL_HEAT_PUMP",
            "HEAT_PUMP_WATER_HEATER",
            "EV_CHARGER_L2",
            "NEW_240V_CIRCUIT",
            "PANEL_UPGRADE",
            "ELECTRICAL_SERVICE_UPGRADE",
            "SUBPANEL_INSTALL",
            "SMART_PANEL_LOAD_MGMT",
            "SURGE_PROTECTION",
            "WEATHERIZATION",
            "INSULATION",
            "AIR_SEALING",
            "DUCT_SEALING_BALANCING",
            "VENTILATION_ERV_HRV",
            "IAQ_FILTRATION_UPGRADE",
            "INDUCTION_RANGE_CONVERSION",
            "ELECTRIC_DRYER_CONVERSION",
            "HEAT_PUMP_DRYER_INSTALL",
            "SOLAR_PV_INSTALL",
            "SOLAR_PV_OANDM",
            "BATTERY_STORAGE_INSTALL",
            "BACKUP_TRANSFER_EQUIPMENT",
            "SMART_THERMOSTAT_INSTALL",
            "HOME_ENERGY_MONITOR",
            "DEMAND_RESPONSE_SETUP"
          ]
        }
      },

      certifications: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "STATE_ELECTRICAL_CONTRACTOR_LICENSE",
            "MASTER_ELECTRICIAN_LICENSE",
            "JOURNEYMAN_ELECTRICIAN_LICENSE",
            "HVAC_CONTRACTOR_LICENSE",
            "MECHANICAL_CONTRACTOR_LICENSE",
            "STATE_PLUMBING_CONTRACTOR_LICENSE",
            "MASTER_PLUMBER_LICENSE",
            "GAS_FITTER_LICENSE",
            "GENERAL_CONTRACTOR_LICENSE",
            "HOME_IMPROVEMENT_CONTRACTOR_LICENSE",
            "EPA_608_TYPE_I",
            "EPA_608_TYPE_II",
            "EPA_608_TYPE_III",
            "EPA_608_UNIVERSAL",
            "EPA_LEAD_SAFE_RRP_FIRM",
            "BPI_BUILDING_ANALYST",
            "BPI_ENVELOPE_PROFESSIONAL",
            "BPI_HEATING_PROFESSIONAL",
            "BPI_AC_HEATPUMP_PROFESSIONAL",
            "BPI_AIR_LEAKAGE_CONTROL_INSTALLER",
            "DOE_HEP_ENERGY_AUDITOR",
            "DOE_HEP_QUALITY_CONTROL_INSPECTOR",
            "RESNET_HERS_RATER",
            "RESNET_RATING_FIELD_INSPECTOR",
            "ACCA_QUALITY_INSTALLATION",
            "ACCA_QA_PARTICIPANT",
            "NATE_CERTIFIED_TECHNICIAN",
            "NABCEP_PV_INSTALLATION_PROFESSIONAL",
            "NABCEP_PV_TECHNICAL_SALES",
            "NABCEP_ENERGY_STORAGE",
            "EVITP",
            "IGSHPA_ACCREDITED_INSTALLER",
            "OSHA_10",
            "OSHA_30",
            "TESLA_WALL_CONNECTOR_CERTIFIED",
            "TESLA_POWERWALL_CERTIFIED",
            "ENPHASE_STORAGE_CERTIFIED",
            "SOLAREDGE_STORAGE_CERTIFIED",
            "MITSUBISHI_DIAMOND_CONTRACTOR",
            "DAIKIN_COMFORT_PRO",
            "FUJITSU_ELITE",
            "TRANE_COMFORT_SPECIALIST",
            "CARRIER_FACTORY_AUTHORIZED",
            "LENNOX_PREMIER_DEALER",
            "RHEEM_PRO_PARTNER",
            "QMERIT_CERTIFIED_SOLUTION_PARTNER",
            "ENERGY_STAR_HPWES_PARTNER",
            "UTILITY_TRADE_ALLY"
          ],
          description: "The general certifications cited"
        }
      },
      accredited: {
        type: "array",
        items: {
          type: "string",
          description: "DOE 25C qualified accreditation",
          enum: [
            "CEA",
            "HEP",
            "BPI-ALCI",
            "BPI-ACHPP"
          ]
        },
        description: "The DOE 25C accredited certifications cited"
      },
      summary: { type: "string", description: "A high level summary of the page content" },
    },
  };

  const body: any = {
    url,
    prompt: "Your mission is to crawl the website to find information about the company's services and certifications. Prioritize pages like 'Services', 'About Us', and 'Certifications'. Avoid crawling pages that list multiple physical locations, blog articles, or contact forms. From the crawled pages, extract the services, accredited certifications, and general certifications this contractor has. Ignore everything else.",
    limit: typeof opts.limit === "number" ? opts.limit : 10,
    crawlEntireDomain: typeof opts.crawlEntireDomain === "boolean" ? opts.crawlEntireDomain : true,
    delay: opts.delay,
    allowSubdomains: true,
    maxConcurrency: opts.maxConcurrency,
    sitemap: opts.sitemap,
    maxDiscoveryDepth: opts.maxDiscoveryDepth,
    scrapeOptions: {
      formats: ['markdown'],
      onlyMainContent: true,
      parsers: [],
      removeBase64Images: true,
      blockAds: true,
      waitFor: 0,
      storeInCache: true,
    },
  };

  // Only include paths if they are provided and not empty
  if (opts.includePaths && opts.includePaths.length > 0) {
    body.includePaths = opts.includePaths;
  }
  if (opts.excludePaths && opts.excludePaths.length > 0) {
    body.excludePaths = opts.excludePaths;
  }
  const res = await fetchImpl(`${BASE_URL}/crawl`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  } as RequestInit);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl start failed: ${res.status} ${txt}`);
  }
  const data = (await res.json()) as CrawlStartResponse;
  if (!data.id) throw new Error("Firecrawl did not return an id");
  return data.id as string;
}

export async function getCrawl(
  crawlId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CrawlStatusResponse> {
  const apiKey = getApiKey();
  const res = await fetchImpl(`${BASE_URL}/crawl/${encodeURIComponent(crawlId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  } as RequestInit);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl get failed: ${res.status} ${txt}`);
  }
  return (await res.json()) as CrawlStatusResponse;
}

export async function getCrawlErrors(
  crawlId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
  const apiKey = getApiKey();
  const res = await fetchImpl(`${BASE_URL}/crawl/${encodeURIComponent(crawlId)}/errors`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  } as RequestInit);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl errors failed: ${res.status} ${txt}`);
  }
  return await res.json();
}

export async function listActiveCrawls(
  fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
  const apiKey = getApiKey();
  const res = await fetchImpl(`${BASE_URL}/crawl/active`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  } as RequestInit);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl active failed: ${res.status} ${txt}`);
  }
  return await res.json();
}


