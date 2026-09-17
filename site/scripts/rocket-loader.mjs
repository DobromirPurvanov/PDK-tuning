import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HTMLRewriter } from '@worker-tools/html-rewriter/base64';

// Astro already handles module loading. Rocket Loader's classic-script preload
// rewrites that behaviour and produces unused-preload warnings for Picker.
// Apply the opt-out AFTER compilation: attributes on source <script> tags would
// make Astro treat TypeScript as inline JavaScript instead of compiling it.
export async function protectScripts(html) {
  return new HTMLRewriter().on('script', {
    element(element) {
      const src = element.getAttribute('src');
      element.removeAttribute('src');
      element.setAttribute('data-cfasync', 'false');
      // Cloudflare requires data-cfasync to precede src.
      if (src !== null) element.setAttribute('src', src);
    },
  }).transform(new Response(html)).text();
}

/** @returns {import('astro').AstroIntegration} */
export default function rocketLoaderOptOut() {
  return {
    name: 'pdk-rocket-loader-opt-out',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let count = 0;
        async function visit(directory) {
          for (const entry of await readdir(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) await visit(path);
            else if (entry.isFile() && entry.name.endsWith('.html')) {
              const html = await readFile(path, 'utf8');
              await writeFile(path, await protectScripts(html));
              count++;
            }
          }
        }
        await visit(fileURLToPath(dir));
        logger.info(`Protected scripts from Rocket Loader in ${count} HTML files`);
      },
    },
  };
}
