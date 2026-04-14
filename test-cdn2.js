// Test the unminified version or find correct path

const https = require('https');

function tryCDN(url, name) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({body, url, name});
      });
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  const tests = [
    {
      name: "cannon-es UMD build",
      url: "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.umd.min.js"
    },
    {
      name: "cannon (og) build",
      url: "https://unpkg.com/cannon@0.6.2/build/cannon.js"
    },
    {
      name: "github raw cannon-es",
      url: "https://raw.githubusercontent.com/schteppe/cannon.js/master/build/cannon.min.js"
    }
  ];

  for (const test of tests) {
    try {
      global.CANNON = undefined;
      const result = await tryCDN(test.url, test.name);
      
      // Check if this has UMD wrapper that exports to global
      if (result.body.includes('CANNON')) {
        console.log(`Contains CANNON: ${test.name}`);
        eval(result.body);
        if (typeof CANNON !== 'undefined') {
          console.log(`✅ SUCCESS! ${test.name} at ${test.url}`);
          console.log(`CANNON version: ${CANNON.VERSION}`);
          require('fs').writeFileSync('working-url.txt', test.url + '\n');
          break;
        }
      }
    } catch (e) {
      console.log(`Error with ${test.name}: ${e.message}`);
    }
  }
}

run();