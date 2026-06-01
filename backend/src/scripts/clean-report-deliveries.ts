import { prisma } from "@/config/prisma";

async function main() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const where = {
    createdAt: {
      lt: start,
    },
  };

  if (process.argv.includes("--apply")) {
    const result = await prisma.deliveryRecord.deleteMany({ where });
    console.log(JSON.stringify({ cutoff: start.toISOString(), deleted: result.count }));
    return;
  }

  const count = await prisma.deliveryRecord.count({ where });
  console.log(JSON.stringify({ cutoff: start.toISOString(), count }));
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
