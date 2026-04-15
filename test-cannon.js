// Test script to verify CANNON loads correctly
const fs = require('fs');

// Function to load scripts synchronously and check global objects
function loadScript(url) {
  console.log(`Loading: ${url}`);
  const https = require('https');
  const data = [];
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`Loaded ${url} - ${body.length} bytes`);
        resolve(body);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testCANNON() {
  try {
    // Load both scripts
    const threeCode = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
    const cannonCode = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js');
    
    // Create a context and execute both scripts
    const globalContext = {};
    
    // After executing Cannon, check if CANNON exists
    console.log('\n--- Executing scripts and checking global CANNON ---');
    // THREE is loaded first, add to context
    (function() {
        const threeScript = `var window = this; ${threeCode};`;
        (new Function(threeScript)).call(globalContext);
    })();
    
    // Now execute cannon in the same context
    (function() {
        const cannonScript = `var window = this; ${cannonCode};`;
        (new Function(cannonScript)).call(globalContext);
    })();
    
    const CANNON = globalContext.CANNON;
    if (typeof CANNON !== 'undefined') {
      console.log('✅ SUCCESS: CANNON is defined!');
      console.log(`   CANNON version: ${CANNON.VERSION}`);
      console.log('   CANNON.World exists: ' + (typeof CANNON.World !== 'undefined'));
      console.log('   CANNON.Body exists: ' + (typeof CANNON.Body !== 'undefined'));
      console.log('   CANNON.Plane exists: ' + (typeof CANNON.Plane !== 'undefined'));
    } else {
      console.log('❌ FAILED: CANNON is NOT defined');
      process.exit(1);
    }
    
    console.log('\n✅ All tests passed! CANNON loads correctly.');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

testCANNON();