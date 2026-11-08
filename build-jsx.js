const fs = require('fs');
const path = require('path');

// Load babel standalone in node
const babelCode = fs.readFileSync(path.join(__dirname, 'babel.min.js'), 'utf8');
const vm = require('vm');
const sandbox = { window: {}, self: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(babelCode, sandbox);
const Babel = sandbox.Babel || sandbox.window.Babel;

if (!Babel) {
  console.error('Failed to load Babel');
  process.exit(1);
}

const files = [
  { in: 'shelf-mount.tsx', out: 'shelf-mount.js' },
  { in: 'conveyor-mount.tsx', out: 'conveyor-mount.js' },
  { in: 'globe-mount.tsx', out: 'globe-mount.js' },
  { in: 'testimonials-mount.tsx', out: 'testimonials-mount.js' },
  { in: 'crowd-mount.tsx', out: 'crowd-mount.js' }
];

files.forEach(({ in: inFile, out: outFile }) => {
  try {
    const code = fs.readFileSync(path.join(__dirname, inFile), 'utf8');
    const result = Babel.transform(code, {
      presets: [
        ['react', { runtime: 'classic' }],
        'typescript'
      ]
    });
    fs.writeFileSync(path.join(__dirname, outFile), result.code, 'utf8');
    console.log(`Successfully compiled ${inFile} -> ${outFile} (${result.code.length} bytes)`);
  } catch (err) {
    console.error(`Error compiling ${inFile}:`, err);
  }
});
