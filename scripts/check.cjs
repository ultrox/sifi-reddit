const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../extension');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
if (manifest.manifest_version !== 3 || !/^\d+(\.\d+){0,3}$/.test(manifest.version)) {
  throw new Error('Expected a Manifest V3 extension with a Chromium version.');
}
const scripts = new Set([manifest.background.service_worker]);
const files = new Set([manifest.background.service_worker, ...Object.values(manifest.icons)]);
for (const content of manifest.content_scripts) {
  for (const name of content.js || []) { scripts.add(name); files.add(name); }
  for (const name of content.css || []) files.add(name);
}
for (const ruleset of manifest.declarative_net_request.rule_resources) {
  files.add(ruleset.path);
  JSON.parse(fs.readFileSync(path.join(root, ruleset.path)));
}
for (const file of files) {
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(root + path.sep) || !fs.statSync(resolved).isFile()) {
    throw new Error(`Invalid extension file: ${file}`);
  }
}
for (const file of [...scripts, 'welcome.js']) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
}
if (manifest.content_scripts.find(content => content.js?.includes('mobile.js'))?.run_at !== 'document_start') {
  throw new Error('Mobile layout must initialize before the first paint.');
}
console.log(`Checked ${manifest.name} ${manifest.version}`);
