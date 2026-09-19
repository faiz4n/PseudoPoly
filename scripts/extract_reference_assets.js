import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMPORTED_DIR = path.resolve(
  'server/referenceApk/resources/assetPackInstallTime.apk/assets/.godot/imported'
);

const SOUND_OUTPUT_DIRS = [
  path.resolve('public/sounds'),
  path.resolve('src/sounds')
];

const DICE_OUTPUT_DIR = path.resolve('src/assets/dice');
const REFERENCE_OUTPUT_DIR = path.resolve('src/assets/reference');

for (const dir of [...SOUND_OUTPUT_DIRS, DICE_OUTPUT_DIR, REFERENCE_OUTPUT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. EXTRACT MP3 SOUNDS
console.log('=== EXTRACTING AUDIO ASSETS ===');

const SOUND_MAPPINGS = {
  'Dice_rolling': 'dice_roll.mp3',
  'Dices_rolling': 'dice_roll_double.mp3',
  'step.mp3': 'step.mp3',
  'Step_left': 'step_left.mp3',
  'Step_right': 'step_right.mp3',
  'Get_money': 'get_money.mp3',
  'Spend_money': 'spend_money.mp3',
  'Cell_jail': 'cell_jail.mp3',
  'jail_out': 'jail_out.mp3',
  'Cell_robber': 'cell_robber.mp3',
  'Cell_chance': 'cell_chance.mp3',
  'Cell_GP': 'cell_gp.mp3',
  'Cell_tax': 'cell_tax.mp3',
  'Game_win': 'game_win.mp3',
  'Game_loose': 'game_lose.mp3',
  'Button_press': 'button_press.mp3',
  'error': 'error.mp3',
  'turn.mp3': 'turn_start.mp3',
  'Melody_1': 'melody_1.mp3',
  'Melody_2': 'melody_2.mp3',
  'Melody_3': 'melody_3.mp3'
};

const importedFiles = fs.readdirSync(IMPORTED_DIR);

for (const [pattern, targetName] of Object.entries(SOUND_MAPPINGS)) {
  const match = importedFiles.find(
    (f) => f.toLowerCase().includes(pattern.toLowerCase()) && f.endsWith('.mp3str')
  );

  if (!match) {
    console.warn(`[WARN] No match for sound pattern: ${pattern}`);
    continue;
  }

  const buf = fs.readFileSync(path.join(IMPORTED_DIR, match));
  
  // In Godot 4 binary RSRC, PackedByteArray property (type 0x1f) is followed by 4-byte uint32 length and payload
  const marker = Buffer.from([0x1f, 0x00, 0x00, 0x00]);
  const idx = buf.indexOf(marker);

  if (idx !== -1) {
    const len = buf.readUInt32LE(idx + 4);
    const mp3Buffer = buf.slice(idx + 8, idx + 8 + len);

    if (mp3Buffer.length > 100) {
      for (const outDir of SOUND_OUTPUT_DIRS) {
        fs.writeFileSync(path.join(outDir, targetName), mp3Buffer);
      }
      console.log(`[AUDIO] Extracted ${targetName} (${mp3Buffer.length} bytes) from ${match}`);
      continue;
    }
  }

  console.warn(`[WARN] Could not parse MP3 payload for ${pattern} from ${match}`);

}

// 2. EXTRACT WEBP TEXTURES FROM CTEX
console.log('\n=== EXTRACTING WEBP TEXTURES ===');

const TEXTURE_MAPPINGS = {
  'classic_game': 'classic_game.webp',
  'common': 'common.webp',
  'player_icons': 'player_icons.webp',
  'classic_table': 'classic_table.webp'
};

const extractedTextures = {};

for (const [pattern, targetName] of Object.entries(TEXTURE_MAPPINGS)) {
  const match = importedFiles.find(
    (f) => f.toLowerCase().startsWith(pattern.toLowerCase()) && f.endsWith('.ctex')
  );

  if (!match) {
    console.warn(`[WARN] No match for texture: ${pattern}`);
    continue;
  }

  const buf = fs.readFileSync(path.join(IMPORTED_DIR, match));
  const riffIdx = buf.indexOf(Buffer.from('RIFF'));

  if (riffIdx === -1) {
    console.warn(`[WARN] No RIFF header found in ${match}`);
    continue;
  }

  const riffLen = buf.readUInt32LE(riffIdx + 4);
  const webpBuffer = buf.slice(riffIdx, riffIdx + riffLen + 8);
  const outPath = path.join(REFERENCE_OUTPUT_DIR, targetName);
  fs.writeFileSync(outPath, webpBuffer);
  extractedTextures[pattern] = outPath;
  console.log(`[TEXTURE] Extracted ${targetName} (${webpBuffer.length} bytes)`);
}

// 3. CROP THE 11 DICE FRAMES
console.log('\n=== CROPPING DICE FRAMES ===');

const DICE_COORDINATES = {
  1: { left: 1592, top: 828, width: 124, height: 124 },
  2: { left: 1460, top: 824, width: 124, height: 124 },
  3: { left: 1724, top: 828, width: 124, height: 124 },
  4: { left: 436, top: 844, width: 124, height: 124 },
  5: { left: 568, top: 844, width: 124, height: 124 },
  6: { left: 700, top: 844, width: 124, height: 124 },
  7: { left: 284, top: 780, width: 142, height: 138 },
  8: { left: 4, top: 740, width: 141, height: 147 },
  9: { left: 864, top: 732, width: 139, height: 145 },
  10: { left: 1308, top: 824, width: 142, height: 136 },
  11: { left: 1160, top: 812, width: 138, height: 139 }
};

const classicGameWebpPath = extractedTextures['classic_game'];

if (classicGameWebpPath && fs.existsSync(classicGameWebpPath)) {
  const CANVAS_SIZE = 152; // Uniform square bounding box with transparent padding

  for (let frame = 1; frame <= 11; frame++) {
    const coords = DICE_COORDINATES[frame];
    const outputPathPng = path.join(DICE_OUTPUT_DIR, `dice_${frame}.png`);
    const outputPathWebp = path.join(DICE_OUTPUT_DIR, `dice_${frame}.webp`);

    // Crop the sprite
    const cropped = await sharp(classicGameWebpPath)
      .extract(coords)
      .toBuffer();

    // Composite centered inside a clean CANVAS_SIZE x CANVAS_SIZE canvas
    const xOffset = Math.floor((CANVAS_SIZE - coords.width) / 2);
    const yOffset = Math.floor((CANVAS_SIZE - coords.height) / 2);

    await sharp({
      create: {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        {
          input: cropped,
          left: xOffset,
          top: yOffset
        }
      ])
      .png({ quality: 100 })
      .toFile(outputPathPng);

    await sharp({
      create: {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        {
          input: cropped,
          left: xOffset,
          top: yOffset
        }
      ])
      .webp({ lossless: true })
      .toFile(outputPathWebp);

    console.log(`[DICE] Exported dice_${frame}.png & dice_${frame}.webp (${coords.width}x${coords.height} -> ${CANVAS_SIZE}x${CANVAS_SIZE})`);
  }
} else {
  console.error('[ERROR] classic_game.webp was not found to crop dice frames.');
}

console.log('\n=== EXTRACTION COMPLETE ===');
