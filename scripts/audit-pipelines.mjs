/**
 * Pipeline Standards Audit Runner
 * ───────────────────────────────
 * Developer-only, build-time script.
 * Validates that each persistence pipeline in src/store/effects/
 * follows the agreed conventions.
 *
 * Run:  node scripts/audit-pipelines.mjs
 */

import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EFFECTS_DIR = join(__dirname, "..", "src", "store", "effects");

// Only audit persistence pipeline files (skip utils folder and initializeClientState)
const pipelineFiles = readdirSync(EFFECTS_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "initializeClientState.ts");

const ok = (v) => (v ? "✅" : "❌");

console.log("\n🩰 SERENA Pipeline Standards Audit");
console.log("═".repeat(50));

let totalPass = 0;
let totalFail = 0;

for (const file of pipelineFiles) {
  const content = readFileSync(join(EFFECTS_DIR, file), "utf-8");
  const name = file.replace(".ts", "");

  const checks = {
    "SSR guard (typeof window)":
      content.includes('typeof window === "undefined"') ||
      content.includes("typeof window === 'undefined'"),
    "Idempotency flag (alreadyInitialized)":
      content.includes("alreadyInitialized"),
    "Exported init function":
      /export\s+(async\s+)?function\s+init/.test(content),
    "Calls hydrate action":
      /hydrate/i.test(content),
    "No direct localStorage outside guard":
      !/(^|\n)(?!.*typeof window).*localStorage\./m.test(content) ||
      content.includes('typeof window === "undefined"') ||
      content.includes("typeof window === 'undefined'"),
  };

  console.log(`\n📄 ${name}`);
  for (const [label, passed] of Object.entries(checks)) {
    console.log(`   ${ok(passed)} ${label}`);
    if (passed) totalPass++;
    else totalFail++;
  }
}

console.log("\n" + "═".repeat(50));
console.log(`Total: ${totalPass} passed, ${totalFail} failed`);
if (totalFail > 0) {
  console.log("⚠️  Some pipelines need attention.\n");
} else {
  console.log("✨ All pipelines conform to standards.\n");
}
