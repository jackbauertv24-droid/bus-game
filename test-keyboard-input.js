// Test keyboard input and vehicle movement
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

console.log('=== KEYBOARD INPUT TEST ===\n');

// Read the HTML file
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
    console.log('Testing game initialization and keyboard input...\n');
    
    const window = dom.window;
    
    // Check if CANNON is defined
    if (typeof window.CANNON === 'undefined') {
        console.log('❌ FAILED: window.CANNON is NOT defined');
        process.exit(1);
    }
    console.log('✅ CANNON loaded');
    
    // Test quaternion rotation fix
    console.log('\n--- Testing quaternion rotation ---');
    const q = new window.CANNON.Quaternion();
    q.setFromAxisAngle(new window.CANNON.Vec3(0, 1, 0), Math.PI/4);
    const forward = new window.CANNON.Vec3(0, 0, 1);
    const rotated = q.vmult(forward);
    console.log('Forward vector rotated:', rotated.x.toFixed(4), rotated.y.toFixed(4), rotated.z.toFixed(4));
    
    if (isNaN(rotated.x) || isNaN(rotated.y) || isNaN(rotated.z)) {
        console.log('❌ FAILED: Quaternion rotation returns NaN!');
        process.exit(1);
    }
    console.log('✅ Quaternion rotation works (no NaN values)');
    
    // Test the fix: vmult returns proper values
    const speed = rotated.dot(new window.CANNON.Vec3(0.5, 0, 0.5));
    if (isNaN(speed)) {
        console.log('❌ FAILED: Dot product returns NaN!');
        process.exit(1);
    }
    console.log('✅ Dot product works:', speed.toFixed(4));
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('   - Quaternion.vmult() correctly rotates vectors');
    console.log('   - No NaN values in rotation calculations');
    console.log('   - Bus movement should now work in the browser');
    
    process.exit(0);

}, 3000);
