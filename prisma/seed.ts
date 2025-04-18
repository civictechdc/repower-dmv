import { faker } from "@faker-js/faker";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
// todo: once we have real contractors move faker to a dev dependency

const prisma = new PrismaClient();

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
  const certRecords = await prisma.certification.findMany();
  const stateRecords = await prisma.state.findMany();

  // Generate contractors with fake data
  // Seed faker so that it generates the same data for everyone
  faker.seed(8686);
  const promises = [];
  for (let i = 1; i <= 112; i++) {
    const name = faker.company.name();
    const hyphenCase = name
      .toLowerCase()
      .replaceAll(/\W+/g, "-")
      .replaceAll(/-+/g, "-");
    const generateAddressLine2 = Math.random() > 0.25;

    promises.push(
      prisma.contractor.create({
        data: {
          name: name,
          website: `https://${hyphenCase}.com`,
          email: `${faker.person.firstName().toLowerCase()}@${hyphenCase}.com`,
          phone: `202${faker.string.numeric(7)}`,
          addressLine1: faker.location.streetAddress(),
          addressLine2: generateAddressLine2
            ? faker.location.secondaryAddress()
            : null,
          city: faker.location.city(),
          state: faker.helpers.arrayElement(["MD", "VA", "DC"]),
          zip: faker.location.zipCode("#####"),

          certifications: {
            connect: faker.helpers.arrayElements(certRecords, {
              min: 1,
              max: 4,
            }),
          },

          services: {
            connect: faker.helpers.arrayElements(serviceRecords, {
              min: 1,
              max: 4,
            }),
          },

          statesServed: {
            connect: faker.helpers.arrayElements(stateRecords, {
              min: 1,
              max: 3,
            }),
          },
          isDraft: 0
        },
      }),
    );
  }

  await Promise.all(promises);

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
