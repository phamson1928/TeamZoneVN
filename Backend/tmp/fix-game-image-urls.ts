import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_URL = 'https://jgdnolcmyvpcsaphxtwm.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/game-assets`;

function fixUrl(url: string | null, folder: 'icons' | 'banners'): string | null {
  if (!url) return null;
  // Already a full URL → skip
  if (url.startsWith('http')) return url;
  // Just a filename → build full Supabase URL
  return `${STORAGE_BASE}/${folder}/${url}`;
}

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, name: true, iconUrl: true, bannerUrl: true },
  });

  console.log(`Found ${games.length} games. Checking URLs...`);

  for (const game of games) {
    const newIconUrl  = fixUrl(game.iconUrl,  'icons');
    const newBannerUrl = fixUrl(game.bannerUrl, 'banners');

    const needsUpdate =
      newIconUrl !== game.iconUrl || newBannerUrl !== game.bannerUrl;

    if (needsUpdate) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          ...(newIconUrl   !== game.iconUrl   && { iconUrl:   newIconUrl }),
          ...(newBannerUrl !== game.bannerUrl && { bannerUrl: newBannerUrl }),
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
