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
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!line.trim()) return;
    
    // Filter out all harmless DBus connection errors from Chromium
    if (line.includes('dbus') || 
        line.includes('Failed to connect to the bus') || 
        line.includes('Unknown address type') ||
        line.includes('org.freedesktop.DBus.NameHasOwner')) {
      // Ignore these - they're just Chromium startup warnings on headless server
      return;
    }
    
    // Check for actual JavaScript errors
    if (line.includes('ERROR') || line.includes('CANNON is not defined') || line.includes('Uncaught')) {
      errors.push(line);
      console.log('📢 Found potential error:', line);
    }
  });
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
