import sharp from 'sharp';

const TABLE_PATH = 'src/assets/reference/classic_table.webp';

async function measurePrecise() {
  const { data, info } = await sharp(TABLE_PATH).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  function getPixel(x, y) {
    const offset = (y * width + x) * channels;
    return { r: data[offset], g: data[offset + 1], b: data[offset + 2] };
  }

  function isBlack(px) {
    return px.r < 10 && px.g < 10 && px.b < 10;
  }

  // Find exact border boundaries
  // Top border: scan down from top at several x positions
  let topBorder = 0;
  for (let y = 0; y < 50; y++) {
    const px = getPixel(200, y);
    if (!isBlack(px)) { topBorder = y; break; }
  }

  let leftBorder = 0;
  for (let x = 0; x < 50; x++) {
    const px = getPixel(x, 400);
    if (!isBlack(px)) { leftBorder = x; break; }
  }

  let bottomBorder = height - 1;
  for (let y = height - 1; y > height - 50; y--) {
    const px = getPixel(200, y);
    if (!isBlack(px)) { bottomBorder = y; break; }
  }

  let rightBorder = width - 1;
  for (let x = width - 1; x > width - 50; x--) {
    const px = getPixel(x, 400);
    if (!isBlack(px)) { rightBorder = x; break; }
  }

  console.log('=== BOARD BORDER BOUNDARIES ===');
  console.log(`Top: y=${topBorder}`);
  console.log(`Left: x=${leftBorder}`);
  console.log(`Bottom: y=${bottomBorder}`);
  console.log(`Right: x=${rightBorder}`);
  
  const innerW = rightBorder - leftBorder + 1;
  const innerH = bottomBorder - topBorder + 1;
  console.log(`Inner board: ${innerW} x ${innerH} (from ${leftBorder},${topBorder} to ${rightBorder},${bottomBorder})`);

  // Now find tile dividers within the inner board
  // Scan horizontally at the middle of the inner board to find vertical divider lines
  // The blue border lines separate the outer tiles from the center
  
  // Find inner rectangle (where center area begins)
  // Scan from left at y = topBorder + 100 (middle of top tile height)
  console.log('\n=== FINDING TILE GRID BOUNDARIES ===');
  
  // Scan from left to find the right edge of left column
  // The left column ends where the center area begins (blue border line)
  // Look for the transition at x around 140 (expected corner width + left border)
  console.log('\nHorizontal scan at y=' + (topBorder + 70) + ':');
  for (let x = leftBorder; x < leftBorder + 160; x++) {
    const px = getPixel(x, topBorder + 70);
    // Look for blue border (the thick line between tiles and center)
    if (px.r < 80 && px.g > 100 && px.b > 150) {
      console.log(`  Blue line found at x=${x}: rgb(${px.r},${px.g},${px.b})`);
    }
  }
  
  // Better approach: find exact corner boundaries
  // Look at the blue-ish border line that forms the inner rectangle
  // Scan horizontal line at center of board
  const midY = Math.floor(topBorder + innerH / 2);
  console.log(`\nScanning at midY=${midY} for left/right inner borders:`);
  
  // From left, find where blue border starts (left column right edge)
  let leftInner = leftBorder;
  for (let x = leftBorder; x < leftBorder + 200; x++) {
    const px = getPixel(x, midY);
    // Looking for the blue border line that separates tiles from center
    if (px.r < 80 && px.g > 100 && px.b > 150) {
      leftInner = x;
      break;
    }
  }
  
  // Continue to find where blue border ends (center area starts)  
  let leftInnerEnd = leftInner;
  for (let x = leftInner; x < leftInner + 20; x++) {
    const px = getPixel(x, midY);
    if (!(px.r < 80 && px.g > 100 && px.b > 150)) {
      leftInnerEnd = x;
      break;
    }
  }
  
  // From right, find inner border
  let rightInner = rightBorder;
  for (let x = rightBorder; x > rightBorder - 200; x--) {
    const px = getPixel(x, midY);
    if (px.r < 80 && px.g > 100 && px.b > 150) {
      rightInner = x;
      break;
    }
  }
  
  let rightInnerStart = rightInner;
  for (let x = rightInner; x > rightInner - 20; x--) {
    const px = getPixel(x, midY);
    if (!(px.r < 80 && px.g > 100 && px.b > 150)) {
      rightInnerStart = x;
      break;
    }
  }

  // Vertical inner borders
  const midX = Math.floor(leftBorder + innerW / 2);
  let topInner = topBorder;
  for (let y = topBorder; y < topBorder + 200; y++) {
    const px = getPixel(midX, y);
    if (px.r < 80 && px.g > 100 && px.b > 150) {
      topInner = y;
      break;
    }
  }
  let topInnerEnd = topInner;
  for (let y = topInner; y < topInner + 20; y++) {
    const px = getPixel(midX, y);
    if (!(px.r < 80 && px.g > 100 && px.b > 150)) {
      topInnerEnd = y;
      break;
    }
  }

  let bottomInner = bottomBorder;
  for (let y = bottomBorder; y > bottomBorder - 200; y--) {
    const px = getPixel(midX, y);
    if (px.r < 80 && px.g > 100 && px.b > 150) {
      bottomInner = y;
      break;
    }
  }
  let bottomInnerStart = bottomInner;
  for (let y = bottomInner; y > bottomInner - 20; y--) {
    const px = getPixel(midX, y);
    if (!(px.r < 80 && px.g > 100 && px.b > 150)) {
      bottomInnerStart = y;
      break;
    }
  }

  console.log(`\nLeft column: from x=${leftBorder} to x=${leftInner} (width=${leftInner - leftBorder})`);
  console.log(`Right column: from x=${rightInnerStart} to x=${rightBorder} (width=${rightBorder - rightInnerStart})`);
  console.log(`Top row: from y=${topBorder} to y=${topInner} (height=${topInner - topBorder})`);
  console.log(`Bottom row: from y=${bottomInnerStart} to y=${bottomBorder} (height=${bottomBorder - bottomInnerStart})`);
  
  const cornerWidth = leftInner - leftBorder;
  const cornerHeight = topInner - topBorder;
  console.log(`\nCorner size: ${cornerWidth} x ${cornerHeight}`);
  
  // Now find individual tile dividers
  // Scan the bottom row (y = bottomBorder - 20) horizontally to find column separators
  const scanRowY = bottomBorder - 30;
  console.log(`\nScanning bottom row at y=${scanRowY} for vertical tile dividers:`);
  
  // Look for blue vertical lines between tiles
  let prevBlue = false;
  let dividers = [];
  for (let x = leftBorder + cornerWidth; x < rightBorder - cornerWidth; x++) {
    const px = getPixel(x, scanRowY);
    const isBlue = px.r < 80 && px.g > 100 && px.b > 150;
    if (isBlue && !prevBlue) {
      dividers.push(x);
    }
    prevBlue = isBlue;
  }
  console.log('Bottom row tile dividers:', dividers);
  console.log('Tile widths:', dividers.map((d, i) => {
    if (i === 0) return d - (leftBorder + cornerWidth);
    return d - dividers[i - 1];
  }));

  // Scan left column vertically for horizontal tile dividers  
  const scanColX = leftBorder + 30;
  console.log(`\nScanning left column at x=${scanColX} for horizontal tile dividers:`);
  
  prevBlue = false;
  let vDividers = [];
  for (let y = topBorder + cornerHeight; y < bottomBorder - cornerHeight; y++) {
    const px = getPixel(scanColX, y);
    const isBlue = px.r < 80 && px.g > 100 && px.b > 150;
    if (isBlue && !prevBlue) {
      vDividers.push(y);
    }
    prevBlue = isBlue;
  }
  console.log('Left column tile dividers:', vDividers);
  console.log('Tile heights:', vDividers.map((d, i) => {
    if (i === 0) return d - (topBorder + cornerHeight);
    return d - vDividers[i - 1];
  }));

  // Final calculations
  console.log('\n=== FINAL CALCULATIONS ===');
  console.log(`Image: ${width} x ${height}`);
  console.log(`Black border: top=${topBorder}, left=${leftBorder}, bottom=${height-1-bottomBorder}, right=${width-1-rightBorder}`);
  console.log(`Inner board: ${innerW} x ${innerH}`);
  
  // As percentages of the FULL image
  const cornerWPct = cornerWidth / width * 100;
  const cornerHPct = cornerHeight / height * 100;
  console.log(`\nCorner as % of FULL image: ${cornerWPct.toFixed(4)}% x ${cornerHPct.toFixed(4)}%`);
  
  // Offset of inner board from image edges (as % of full image)
  const offsetLeft = leftBorder / width * 100;
  const offsetTop = topBorder / height * 100;
  const offsetRight = (width - 1 - rightBorder) / width * 100;
  const offsetBottom = (height - 1 - bottomBorder) / height * 100;
  console.log(`Border offsets as %: left=${offsetLeft.toFixed(4)}%, top=${offsetTop.toFixed(4)}%, right=${offsetRight.toFixed(4)}%, bottom=${offsetBottom.toFixed(4)}%`);
  
  // Inner board dimensions as % of full image
  const innerWPct = innerW / width * 100;
  const innerHPct = innerH / height * 100;
  console.log(`Inner board as %: ${innerWPct.toFixed(4)}% x ${innerHPct.toFixed(4)}%`);
  
  // Calculate tile sizes as % of full image
  if (dividers.length >= 2) {
    const avgTileW = (dividers[dividers.length - 1] - dividers[0]) / (dividers.length - 1);
    console.log(`\nAvg horizontal tile width: ${avgTileW.toFixed(2)}px = ${(avgTileW/width*100).toFixed(4)}%`);
  }
  if (vDividers.length >= 2) {
    const avgTileH = (vDividers[vDividers.length - 1] - vDividers[0]) / (vDividers.length - 1);
    console.log(`Avg vertical tile height: ${avgTileH.toFixed(2)}px = ${(avgTileH/height*100).toFixed(4)}%`);
  }
}

measurePrecise().catch(console.error);
