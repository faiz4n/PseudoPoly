import fs from 'fs';
import path from 'path';
import { decompress } from 'fzstd';

function decompileGdc(filePath) {
  console.log("\n=======================================================");
  console.log("DECOMPRESSING GDC:", path.basename(filePath));
  console.log("=======================================================");
  const b = fs.readFileSync(filePath);
  const zstdPayload = b.subarray(12);
  
  try {
    const decompressed = decompress(zstdPayload);
    console.log("Decompressed size:", decompressed.length);
    
    // Extract ASCII strings of length >= 3
    let s = "";
    const strings = [];
    for (let i = 0; i < decompressed.length; i++) {
      const byte = decompressed[i];
      if (byte >= 32 && byte <= 126) {
        s += String.fromCharCode(byte);
      } else {
        if (s.length >= 3) strings.push(s);
        s = "";
      }
    }
    
    console.log("Extracted strings count:", strings.length);
    console.log([...new Set(strings)].slice(0, 150).join("\n"));
  } catch (err) {
    console.error("Decompression failed:", err.message);
  }
}

decompileGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/bank_dialog.gdc');
decompileGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/credit_dialog.gdc');
decompileGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/deal_dialog.gdc');
decompileGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/deal_offer_dialog.gdc');
