/**
 * Script: migrate-game-image-urls.ts
 *
 * Replaces old Supabase project domain in all game image URLs
 * with the current project domain from .env (SUPABASE_URL).
 *
 * Run: npx tsx tmp/migrate-game-image-urls.ts
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const OLD_HOST = 'hrvxrxnkbcqrftagzuso.supabase.co';
const NEW_SUPABASE_URL = process.env.SUPABASE_URL; // from .env

if (!NEW_SUPABASE_URL) {
  console.error('❌ SUPABASE_URL not found in .env');
  process.exit(1);
}

const NEW_HOST = new URL(NEW_SUPABASE_URL).host; // e.g. jgdnolcmyvpcsaphxtwm.supabase.co

console.log(`🔄 Migrating URLs`);
console.log(`   OLD: ${OLD_HOST}`);
console.log(`   NEW: ${NEW_HOST}\n`);

function migrateUrl(url: string | null): string | null {
  if (!url) return null;
  return url.replace(OLD_HOST, NEW_HOST);
}

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, name: true, iconUrl: true, bannerUrl: true },
  });

  let updated = 0;
  for (const game of games) {
    const newIconUrl   = migrateUrl(game.iconUrl);
    const newBannerUrl = migrateUrl(game.bannerUrl);
    const hasChange =
      newIconUrl !== game.iconUrl || newBannerUrl !== game.bannerUrl;

    if (hasChange) {
      await prisma.game.update({
        where: { id: game.id },
        data: {
          ...(newIconUrl   !== game.iconUrl   && { iconUrl:   newIconUrl }),
          ...(newBannerUrl !== game.bannerUrl && { bannerUrl: newBannerUrl }),
        },
      });
      console.log(`✅ [${game.name}]`);
      if (newIconUrl   !== game.iconUrl)   console.log(`   icon:   ${newIconUrl}`);
      if (newBannerUrl !== game.bannerUrl) console.log(`   banner: ${newBannerUrl}`);
      updated++;
    } else {
      console.log(`⏭️  [${game.name}] — no change needed`);
    }
  }

  console.log(`\n✨ Done! Updated ${updated}/${games.length} games.`);
  console.log('\n⚠️  IMPORTANT: Make sure the image files exist in the NEW Supabase Storage bucket!');
  console.log(`   Upload them to: ${NEW_SUPABASE_URL}/storage/v1/object/public/game-assets/`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
