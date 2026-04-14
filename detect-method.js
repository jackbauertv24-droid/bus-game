const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.addEventListener('load', () => {
  // Check what methods are available
  if (dom.window.CANNON) {
    console.log('CANNON exists! Checking Vec3 prototype...');
    const vec = new dom.window.CANNON.Vec3(0,0,1);
    console.log('Vec3 methods:');
    for (let m in vec) {
      if (m.includes('mult') || m.includes('rot') || m.includes('quat')) {
        console.log('  -', m);
      }
    }
    console.log('\nAll Vec3 methods: ', Object.keys(vec));
  }
});
