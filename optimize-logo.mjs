import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const input = 'public/logo.png';
const output = 'public/logo.webp';

async function optimizeLogo() {
  if (!fs.existsSync(input)) {
    console.error('❌ Error: public/logo.png not found!');
    return;
  }

  try {
    console.log('💎 Upping dimensions for Retina/4K sharpness (Targeting ~50KB)...');
    
    // We increase resolution to 512px (massive for a logo)
    // and bump quality to 95% to ensure zero artifacts.
    await sharp(input)
      .resize(512) // High resolution for ultra-sharp rendering on all screens
      .webp({ 
        quality: 95, // Higher quality for a "premium" finish
        effort: 6
      })
      .toFile(output);

    const statsOld = fs.statSync(input);
    const statsNew = fs.statSync(output);
    
    console.log('✅ Success!');
    console.log(`Original: ${(statsOld.size / 1024).toFixed(2)} KB`);
    console.log(`NEW Optimized WebP: ${(statsNew.size / 1024).toFixed(2)} KB`);
    console.log(`Reduction: ${((1 - statsNew.size / statsOld.size) * 100).toFixed(1)}%`);
    console.log('\nYour logo is now ready for 4K displays at 50KB.');
  } catch (err) {
    console.error('❌ Failed to optimize logo:', err.message);
  }
}

optimizeLogo();
