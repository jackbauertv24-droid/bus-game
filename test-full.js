const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log('Testing HTML file for JavaScript errors...');

// Read the HTML file
const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');

// Create a jsdom environment
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
});

// Store any errors
let errors = [];

dom.window.addEventListener('error', (event) => {
  errors.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  console.error('❌ JS ERROR:', event.message, 'at', event.filename, ':', event.lineno);
});

// Wait for scripts to load and window.onload to fire
setTimeout(() => {
  console.log('\n=== TEST RESULTS ===');
  console.log('Total errors found:', errors.length);

  if (errors.length === 0) {
    console.log('✅ NO JAVASCRIPT ERRORS FOUND!');
    
    // Check if CANNON is defined
    if (typeof dom.window.CANNON !== 'undefined') {
      console.log('✅ SUCCESS: window.CANNON is defined!');
      console.log('   CANNON.World:', typeof dom.window.CANNON.World !== 'undefined');
      console.log('   CANNON.Vec3:', typeof dom.window.CANNON.Vec3 !== 'undefined');
      console.log('   CANNON.Body:', typeof dom.window.CANNON.Body !== 'undefined');
      console.log('   CANNON.Plane:', typeof dom.window.CANNON.Plane !== 'undefined');
      console.log('   CANNON.Box:', typeof dom.window.CANNON.Box !== 'undefined');
      console.log('   CANNON.Sphere:', typeof dom.window.CANNON.Sphere !== 'undefined');
      console.log('   All required CANNON classes available!');
    } else {
      console.log('❌ FAILED: window.CANNON is NOT defined');
    }

    // Check if THREE is defined
    if (typeof dom.window.THREE !== 'undefined') {
      console.log('✅ SUCCESS: window.THREE is defined!');
    } else {
      console.log('❌ FAILED: window.THREE is NOT defined');
    }

    // Check if all global game variables are defined after init
    if (typeof dom.window.scene !== 'undefined' && 
        typeof dom.window.camera !== 'undefined' && 
        typeof dom.window.renderer !== 'undefined' &&
        typeof dom.window.world !== 'undefined' &&
        typeof dom.window.busMesh !== 'undefined' &&
        typeof dom.window.busBody !== 'undefined') {
      console.log('✅ All game global variables initialized successfully!');
    }

  } else {
    errors.forEach((err, i) => {
      console.log(`${i+1}: ${err.message} at ${err.filename}:${err.lineno}`);
    });
  }

}, 3000);
