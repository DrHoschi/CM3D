import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/ui/inspector-diagnostics.js', import.meta.url), 'utf8');

assert.match(source, /const DIAGNOSTIC_EXPORT_VERSION = 1;/, 'Diagnostic export must have an explicit version.');
assert.match(source, /export function createDiagnosticSnapshot/, 'Diagnostic snapshot projection must be reusable and testable.');
assert.match(source, /projectReferenceDiagnostics\(store\)/, 'Export must reuse existing reference/recompute diagnostics.');
assert.match(source, /performanceInstrumentation\?\.snapshot\?\.\(\)/, 'Export must reuse existing F086 performance instrumentation.');
assert.match(source, /selection: selectionSnapshot\(store\)/, 'Export must include current selection diagnostics.');
assert.match(source, /sceneSummary: sceneSummary\(store, runtime\)/, 'Export must include existing scene/runtime summary diagnostics.');
assert.match(source, /messages: messages\.map/, 'Export must include existing diagnostic messages.');
assert.match(source, /events: events\.map/, 'Export must include existing store-event diagnostics.');
assert.match(source, /new Blob\(\[JSON\.stringify\(snapshot, null, 2\)\], \{ type: 'application\/json' \}\)/, 'Export must serialize as JSON.');
assert.match(source, /cybermotion-diagnostics-\$\{date\.toISOString\(\)\.replace/, 'Export must use the CyberMotion diagnostics JSON filename.');
assert.match(source, /id="diagnostics-export"/, 'Diagnostics panel must expose an export action.');
assert.doesNotMatch(source, /localStorage|sessionStorage|saveProject|loadProject|schemaVersion\s*=|store\.project\s*=/, 'F124 must not introduce persistence or mutate project authority.');
assert.doesNotMatch(source, /scene:\s*store\.project\?\.scene/, 'Diagnostic export must not duplicate the full project scene as a second project export.');

console.log('WD-29D F124 Diagnostics Export: PASS');
