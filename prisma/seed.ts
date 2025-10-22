import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// todo: once we have real contractors move faker to a dev dependency

const prisma = new PrismaClient();

// __dirname is not defined in ESM; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // OK if this fails
  });
  // todo: don't delete real data when this gets re-run!
  await prisma.contractor.deleteMany({}).catch(() => {
    // OK if this fails
  });
  await prisma.service.deleteMany({}).catch(() => {
    // OK if this fails
  });
  await prisma.certification.deleteMany({}).catch(() => {
    // OK if this fails
  });
  await prisma.state.deleteMany({}).catch(() => {
    // OK if this fails
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  // Generate services
  const services: Prisma.ServiceCreateInput[] = [
    { name: "Electrical", description: "Electrical tasks and upgrades" },
    {
      name: "Energy Audit",
      description:
        "Evaluate your house to determine its efficiency at holding heat or cold",
    },
    {
      name: "Weatherization",
      description:
        "Fix or repair issues that prevent your house from holding heat or cold",
    },
    {
      name: "HVAC / Heat Pump",
      description:
        "Install and maintain efficiency central air systems that will cool and heat your home",
    },
  ];
  await prisma.service.createMany({ data: services });

  // Generate certifications
  const certifications: Prisma.CertificationCreateInput[] = [
    {
      name: "Certified Energy Auditor",
      shortName: "CEA",
      description: "Evaluate how well your home holds heat or cold",
    },
    {
      name: "Home Energy Professional",
      shortName: "HEP",
      description: "Evaluate how well your home holds heat or cold",
    },
    {
      name: "Air Leakage Control Installer",
      shortName: "BPI-ALCI",
      description:
        "Fix or repair issues that prevent your house from holding heat or cold",
    },
    {
      name: "BPI Air Conditioning & Heat Pump Professional",
      shortName: "BPI-ACHPP",
      description:
        "Install and repair refrigerant-based heating and cooling equipment",
    },
  ];
  await prisma.certification.createMany({ data: certifications });

  // Generate states
  const states: Prisma.StateCreateInput[] = [
    { name: "DC" },
    { name: "MD" },
    { name: "VA" },
  ];
  await prisma.state.createMany({ data: states });

  const serviceRecords = await prisma.service.findMany();
  const stateRecords = await prisma.state.findMany();

  // Prefer loading curated contractors CSV if present; otherwise, skip contractors.
  const csvPath = path.join(__dirname, "data", "contractors-2025-09-07.csv");

  if (fs.existsSync(csvPath)) {
    const raw = fs.readFileSync(csvPath, "utf8");

    type Row = string[];
    const normalize = (s: string) => s.replace(/\u00A0/g, " ").trim();

    function parseCsv(text: string): Row[] {
      const rows: Row[] = [];
      let field = "";
      let row: string[] = [];
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
          if (ch === '"') {
            if (text[i + 1] === '"') {
              field += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            field += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === ',') {
            row.push(field);
            field = "";
          } else if (ch === '\n') {
            row.push(field);
            rows.push(row);
            field = "";
            row = [];
          } else if (ch === '\r') {
            // ignore
          } else {
            field += ch;
          }
        }
      }
      // flush last field/row
      row.push(field);
      rows.push(row);
      return rows.map(r => r.map((c) => normalize(c)));
    }

    const rows = parseCsv(raw).filter(r => r.length && r.some(v => v && v.length));
    const header = rows.shift()!.map(h => normalize(h));

    // Helper to get column index by normalized header name
    const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());

    const idxCompany = idx("Company Name");
    const idxAddress = idx("Address");
    const phoneCol1 = idx("Phone Number");
    const websiteCol = idx("Website");
    const emailCol = idx("Email");
    // City/State/Zip: use labeled headers if present, else assume immediately after Address
    const hdrCity = header.findIndex((h) => h.toLowerCase() === "city");
    const hdrState = header.findIndex((h) => h.toLowerCase() === "state");
    const hdrZip = header.findIndex((h) => h.toLowerCase() === "zip");
    const cityCol = hdrCity >= 0 ? hdrCity : idxAddress + 1;
    const stateCol = hdrState >= 0 ? hdrState : idxAddress + 2;
    const zipCol = hdrZip >= 0 ? hdrZip : idxAddress + 3;
    // There appears to be a second phone column immediately following the first
    const phoneCol2 = phoneCol1 >= 0 ? phoneCol1 + 1 : -1;

    // Service columns in CSV → Service.name in DB
    const serviceHeaderToName: Record<string, string> = {
      "Energy Audit": "Energy Audit",
      "Weatherization": "Weatherization",
      "HVAC/Heat Pump": "HVAC / Heat Pump",
      "HVAC / Heat Pump": "HVAC / Heat Pump",
      "Electrical": "Electrical",
    };
    const serviceCols = Object.keys(serviceHeaderToName)
      .map((h) => ({ h, i: idx(h) }))
      .filter((x) => x.i >= 0);

    const srvByName = new Map(serviceRecords.map((s) => [s.name, s]));
    const stByName = new Map(stateRecords.map((s) => [s.name, s]));

    const created: Promise<unknown>[] = [];
    const cell = (r: string[], i: number) => (i >= 0 ? (r[i] || "").trim() : "");
    const digits = (s: string) => s.replace(/[^0-9]/g, "");

    for (const r of rows) {
      try {
        const name = cell(r, idxCompany);
        if (!name) continue;
        const address = cell(r, idxAddress);
        let city = cell(r, cityCol);
        let state = cell(r, stateCol).toUpperCase();
        let zip = digits(cell(r, zipCol)).slice(0, 5);

        // Fallback extraction from the address when any piece is missing
        if (!zip) zip = address.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1] ?? "";
        if (!state) state = (address.match(/\b([A-Za-z]{2})\s+\d{5}\b/)?.[1] ?? "").toUpperCase();
        if (!city && address.includes(",")) {
          const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 3) city = parts[parts.length - 2];
        }

        // Compute addressLine1 by trimming trailing ", City, ST ZIP" when possible
        let addressLine1 = address;
        if (city && state && zip) {
          const tail = `${city}, ${state} ${zip}`;
          if (address.endsWith(tail)) {
            addressLine1 = address
              .slice(0, address.length - tail.length)
              .replace(/[\,\s]+$/, "");
          }
        }

        // Required fields
        if (!addressLine1 || !city || !state || !zip) {
          console.warn("Skipping contractor due to incomplete address:", name);
          continue;
        }

        const website = cell(r, websiteCol) || undefined;
        const rawEmail = cell(r, emailCol);
        const email = /contact through website/i.test(rawEmail) || rawEmail === "" ? undefined : rawEmail;
        // Prefer the second (formatted) phone number if present
        const phone = cell(r, phoneCol2) || cell(r, phoneCol1) || undefined;

        // Build services connections where CSV cell is "Yes"
        const connectServices = [] as { id: number }[];
        for (const { h, i } of serviceCols) {
          const v = cell(r, i).toLowerCase();
          if (v === 'yes' || v === 'y') {
            const dbName = serviceHeaderToName[h];
            const s = srvByName.get(dbName);
            if (s) connectServices.push({ id: s.id });
          }
        }

        const stateRec = stByName.get(state);
        const connectStates = stateRec ? [{ id: stateRec.id }] : [];

        created.push(
          prisma.contractor.create({
            data: {
              name,
              website,
              email,
              phone,
              addressLine1,
              addressLine2: null,
              city,
              state,
              zip,
              services: connectServices.length ? { connect: connectServices } : undefined,
              statesServed: connectStates.length ? { connect: connectStates } : undefined,
              isDraft: false,
            },
          })
        );
      } catch (e) {
        console.warn("Skipping row due to error:", e);
      }
    }

    await Promise.all(created);
  } else {
    console.warn(`CSV not found at ${csvPath}. No contractors were seeded.`);
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
