const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const inputImage = path.join(__dirname, "public/Fotos/dj-posaxa-logo.png");
const outputDir = path.join(__dirname, "public/icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(inputImage)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Also generate favicon.ico (16, 32, 48)
  await sharp(inputImage)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "public/favicon.png"));
  console.log("✓ favicon.png");

  // Apple splash / apple-touch-icon (180x180)
  await sharp(inputImage)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toFile(path.join(outputDir, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png (180x180)");

  console.log("\n✅ Totes les icones PWA generades correctament!");
}

generateIcons().catch(console.error);
