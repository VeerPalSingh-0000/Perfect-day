import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Define icon sizes for each density
const iconSizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

const logoPath = path.join(rootDir, "public", "logo.png");
const androidResPath = path.join(
  rootDir,
  "android",
  "app",
  "src",
  "main",
  "res",
);

async function generateIcons() {
  try {
    console.log("📱 Generating Android icons from logo...\n");

    for (const [density, size] of Object.entries(iconSizes)) {
      const densityPath = path.join(androidResPath, density);

      // Ensure directory exists
      if (!fs.existsSync(densityPath)) {
        fs.mkdirSync(densityPath, { recursive: true });
        console.log(`✅ Created directory: ${density}`);
      }

      // Generate ic_launcher.png
      const launcherPath = path.join(densityPath, "ic_launcher.png");
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(launcherPath);
      console.log(
        `✅ Generated ic_launcher.png (${size}x${size}) → ${density}`,
      );

      // Generate ic_launcher_round.png
      const roundPath = path.join(densityPath, "ic_launcher_round.png");
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(roundPath);
      console.log(
        `✅ Generated ic_launcher_round.png (${size}x${size}) → ${density}`,
      );

      // Generate ic_launcher_foreground.png (for adaptive icons)
      const foregroundPath = path.join(
        densityPath,
        "ic_launcher_foreground.png",
      );
      const foregroundSize = Math.round(size * 0.66);
      await sharp(logoPath)
        .resize(foregroundSize, foregroundSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(foregroundPath);
      console.log(
        `✅ Generated ic_launcher_foreground.png (adaptive) → ${density}`,
      );
    }

    console.log("\n✨ All Android icons generated successfully!");
    console.log("📦 Don't forget to run: npm run build:android");
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
