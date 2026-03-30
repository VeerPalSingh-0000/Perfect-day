/**
 * Image Optimization Script
 * Compresses PNG images to WebP format with proper sizing.
 * 
 * Logo: 940KB PNG → ~5-15KB WebP (resized to 96px for max display size)
 * Avatars: ~500-650KB PNGs → ~10-25KB WebP each (resized to 192px)
 */
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, parse } from 'path';

const PUBLIC = join(process.cwd(), 'public');

async function optimizeImage(inputPath, outputPath, maxSize, quality = 80) {
  const before = (await stat(inputPath)).size;
  
  await sharp(inputPath)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outputPath);

  const after = (await stat(outputPath)).size;
  const savings = ((1 - after / before) * 100).toFixed(1);
  console.log(`  ✓ ${parse(inputPath).base} (${(before/1024).toFixed(0)}KB) → ${parse(outputPath).base} (${(after/1024).toFixed(0)}KB) — ${savings}% smaller`);
}

async function main() {
  console.log('\n🖼️  Optimizing images...\n');

  // Optimize logo (displayed at max 48px, generate 96px for 2x retina)
  console.log('Logo:');
  await optimizeImage(
    join(PUBLIC, 'logo.png'),
    join(PUBLIC, 'logo.webp'),
    96, 85
  );

  // Optimize avatars (displayed at max 96px, generate 192px for 2x retina)
  console.log('\nAvatars:');
  const avatarDir = join(PUBLIC, 'avatars');
  const files = await readdir(avatarDir);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const name = parse(file).name;
      await optimizeImage(
        join(avatarDir, file),
        join(avatarDir, `${name}.webp`),
        192, 80
      );
    }
  }

  console.log('\n✅ All images optimized!\n');
}

main().catch(console.error);
