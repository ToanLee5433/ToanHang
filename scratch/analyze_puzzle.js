const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../src/components/puzzle/puzzle.js'), 'utf8');

// Find all defined methods in class WoodBlockPuzzle
const methodDefs = new Set();
const regexDefs = /^\s*([a-zA-Z0-9_]+)\s*\([^\)]*\)\s*\{/gm;
let match;
while ((match = regexDefs.exec(code)) !== null) {
    methodDefs.add(match[1]);
}

// Find all method calls (this.xxxx)
const methodCalls = new Set();
const regexCalls = /this\.([a-zA-Z0-9_]+)\(/g;
while ((match = regexCalls.exec(code)) !== null) {
    methodCalls.add(match[1]);
}

console.log('--- DEFINED METHODS ---');
console.log(Array.from(methodDefs).sort().join(', '));

console.log('\n--- CALLED METHODS ---');
console.log(Array.from(methodCalls).sort().join(', '));

console.log('\n--- MISSING METHODS ---');
const missing = Array.from(methodCalls).filter(m => !methodDefs.has(m));
console.log(missing.join(', '));
