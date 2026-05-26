import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const demoProjects = [
  {
    name: "Skyline North Foundation",
    projectType: "Commercial building",
    location: "Victoria Island, Lagos",
    plannedDurationDays: 240,
    goalSummary:
      "Complete the substructure, foundation slabs, and support works for the north tower footprint.",
    reports: [
      {
        date: "2026-05-23",
        summary:
          "Foundation excavation and blinding concrete progressed across Zone A.",
        workersOnSite: 42,
        plannedProgressPct: 38,
        actualProgressPct: 35,
        completionPct: 28,
        workItems: [
          {
            contractor: "Prime Earthworks",
            workDescription: "Bulk excavation and cart-away in Zone A.",
            engineerName: "Engr. T. Adebayo",
            location: "Zone A"
          },
          {
            contractor: "Metro Concrete",
            workDescription:
              "Blinding concrete placement to prepared footing areas.",
            engineerName: "Engr. T. Adebayo",
            location: "Footing Grid A1-A4"
          }
        ]
      },
      {
        date: "2026-05-24",
        summary:
          "Reinforcement fixing started on the first set of pad footings.",
        workersOnSite: 47,
        plannedProgressPct: 45,
        actualProgressPct: 43,
        completionPct: 34,
        workItems: [
          {
            contractor: "SteelFix Systems",
            workDescription:
              "Cutting, bending, and fixing footing reinforcement cages.",
            engineerName: "Engr. M. Hassan",
            location: "Pad Footings F1-F6"
          },
          {
            contractor: "Prime Earthworks",
            workDescription:
              "Final trimming and dewatering around remaining excavation lines.",
            engineerName: "Engr. M. Hassan",
            location: "Perimeter trench"
          }
        ]
      }
    ]
  },
  {
    name: "Bridge Transit Link",
    projectType: "Transport infrastructure",
    location: "Lekki-Epe Corridor, Lagos",
    plannedDurationDays: 365,
    goalSummary:
      "Deliver the primary bridge deck support system and associated approach works.",
    reports: [
      {
        date: "2026-05-23",
        summary:
          "Pier cap shuttering and reinforcement works continued on the east approach.",
        workersOnSite: 31,
        plannedProgressPct: 52,
        actualProgressPct: 50,
        completionPct: 41,
        workItems: [
          {
            contractor: "Axis Formwork",
            workDescription: "Pier cap formwork alignment and bracing.",
            engineerName: "Engr. R. Okafor",
            location: "East Approach Pier P3"
          },
          {
            contractor: "SteelFix Systems",
            workDescription: "Reinforcement fixing for pier cap beam cages.",
            engineerName: "Engr. R. Okafor",
            location: "East Approach Pier P3"
          }
        ]
      }
    ]
  }
];

async function main() {
  for (const demoProject of demoProjects) {
    const project = await prisma.project.upsert({
      where: {
        name: demoProject.name
      },
      update: {
        projectType: demoProject.projectType,
        location: demoProject.location,
        plannedDurationDays: demoProject.plannedDurationDays,
        goalSummary: demoProject.goalSummary
      },
      create: {
        name: demoProject.name,
        projectType: demoProject.projectType,
        location: demoProject.location,
        plannedDurationDays: demoProject.plannedDurationDays,
        goalSummary: demoProject.goalSummary
      }
    });

    await prisma.report.deleteMany({
      where: {
        projectId: project.id
      }
    });

    for (const report of demoProject.reports) {
      await prisma.report.create({
        data: {
          projectId: project.id,
          date: new Date(`${report.date}T00:00:00.000Z`),
          summary: report.summary,
          workersOnSite: report.workersOnSite,
          plannedProgressPct: report.plannedProgressPct,
          actualProgressPct: report.actualProgressPct,
          completionPct: report.completionPct,
          workItems: {
            create: report.workItems
          }
        }
      });
    }
  }

  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "INFO",
      event: "seed.completed",
      projectCount: demoProjects.length
    })
  );
}

main()
  .catch((error) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        event: "seed.failed",
        error: error instanceof Error ? error.message : String(error)
      })
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
