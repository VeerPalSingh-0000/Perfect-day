import sharp from "sharp";
import fs from "fs";
import path from "path";

const logoPath = "public/logo.png";
const baseResPath = "android/app/src/main/res";

// Android icon sizes for different densities
const densities = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

async function generateAppIcons() {
  // Validate input file exists
  if (!fs.existsSync(logoPath)) {
    console.error("❌ Error: public/logo.png not found!");
    process.exit(1);
  }

  try {
    console.log(
      "🎨 Generating high-quality app icons for all Android densities...\n",
    );

    for (const [density, size] of Object.entries(densities)) {
      const outputDir = path.join(baseResPath, density);
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 1. Generate standard launcher icon
      const launcherPath = path.join(outputDir, "ic_launcher.png");
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(launcherPath);

      // 2. Generate round launcher icon (often required by Android)
      const roundPath = path.join(outputDir, "ic_launcher_round.png");
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(roundPath);

      // 3. Generate foreground icon for adaptive icons
      const foregroundPath = path.join(outputDir, "ic_launcher_foreground.png");
      // For adaptive foreground, we often want a bit of padding (scaled to ~66% of total size)
      const foregroundSize = Math.floor(size * 0.66);
      await sharp(logoPath)
        .resize(foregroundSize, foregroundSize, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .extend({
          top: Math.floor((size - foregroundSize) / 2),
          bottom: Math.ceil((size - foregroundSize) / 2),
          left: Math.floor((size - foregroundSize) / 2),
          right: Math.ceil((size - foregroundSize) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(foregroundPath);

      console.log(`✅ ${density}: Generated PNG icons (${size}x${size}px)`);
    }

    console.log("\n✨ App icons generated successfully!");
    console.log(
      "Your mobile app now has high-quality icons for all device types.",
    );
    console.log("\nNext steps:");
    console.log(
      "1. Rebuild the Android app: npm run android:build or use Android Studio",
    );
    console.log("2. The new icons will be used for all app launches\n");
  } catch (err) {
    console.error("❌ Failed to generate app icons:", err.message);
    process.exit(1);
  }
}

generateAppIcons();
