import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const pages = readdirSync(root).filter((file) => file.endsWith(".html"));
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`OK: ${message}`);
}

for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const missingAlt = (html.match(/<img\b[^>]*>/gi) || []).filter((tag) => !/\salt=/.test(tag));

  title ? pass(`${page} has title (${title.length} chars)`) : fail(`${page} missing title`);
  description ? pass(`${page} has description (${description.length} chars)`) : fail(`${page} missing meta description`);
  h1Count === 1 ? pass(`${page} has one H1`) : fail(`${page} has ${h1Count} H1 tags`);
  missingAlt.length === 0 ? pass(`${page} images have alt attributes`) : fail(`${page} has images missing alt`);
}

existsSync(join(root, "robots.txt")) ? pass("robots.txt exists") : fail("robots.txt missing");
existsSync(join(root, "site.webmanifest")) ? pass("site.webmanifest exists") : fail("site.webmanifest missing");
existsSync(join(root, "favicon-32.png")) ? pass("favicon-32.png exists") : fail("favicon-32.png missing");
existsSync(join(root, "apple-touch-icon.png")) ? pass("apple-touch-icon.png exists") : fail("apple-touch-icon.png missing");

const heavyAssets = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    const ext = extname(full).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm"].includes(ext) && stat.size > 512 * 1024) {
      heavyAssets.push({ file: full.replace(`${root}\\`, ""), kb: Math.round(stat.size / 1024) });
    }
  }
}
walk(join(root, "assets"));

if (heavyAssets.length) {
  console.warn("WARN: large media assets over 512KB:");
  for (const asset of heavyAssets) console.warn(`  ${asset.file} (${asset.kb}KB)`);
} else {
  pass("No media assets over 512KB");
}

if (failures) process.exit(1);
