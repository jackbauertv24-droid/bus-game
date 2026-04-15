// Test different CDNs to find one that defines global CANNON

const https = require('https');

function testCDN(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

 async function tryCDN(url, name) {
  console.log(`\nTesting ${name}: ${url}`);
  try {
    // Load into isolated context with window
    const code = await testCDN(url);
    console.log(`Loaded: ${code.length} bytes`);
    
    const context = { window: {} };
    const script = `var window = this; ${code}`;
    (new Function(script)).call(context);
    
    const CANNON = context.window.CANNON;
    if (typeof CANNON !== 'undefined') {
      console.log(`✅ SUCCESS: CANNON is defined! Version: ${CANNON.VERSION}`);
      return true;
    } else {
      console.log(`❌ FAILED: CANNON not defined`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ERROR: ${e.message}`);
    return false;
  }
}

async function runTests() {
  const tests = [
    {
      name: "cdnjs 0.20.0 (original cannon)",
      url: "https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.20.0/cannon.min.js"
    },
    {
      name: "jsDelivr cannon-es 0.20.0 (maintained fork)",
      url: "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js"
    },
    {
      name: "jsDelivr cannon 0.6.2",
      url: "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.min.js"
    }
  ];

  for (const test of tests) {
    const success = await tryCDN(test.url, test.name);
    if (success) {
      console.log(`\n🎯 FOUND working URL: ${test.url}`);
      console.log(`Use this URL in the HTML!`);
      // Store the successful URL for future reference
      require('fs').writeFileSync('working-url.txt', test.url + '\n');
      process.exit(0);
    }
  }

  console.log("\n❌ None of the CDNs worked");
  process.exit(1);
}

runTests();