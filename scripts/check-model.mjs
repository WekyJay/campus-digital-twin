import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';

const glb = fs.readFileSync(join('public', 'models', 'campus.glb'));
assert.equal(glb.toString('ascii', 0, 4), 'glTF', 'Not a binary glTF file');
assert.equal(glb.readUInt32LE(4), 2, 'Expected glTF 2.0');
assert.equal(glb.readUInt32LE(8), glb.length, 'GLB header length mismatch');
const jsonLength = glb.readUInt32LE(12);
const json = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength));
const names = new Set(json.nodes.map((node) => node.name));
for (const name of [
  '00 Square display plinth | solid stone body',
  '07 Campus Lake south basin',
  '07 Campus Lake northeast basin',
  '08 OPEN STONE ARCH 01 | continuous spandrel',
  '08 OPEN STONE ARCH 02 | continuous spandrel',
  '01 Administration & Library main block | podium',
  '02 Academic complex south hub | podium',
  '05 Football pitch',
  '06 Campus gymnasium | podium',
]) assert(names.has(name), `Missing scene object: ${name}`);
assert(json.nodes.length > 3000, 'Incomplete export');
assert(json.materials.length > 30, 'Missing material information');
assert(glb.length < 40 * 1024 * 1024, 'Model too large for lightweight static deployment');
const shaderColors = json.materials
  .map((mat) => mat.pbrMetallicRoughness?.baseColorFactor?.slice(0, 3).join(','))
  .filter(Boolean);
assert(new Set(shaderColors).size > 10, 'Colorful model materials were not exported');
for (const path of ['public/campus_masterplan.jpg', 'public/campus_aerial.png']) {
  assert(fs.existsSync(path), `Missing referenced asset: ${path}`);
}
console.log(`Validated campus GLB: ${(glb.length / 1024 / 1024).toFixed(2)} MiB, ${json.nodes.length} nodes, ${json.materials.length} materials.`);
