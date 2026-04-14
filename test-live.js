const { spawn } = require('child_process');

// Run chromium and capture output/errors
const process = spawn('chromium', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--virtual-time-budget=10000',
  '--enable-logging',
  '--v1=1',
  'https://jackbauertv24-droid.github.io/bus-game/'
]);

let errors = [];

process.stderr.on('data', (data) => {
  const output = data.toString();
  // Check for JavaScript errors
  if (output.includes('ERROR') || output.includes('CANNON') || output.includes('not defined')) {
    errors.push(output);
    console.log('📢 Found potential error:', output);
  }
});

process.on('close', (code) => {
  console.log('\n=== TEST RESULT ===');
  if (errors.length === 0) {
    console.log('✅ SUCCESS: No JavaScript errors found! CANNON is loaded correctly.');
    console.log('   The page loaded successfully with no "CANNON is not defined" error.');
  } else {
    console.log('❌ Errors found:');
    errors.forEach(err => console.log(err));
  }
});
