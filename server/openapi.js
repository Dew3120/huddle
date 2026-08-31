import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const source = readFileSync(
  new URL('../docs/openapi.yaml', import.meta.url),
  'utf8',
);

export const openApiDocument = parse(source);
