import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_COMMON = path.resolve('src/assets/reference/common.webp');
const SRC_CLASSIC = path.resolve('src/assets/reference/classic_game.webp');

const DIRS = [
  path.resolve('src/assets/modal_ui'),
  path.resolve('public/modal_ui'),
];

DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const SLICES = [
  // From common.webp
  { name: 'panel.png', src: SRC_COMMON, rect: { left: 596, top: 252, width: 260, height: 260 } },
  { name: 'panel_plain.png', src: SRC_COMMON, rect: { left: 596, top: 520, width: 260, height: 260 } },
  { name: 'head.png', src: SRC_COMMON, rect: { left: 4, top: 1384, width: 240, height: 54 } },
  { name: 'head_red.png', src: SRC_COMMON, rect: { left: 764, top: 1368, width: 240, height: 54 } },
  { name: 'close_button.png', src: SRC_COMMON, rect: { left: 4, top: 1764, width: 56, height: 56 } },
  { name: 'btn_green.png', src: SRC_COMMON, rect: { left: 4, top: 1176, width: 240, height: 80 } },
  { name: 'btn_red.png', src: SRC_COMMON, rect: { left: 772, top: 1160, width: 240, height: 80 } },
  { name: 'btn_blue.png', src: SRC_COMMON, rect: { left: 524, top: 1160, width: 240, height: 80 } },
  // From classic_game.webp
  { name: 'safe_door.png', src: SRC_CLASSIC, rect: { left: 1696, top: 4, width: 330, height: 312 } },
  { name: 'money_take.png', src: SRC_CLASSIC, rect: { left: 92, top: 916, width: 79, height: 98 } },
  { name: 'money_lost.png', src: SRC_CLASSIC, rect: { left: 4, top: 896, width: 77, height: 99 } },
  { name: 'win_cup.png', src: SRC_CLASSIC, rect: { left: 664, top: 4, width: 379, height: 488 } },
  { name: 'yellow_panel.png', src: SRC_CLASSIC, rect: { left: 1052, top: 288, width: 400, height: 339 } },
];

async function extractModalAssets() {
  console.log('Extracting modal UI assets from reference atlases...');

  for (const item of SLICES) {
    const buffer = await sharp(item.src)
      .extract(item.rect)
      .png({ quality: 100 })
      .toBuffer();

    for (const d of DIRS) {
      fs.writeFileSync(path.join(d, item.name), buffer);
    }
    console.log(`Extracted: ${item.name} (${item.rect.width}x${item.rect.height})`);
  }

  console.log('All modal UI assets successfully extracted!');
}

extractModalAssets().catch(err => {
  console.error('Error extracting modal assets:', err);
  process.exit(1);
});
