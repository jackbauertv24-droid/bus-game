const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log('Testing after the latest fix...');

// Read the HTML file
const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');

// Count JavaScript errors
let errors = [];

// Create a jsdom environment that catches errors
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
});

dom.window.addEventListener('error', (event) => {
  const errorMsg = event.message;
  console.error('❌ ERROR:', errorMsg);
  errors.push(errorMsg);
});

// After loading, check results
setTimeout(() => {
  console.log('\n=== FINAL TEST AFTER FIX ===');
  console.log('Total errors:', errors.length);

  // Filter out expected WebGL error
  const realErrors = errors.filter(msg => !msg.includes('Error creating WebGL context'));
  
  console.log('Unexpected errors:', realErrors.length);
  
  if (realErrors.length === 0) {
    console.log('\n✅ SUCCESS! NO UNEXPECTED ERRORS');
    console.log('   - Check CANNON:', typeof dom.window.CANNON !== 'undefined' ? '✅ CANNON defined' : '❌ NO CANNON');
    console.log('   - Method applyQuaternion exists on CANNON.Vec3:', 'undefined' !== typeof dom.window.CANNON.Vec3.prototype.applyQuaternion);
  } else {
    console.log('\n❌ Still has errors:');
    realErrors.forEach(err => console.log('   - ' + err));
  }
}, 2000);
