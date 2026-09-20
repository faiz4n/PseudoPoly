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

// Board dimensions (full image)
const BOARD_W = 923;
const BOARD_H = 835;

// Black border offsets
const BORDER_L = 16;
const BORDER_T = 17;
const BORDER_R = 17; // 923 - 906
const BORDER_B = 17; // 835 - 818

// Corner positions within the inner board
// Left corners: 109px wide, Right corners: 113px wide
// Top corners: 116px tall, Bottom corners: 118px tall
const CORNER_POSITIONS = {
  topLeft:     { x: BORDER_L, y: BORDER_T, w: 109, h: 116 },
  topRight:    { x: BOARD_W - BORDER_R - 113, y: BORDER_T, w: 113, h: 116 },
  bottomLeft:  { x: BORDER_L, y: BOARD_H - BORDER_B - 118, w: 109, h: 118 },
  bottomRight: { x: BOARD_W - BORDER_R - 113, y: BOARD_H - BORDER_B - 118, w: 113, h: 118 },
};

async function generateMasterBoard() {
  console.log('Generating master_board.webp (corners only, no custom tile replacements)...');

  const composites = [];

  // Composite custom corner images
  for (const [name, pos] of Object.entries(CORNER_POSITIONS)) {
    let imgPath;
    switch (name) {
      case 'topLeft':    imgPath = ROBBANK_PATH; break;
      case 'topRight':   imgPath = JAIL_PATH; break;
      case 'bottomLeft': imgPath = PARKING_PATH; break;
      case 'bottomRight': imgPath = START_PATH; break;
    }

    console.log(`${name}: ${pos.x},${pos.y} (${pos.w}x${pos.h})`);
    
    const buffer = await sharp(imgPath)
      .resize(pos.w, pos.h, { fit: 'cover', position: 'center' })
      .toBuffer();

    composites.push({ input: buffer, left: pos.x, top: pos.y });
  }

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
