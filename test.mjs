import * as esbuild from "esbuild";
import { execSync } from "child_process";

const code = `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AboutPage } from './src/components/AboutPage';

try {
  const html = renderToString(React.createElement(AboutPage, { onNavigate: () => {} }));
  console.log("SUCCESS");
} catch (e) {
  console.error("ERROR:");
  console.error(e);
}
`;

import fs from "fs";
fs.writeFileSync("test-entry.tsx", code);

await esbuild.build({
  entryPoints: ['test-entry.tsx'],
  bundle: true,
  platform: 'node',
  external: ['react', 'react-dom'],
  outfile: 'test-out.js',
});

try {
  const out = execSync("node test-out.js").toString();
  console.log(out);
} catch(e) {
  console.log(e.stdout?.toString());
  console.error(e.stderr?.toString());
}
