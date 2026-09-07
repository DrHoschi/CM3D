import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('../src/ui/sketch-connectivity-actions.js', import.meta.url), 'utf8');
const commands = fs.readFileSync(new URL('../src/application/sketch-connectivity-commands.js', import.meta.url), 'utf8');

assert.match(main, /const BUILD_ID = 'WD-21B\.5'/);
assert.match(main, /installSketchConnectivityActions/);
assert.match(main, /installSketchConnectivityCommands\(store\)/);
assert.match(main, /installSketchConnectivityActions\(store\)/);

assert.match(ui, /context-set\[data-context="sketch"\]/);
assert.match(ui, /sketch-connect-selected/);
assert.match(ui, /sketch-disconnect-selected/);
assert.match(ui, />Verbinden</);
assert.match(ui, />Trennen</);
assert.match(ui, /connectButton\.disabled = !state\.connect\.enabled/);
assert.match(ui, /disconnectButton\.disabled = !state\.disconnect\.enabled/);
assert.match(ui, /store\.connectSelectedSketchPoints\(\)/);
assert.match(ui, /store\.disconnectSelectedSketchEndpoint\(\)/);
assert.match(ui, /version: 'WD-21B\.5'/);
assert.match(ui, /visibleUi: true/);

// B.5 UI must consume B.4 commands, never bypass them with mutation-level calls.
assert.doesNotMatch(ui, /connectSketchPoints\(/);
assert.doesNotMatch(ui, /disconnectSketchLineFromPoint\(/);
assert.doesNotMatch(ui, /Math\.abs|distance|tolerance|epsilon/i);

// B.4 remains the sole owner of selection semantics.
assert.match(commands, /first point = Source|sourcePointId|survivorPointId/);
assert.match(commands, /one-shared-point-plus-one-incident-line/);

console.log('WD-21B.5 Visible Connectivity Actions & Availability Integration: PASS');
