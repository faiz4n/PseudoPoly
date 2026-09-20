import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TABLE_PATH = path.resolve('src/assets/reference/classic_table.webp');
const START_PATH = path.resolve('src/assets/start.png');
const PARKING_PATH = path.resolve('src/assets/parking.png');
const ROBBANK_PATH = path.resolve('src/assets/robbank.png');
const JAIL_PATH = path.resolve('src/assets/jail.png');

const OUT_SRC = path.resolve('src/assets/master_board.webp');
const OUT_PUB = path.resolve('public/master_board.webp');

// Board dimensions
const BOARD_W = 923;
const BOARD_H = 835;
const CW = 125; // corner width
const CH = 133; // corner height

// Tile dimensions
const HTILE_W = (BOARD_W - 2 * CW) / 9;  // ~74.78px horizontal tile width
const VTILE_H = (BOARD_H - 2 * CH) / 7;  // ~81.29px vertical tile height

/**
 * Create a simple tile image with a cream/beige background and centered text.
 * For "special" tiles that replace reference board tiles.
 */
async function createTileImage(width, height, label, sublabel, isVertical = false) {
  const w = Math.round(width);
  const h = Math.round(height);
  
  // Create SVG with cream background and text
  const bgColor = '#e2d5bd';
  const borderColor = '#c9b99a';
  const textColor = '#5a3a1a';
  
  let svgContent;
  
  if (isVertical) {
    // Vertical tile (right column) - text goes top-to-bottom
    svgContent = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="${bgColor}" rx="2"/>
        <rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="${borderColor}" stroke-width="1" rx="1"/>
        <text x="${w/2}" y="${h/2 - 8}" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${textColor}">
          ${label}
        </text>
        ${sublabel ? `<text x="${w/2}" y="${h/2 + 8}" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="9" fill="${textColor}">
          ${sublabel}
        </text>` : ''}
      </svg>
    `;
  } else {
    // Horizontal tile (top row) - normal orientation
    svgContent = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="${bgColor}" rx="2"/>
        <rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="${borderColor}" stroke-width="1" rx="1"/>
        <text x="${w/2}" y="${h/2 - 12}" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${textColor}">
          Property
        </text>
        <text x="${w/2}" y="${h/2 + 2}" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${textColor}">
          War
        </text>
        <text x="${w/2}" y="${h/2 + 22}" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="20" fill="${textColor}">
          ⚔
        </text>
      </svg>
    `;
  }
  
  return sharp(Buffer.from(svgContent)).png().toBuffer();
}

async function generateMasterBoard() {
  console.log('Generating master_board.webp with custom tile replacements...');

  // Prepare corner overlays
  const startBuffer = await sharp(START_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const parkingBuffer = await sharp(PARKING_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const robbankBuffer = await sharp(ROBBANK_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const jailBuffer = await sharp(JAIL_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  // Create Property War tile (top row, 8th tile - index 7)
  // This replaces the "robber" tile on the reference board
  const propWarX = Math.round(CW + 7 * HTILE_W);
  const propWarY = 0;
  const propWarW = Math.round(CW + 8 * HTILE_W) - propWarX; // exact pixel width
  const propWarH = CH;
  
  console.log(`Property War tile: x=${propWarX}, y=${propWarY}, w=${propWarW}, h=${propWarH}`);
  
  const propWarSvg = `
    <svg width="${propWarW}" height="${propWarH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${propWarW}" height="${propWarH}" fill="#e2d5bd"/>
      <rect x="0.5" y="0.5" width="${propWarW-1}" height="${propWarH-1}" fill="none" stroke="#c9b99a" stroke-width="1"/>
      <text x="${propWarW/2}" y="30" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="#5a3a1a">
        Property
      </text>
      <text x="${propWarW/2}" y="45" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="#5a3a1a">
        War
      </text>
      <text x="${propWarW/2}" y="85" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="38" fill="#8B4513">
        ⚔
      </text>
    </svg>
  `;
  const propWarBuffer = await sharp(Buffer.from(propWarSvg)).png().toBuffer();

  // Create Forced Auction tile (right column, 3rd tile - index 2)
  // This replaces a "chance" tile on the reference board
  const forcedAucX = BOARD_W - CW; // right side starts at 798
  const forcedAucY = Math.round(CH + 2 * VTILE_H);
  const forcedAucW = CW;
  const forcedAucH = Math.round(CH + 3 * VTILE_H) - forcedAucY;
  
  console.log(`Forced Auction tile: x=${forcedAucX}, y=${forcedAucY}, w=${forcedAucW}, h=${forcedAucH}`);
  
  const forcedAucSvg = `
    <svg width="${forcedAucW}" height="${forcedAucH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${forcedAucW}" height="${forcedAucH}" fill="#e2d5bd"/>
      <rect x="0.5" y="0.5" width="${forcedAucW-1}" height="${forcedAucH-1}" fill="none" stroke="#c9b99a" stroke-width="1"/>
      <text x="${forcedAucW/2}" y="22" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#5a3a1a">
        Forced
      </text>
      <text x="${forcedAucW/2}" y="37" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#5a3a1a">
        Auction
      </text>
      <text x="${forcedAucW/2}" y="62" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#8B4513">
        🔨
      </text>
    </svg>
  `;
  const forcedAucBuffer = await sharp(Buffer.from(forcedAucSvg)).png().toBuffer();

  const composites = [
    // Custom corners
    { input: robbankBuffer, left: 0, top: 0 },
    { input: jailBuffer, left: BOARD_W - CW, top: 0 },
    { input: parkingBuffer, left: 0, top: BOARD_H - CH },
    { input: startBuffer, left: BOARD_W - CW, top: BOARD_H - CH },
    // Custom tile replacements
    { input: propWarBuffer, left: propWarX, top: propWarY },
    { input: forcedAucBuffer, left: forcedAucX, top: forcedAucY },
  ];

  const resultBuffer = await sharp(TABLE_PATH)
    .composite(composites)
    .webp({ quality: 95, lossless: true })
    .toBuffer();

  fs.writeFileSync(OUT_SRC, resultBuffer);
  fs.writeFileSync(OUT_PUB, resultBuffer);
  console.log('Successfully generated master_board.webp (' + resultBuffer.length + ' bytes)');
}

generateMasterBoard().catch(err => {
  console.error('Error generating master board:', err);
  process.exit(1);
});
