import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales');
const LOCALES = ['en', 'es'];

function flattenKeys(node, prefix = '') {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null ? flattenKeys(value, path) : [path];
  });
}

const keysByLocale = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    new Set(flattenKeys(JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf-8')))),
  ]),
);

let hasMismatch = false;
for (const locale of LOCALES) {
  for (const other of LOCALES.filter((item) => item !== locale)) {
    const missing = [...keysByLocale[other]].filter((key) => !keysByLocale[locale].has(key));
    if (missing.length === 0) continue;
    hasMismatch = true;
    process.stderr.write(
      `Missing in ${locale}.json:\n${missing.map((key) => `  - ${key}`).join('\n')}\n`,
    );
  }
}

if (hasMismatch) process.exit(1);
process.stdout.write(`i18n OK: ${keysByLocale.en.size} keys in ${LOCALES.join(', ')}\n`);
