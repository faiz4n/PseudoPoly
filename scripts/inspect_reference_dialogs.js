import fs from 'fs';
import path from 'path';

function inspectScn(filePath) {
  console.log("=========================================");
  console.log("INSPECTING:", path.basename(filePath));
  console.log("=========================================");
  const buf = fs.readFileSync(filePath);
  let str = "";
  const strings = [];
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b >= 32 && b <= 126) {
      str += String.fromCharCode(b);
    } else {
      if (str.length >= 3) {
        strings.push(str);
      }
      str = "";
    }
  }
  console.log(strings.join("\n"));
}

function dumpGdcStrings(filePath) {
  console.log("=========================================");
  console.log("GDC STRINGS:", path.basename(filePath));
  console.log("=========================================");
  const buf = fs.readFileSync(filePath);
  let str = "";
  const strings = [];
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b >= 32 && b <= 126) {
      str += String.fromCharCode(b);
    } else {
      if (str.length >= 3) {
        strings.push(str);
      }
      str = "";
    }
  }
  console.log(strings.join("\n"));
}

function parsePackedScene(filePath) {
  console.log("\n=======================================================");
  console.log("PARSING NODE TREE:", path.basename(filePath));
  console.log("=======================================================");
  const buf = fs.readFileSync(filePath);
  
  // Find strings in file to get a clean dictionary
  const rawStrings = [];
  let s = "";
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b >= 32 && b <= 126) {
      s += String.fromCharCode(b);
    } else {
      if (s.length >= 2) rawStrings.push({ offset: i - s.length, text: s });
      s = "";
    }
  }

  // Print all meaningful strings in order
  const filtered = rawStrings
    .map(r => r.text)
    .filter(t => !t.startsWith('res://') && !t.startsWith('local://') && t.length > 2);
  
  console.log("Identifiers & Text:");
  console.log([...new Set(filtered)].join(", "));
}

const dealScnPath = 'server/referenceApk/resources/assetPackInstallTime.apk/assets/.godot/exported/133200997/export-b9003d01132c0bb1f6d4007cbd3f64b6-deal_dialog.scn';
const dealOfferPath = 'server/referenceApk/resources/assetPackInstallTime.apk/assets/.godot/exported/133200997/export-6cd404c524363869736873800a0ae6a9-deal_offer_dialog.scn';
const bankScnPath = 'server/referenceApk/resources/assetPackInstallTime.apk/assets/.godot/exported/133200997/export-5c7d6771e97231d7cef7425d1cd5b681-bank_dialog.scn';
const creditScnPath = 'server/referenceApk/resources/assetPackInstallTime.apk/assets/.godot/exported/133200997/export-99b496bf8aa722b4b7a8dd0b36a4d8fb-credit_dialog.scn';

function inspectGdc(filePath) {
  const b = fs.readFileSync(filePath);
  console.log("\n--- GDC File:", path.basename(filePath), "Size:", b.length, "---");
  console.log("Header (hex):", b.subarray(0, 16).toString("hex"));
  console.log("Header (ascii):", b.subarray(0, 16).toString("ascii").replace(/[^\x20-\x7E]/g, "."));
}

inspectGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/deal_dialog.gdc');
inspectGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/deal_offer_dialog.gdc');
inspectGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/bank_dialog.gdc');
inspectGdc('server/referenceApk/resources/assetPackInstallTime.apk/assets/scenes/game/classic/credit_dialog.gdc');







