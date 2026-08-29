import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const checklist = (items: [string, string][]) => JSON.stringify(items.map(([labelEn, labelMe]) => ({ labelEn, labelMe })));

async function main() {
  const existing = await prisma.service.count();
  if (existing > 0) {
    console.log(`Services already seeded (${existing}). Skipping.`);
    return;
  }

  await prisma.service.createMany({
    data: [
      {
        nameEn: "Exterior Wash & Decontamination",
        nameMe: "Spoljašnje pranje i dekontaminacija",
        descriptionEn:
          "Hand wash, iron and tar decontamination, clay bar treatment and spray sealant for a clean, protected finish.",
        descriptionMe:
          "Ručno pranje, dekontaminacija od industrijske prašine i katrana, clay bar tretman i zaštitni sprej sealant.",
        durationMinutes: 90,
        priceMin: 35,
        priceMax: 55,
        active: true,
        checklistTemplate: checklist([
          ["Vehicle inspection", "Pregled vozila"],
          ["Pre-rinse", "Prethodno ispiranje"],
          ["Foam wash", "Pranje pjenom"],
          ["Wheels & tires", "Felne i gume"],
          ["Decontamination", "Dekontaminacija"],
          ["Drying", "Sušenje"],
          ["Final inspection", "Završna kontrola"],
        ]),
      },
      {
        nameEn: "Interior Deep Clean",
        nameMe: "Dubinsko čišćenje enterijera",
        descriptionEn:
          "Full interior vacuum, steam cleaning of upholstery, leather conditioning and dashboard detailing.",
        descriptionMe:
          "Kompletno usisavanje enterijera, parno čišćenje presvlaka, njega kože i detaljno čišćenje table.",
        durationMinutes: 120,
        priceMin: 45,
        priceMax: 80,
        active: true,
        checklistTemplate: checklist([
          ["Vehicle inspection", "Pregled vozila"],
          ["Vacuum interior", "Usisavanje enterijera"],
          ["Steam clean upholstery", "Parno čišćenje presvlaka"],
          ["Leather conditioning", "Njega kože"],
          ["Dashboard & trim", "Tabla i plastika"],
          ["Glass interior", "Unutrašnja stakla"],
          ["Final inspection", "Završna kontrola"],
        ]),
      },
      {
        nameEn: "Paint Correction",
        nameMe: "Korekcija laka",
        descriptionEn:
          "Multi-stage machine polishing to remove swirl marks, oxidation and light scratches, restoring gloss and clarity.",
        descriptionMe:
          "Višefazno mašinsko poliranje koje uklanja tragove poliranja, oksidaciju i lakše ogrebotine i vraća sjaj laka.",
        durationMinutes: 300,
        priceMin: 180,
        priceMax: 350,
        active: true,
        checklistTemplate: checklist([
          ["Vehicle inspection", "Pregled vozila"],
          ["Exterior wash", "Spoljašnje pranje"],
          ["Decontamination", "Dekontaminacija"],
          ["Paint correction - cutting stage", "Korekcija laka - grubo poliranje"],
          ["Paint correction - polishing stage", "Korekcija laka - fino poliranje"],
          ["Panel wipe down", "Brisanje panela"],
          ["Final inspection", "Završna kontrola"],
        ]),
      },
      {
        nameEn: "Ceramic Coating",
        nameMe: "Keramička zaštita",
        descriptionEn:
          "Professional-grade ceramic coating application for long-term paint protection, hydrophobic finish and enhanced gloss.",
        descriptionMe:
          "Profesionalna aplikacija keramičke zaštite za dugotrajnu zaštitu laka, hidrofobni efekat i pojačan sjaj.",
        durationMinutes: 480,
        priceMin: 350,
        priceMax: 700,
        active: true,
        checklistTemplate: checklist([
          ["Vehicle inspection", "Pregled vozila"],
          ["Exterior wash", "Spoljašnje pranje"],
          ["Decontamination", "Dekontaminacija"],
          ["Paint correction", "Korekcija laka"],
          ["Surface prep (panel wipe)", "Priprema površine"],
          ["Ceramic coating application", "Aplikacija keramičke zaštite"],
          ["Curing inspection", "Kontrola nakon sušenja"],
          ["Final inspection", "Završna kontrola"],
        ]),
      },
      {
        nameEn: "Full Detail Package",
        nameMe: "Kompletan detailing paket",
        descriptionEn:
          "Our signature complete package: exterior decontamination, paint correction, interior deep clean and ceramic coating.",
        descriptionMe:
          "Naš najkompletniji paket: spoljašnja dekontaminacija, korekcija laka, dubinsko čišćenje enterijera i keramička zaštita.",
        durationMinutes: 600,
        priceMin: 450,
        priceMax: 900,
        active: true,
        checklistTemplate: checklist([
          ["Vehicle inspection", "Pregled vozila"],
          ["Exterior wash", "Spoljašnje pranje"],
          ["Wheels & tires", "Felne i gume"],
          ["Decontamination", "Dekontaminacija"],
          ["Interior deep clean", "Dubinsko čišćenje enterijera"],
          ["Paint correction", "Korekcija laka"],
          ["Ceramic coating application", "Aplikacija keramičke zaštite"],
          ["Final inspection", "Završna kontrola"],
        ]),
      },
    ],
  });

  console.log("Seeded 5 services.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
