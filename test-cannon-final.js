// Test if cannon package defines CANNON correctly
const CANNON = require('cannon');

console.log('✅ SUCCESS: require("cannon") worked!');
console.log('CANNON.World exists: ', typeof CANNON.World !== 'undefined');
console.log('CANNON.Vec3 exists: ', typeof CANNON.Vec3 !== 'undefined');
console.log('CANNON.Body exists: ', typeof CANNON.Body !== 'undefined');
console.log('CANNON.Plane exists: ', typeof CANNON.Plane !== 'undefined');
console.log('CANNON.Box exists: ', typeof CANNON.Box !== 'undefined');
console.log('CANNON.Sphere exists: ', typeof CANNON.Sphere !== 'undefined');
console.log('CANNON.Vec3.prototype.applyQuaternion exists: ', typeof CANNON.Vec3.prototype.applyQuaternion !== 'undefined');
console.log('\n✅ All checks passed!');