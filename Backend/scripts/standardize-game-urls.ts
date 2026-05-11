import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRelativePath(url: string | null): string | null {
  if (!url) return null;
  
  // If it's already relative (doesn't start with http), return as is
  if (!url.startsWith('http')) return url;
  
  // Extract the part after 'game-assets/'
  const parts = url.split('game-assets/');
  if (parts.length > 1) {
    return parts[1]; // e.g. "icons/valorant.png"
  }
  
  return url;
}

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, name: true, iconUrl: true, bannerUrl: true },
  });

  console.log(`Found ${games.length} games. Standardizing URLs...`);

  for (const game of games) {
    const newIconUrl = getRelativePath(game.iconUrl);
    const newBannerUrl = getRelativePath(game.bannerUrl);

    const needsUpdate =
      newIconUrl !== game.iconUrl || newBannerUrl !== game.bannerUrl;

    if (needsUpdate) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          iconUrl: newIconUrl,
          bannerUrl: newBannerUrl,
        },
      });
      console.log(`  ✅ Standardized [${game.name}]`);
      console.log(`     ${game.iconUrl} → ${newIconUrl}`);
    } else {
      console.log(`  ⏭️  Skip [${game.name}] — already relative`);
    }
  }

  console.log('\n✨ All URLs are now stored as relative paths!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
