// Test unpkg version
global.window = {};
require('https').get('https://unpkg.com/cannon@0.6.2/build/cannon.min.js', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    eval(body);
    console.log(typeof window.CANNON !== 'undefined' ? '✅ SUCCESS: window.CANNON is defined!' : '❌ FAILED: CANNON not found');
    if (window.CANNON) {
      console.log(`Version: ${window.CANNON.VERSION}`);
    }
  });
});