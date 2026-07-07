import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeActiveUntil } from "../src/lib/plans";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const host = await prisma.user.upsert({
    where: { email: "host@kenangkurinji.test" },
    update: {},
    create: {
      name: "Demo Host",
      email: "host@kenangkurinji.test",
      passwordHash,
      role: "OWNER",
      subscription: { create: { plan: "KURINJI" } },
    },
  });

  const event = await prisma.event.upsert({
    where: { slug: "pernikahan-demo" },
    update: {},
    create: {
      ownerId: host.id,
      title: "Pernikahan Demo — Andi & Sari",
      slug: "pernikahan-demo",
      description: "Event contoh untuk mencoba Kenang Camera.",
      eventDate: new Date(),
      location: "Kerinci, Jambi",
      status: "LIVE",
      revealMode: "INSTANT",
      shotLimit: 24,
      plan: "KURINJI",
      activeUntil: computeActiveUntil("KURINJI"),
      qrCode: {
        create: {
          code: "pernikahan-demo",
          url: "http://localhost:3000/e/pernikahan-demo",
        },
      },
      analytics: { create: {} },
    },
  });

  console.log("Seed selesai.");
  console.log(`  Login host  : host@kenangkurinji.test / password123`);
  console.log(`  Dashboard   : http://localhost:3000/dashboard`);
  console.log(`  Guest camera: http://localhost:3000/e/${event.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
