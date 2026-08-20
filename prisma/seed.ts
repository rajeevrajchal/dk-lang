import { PrismaClient } from "@prisma/client";
import { MODULES } from "../lib/curriculum/modules";
import { TIERS } from "../lib/curriculum/tiers";
import { CONSTRUCTS } from "../lib/content-gen/constructs";
import { MODUL2_READING_ITEMS } from "../lib/content-gen/modul2-reading";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding tiers...");
  for (const tier of TIERS) {
    await prisma.tier.upsert({
      where: { id: tier.id },
      update: { name: tier.name, description: tier.description },
      create: tier,
    });
  }

  console.log("Seeding modules...");
  for (const mod of MODULES) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {
        slug: mod.slug,
        name: mod.name,
        cefrGoal: mod.cefrGoal,
        description: mod.description,
        isFinalExam: mod.isFinalExam,
        isOralOnly: mod.isOralOnly,
        order: mod.order,
      },
      create: {
        id: mod.id,
        slug: mod.slug,
        name: mod.name,
        cefrGoal: mod.cefrGoal,
        description: mod.description,
        isFinalExam: mod.isFinalExam,
        isOralOnly: mod.isOralOnly,
        order: mod.order,
      },
    });
  }

  console.log("Seeding constructs...");
  const constructIdByCode = new Map<string, string>();
  for (const c of CONSTRUCTS) {
    const row = await prisma.construct.upsert({
      where: { code: c.code },
      update: { name: c.name, description: c.description, tierId: c.tier },
      create: { code: c.code, name: c.name, description: c.description, tierId: c.tier },
    });
    constructIdByCode.set(c.code, row.id);
  }

  console.log("Seeding Modul 2 reading items...");
  // Idempotent-ish: wipe generated Modul 2 reading items and re-insert, so
  // re-running the seed after editing content doesn't duplicate rows.
  const existing = await prisma.item.findMany({
    where: { moduleId: 2, skill: "READING", generated: true },
    select: { id: true },
  });
  if (existing.length > 0) {
    await prisma.itemConstruct.deleteMany({ where: { itemId: { in: existing.map((i) => i.id) } } });
    await prisma.attempt.deleteMany({ where: { itemId: { in: existing.map((i) => i.id) } } });
    await prisma.item.deleteMany({ where: { id: { in: existing.map((i) => i.id) } } });
  }

  for (const item of MODUL2_READING_ITEMS) {
    const created = await prisma.item.create({
      data: {
        moduleId: 2,
        skill: "READING",
        tierId: item.tier,
        type: item.type,
        topic: item.topic,
        passageText: item.passageText,
        promptText: item.promptText,
        optionsJson: item.options ? JSON.stringify(item.options) : null,
        answerJson: JSON.stringify(item.answer),
        explanation: item.explanation,
        generated: true,
      },
    });

    for (const code of item.constructs) {
      const constructId = constructIdByCode.get(code);
      if (!constructId) {
        throw new Error(`Unknown construct code "${code}" referenced by an item`);
      }
      await prisma.itemConstruct.create({
        data: { itemId: created.id, constructId },
      });
    }
  }

  console.log(`Seeded ${MODUL2_READING_ITEMS.length} Modul 2 reading items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
