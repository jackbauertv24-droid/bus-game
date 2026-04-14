// Test if jsdelivr cannon defines CANNON
global.window = {};
const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.min.js', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // The UMD pattern should set window.CANNON
    eval(body);
    if (typeof window.CANNON !== 'undefined') {
      console.log('✅ SUCCESS: window.CANNON is defined!');
      console.log('CANNON.World exists: ', typeof window.CANNON.World !== 'undefined');
      console.log('CANNON version: ', window.CANNON.VERSION);
    } else {
      console.log('❌ FAILED: window.CANNON is NOT defined');
    }
  });
});