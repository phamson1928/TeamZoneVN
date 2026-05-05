import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, name: true, iconUrl: true, bannerUrl: true },
  });

  for (const game of games) {
    console.log(`[${game.name}]`);
    console.log(`  iconUrl:   ${game.iconUrl}`);
    console.log(`  bannerUrl: ${game.bannerUrl}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
