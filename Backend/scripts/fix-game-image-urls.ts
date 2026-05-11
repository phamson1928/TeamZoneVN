import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLD_PROJECT_ID = 'hrvxrxnkbcqrftagzuso';
const NEW_PROJECT_ID = 'jgdnolcmyvpcsaphxtwm';

function fixUrl(url: string | null): string | null {
  if (!url) return null;
  
  // Replace old project ID with new one if it exists in the URL
  if (url.includes(OLD_PROJECT_ID)) {
    return url.replace(OLD_PROJECT_ID, NEW_PROJECT_ID);
  }
  
  // If it's just a filename (not starting with http), build the full URL
  if (!url.startsWith('http')) {
    const folder = url.includes('banner') ? 'banners' : 'icons';
    return `https://${NEW_PROJECT_ID}.supabase.co/storage/v1/object/public/game-assets/${folder}/${url}`;
  }
  
  return url;
}

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, name: true, iconUrl: true, bannerUrl: true },
  });

  console.log(`Found ${games.length} games. Checking URLs...`);

  for (const game of games) {
    const newIconUrl = fixUrl(game.iconUrl);
    const newBannerUrl = fixUrl(game.bannerUrl);

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
      console.log(`  ✅ Fixed [${game.name}]`);
      console.log(`     icon:   ${game.iconUrl} → ${newIconUrl}`);
      console.log(`     banner: ${game.bannerUrl} → ${newBannerUrl}`);
    } else {
      console.log(`  ⏭️  Skip  [${game.name}] — URLs already correct`);
    }
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
