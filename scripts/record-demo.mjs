// Converts the latest Playwright recording into the README demo GIF. The video
// itself is produced by the chat-to-cart e2e run (npm run test:e2e), so the asset
// is always a byproduct of a passing test — never hand-crafted. Requires ffmpeg on
// PATH (the only system dependency).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const RESULTS_DIR = 'test-results';
const OUTPUT = 'docs/demo/chat-to-cart.gif';
// Two-pass palette keeps the GIF crisp and small at a readable frame rate/width.
const FILTERS =
  'fps=12,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer';

/** Newest *.webm under test-results (Playwright writes one per recorded run). */
function findLatestVideo(dir) {
  if (!existsSync(dir)) {
    return null;
  }
  let latest = null;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const candidate = entry.isDirectory()
      ? findLatestVideo(full)
      : entry.name.endsWith('.webm')
        ? full
        : null;
    if (candidate && (!latest || statSync(candidate).mtimeMs > statSync(latest).mtimeMs)) {
      latest = candidate;
    }
  }
  return latest;
}

const video = findLatestVideo(RESULTS_DIR);
if (!video) {
  console.error(`No recording found under ${RESULTS_DIR}/. Run "npm run test:e2e" first.`);
  process.exit(1);
}

mkdirSync(dirname(OUTPUT), { recursive: true });

try {
  execFileSync('ffmpeg', ['-y', '-i', video, '-vf', FILTERS, OUTPUT], { stdio: 'inherit' });
} catch {
  console.error('ffmpeg failed — is it installed and on PATH?');
  process.exit(1);
}

console.log(`\nDemo GIF written to ${OUTPUT} (from ${video}).`);
