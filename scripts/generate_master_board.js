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

async function generateMasterBoard() {
  console.log('Generating master_board.webp...');

  // Corner dimensions on the 923x835 board
  const CW = 125;
  const CH = 133;

  // Prepare corner overlays
  // 1. Start (Bottom-Right): x: 798, y: 702
  const startBuffer = await sharp(START_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  // 2. Parking (Bottom-Left): x: 0, y: 702
  const parkingBuffer = await sharp(PARKING_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  // 3. Rob Bank (Top-Left): x: 0, y: 0
  const robbankBuffer = await sharp(ROBBANK_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  // 4. Jail (Top-Right): x: 798, y: 0
  const jailBuffer = await sharp(JAIL_PATH)
    .resize(CW, CH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const composites = [
    { input: robbankBuffer, left: 0, top: 0 },
    { input: jailBuffer, left: 798, top: 0 },
    { input: parkingBuffer, left: 0, top: 702 },
    { input: startBuffer, left: 798, top: 702 }
  ];

  const resultBuffer = await sharp(TABLE_PATH)
    .composite(composites)
    .webp({ quality: 95, lossless: true })
    .toBuffer();

  fs.writeFileSync(OUT_SRC, resultBuffer);
  fs.writeFileSync(OUT_PUB, resultBuffer);
  console.log('Successfully generated master_board.webp in src/assets and public/ (' + resultBuffer.length + ' bytes)');
}

generateMasterBoard().catch(err => {
  console.error('Error generating master board:', err);
  process.exit(1);
});
