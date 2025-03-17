import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
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

  const contractors = [];

  for (let i = 1; i <= 10; i++) {
    const contractor = await prisma.contractor.create({
      data: {
        name: `Contractor ${i}`,
        email: `contractor${i}@example.com`,
        phone: `555-000${i}`,
        website: `https://contractor${i}.com`,
        addressLine1: `123${i} Main St`,
        addressLine2: null,
        city: `City ${i}`,
        state: "MD",
        zip: `1234${i}`,

        certifications: {
          create: [
            { certificationName: "Cert A" },
            { certificationName: "Cert B" },
          ],
        },

        services: {
          create: [
            { serviceName: "Heat Pump" },
            { serviceName: "HVAC" },
            { serviceName: "Solar Panels" },
          ],
        },

        statesServed: {
          create: [
            { state: "MD" },
            { state: "VA" },
            { state: "DC" },
          ],
        },
      },
    });

    contractors.push(contractor);
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
