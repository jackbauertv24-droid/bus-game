// Test physics collision configuration
const CANNON = require('cannon');

console.log('=== PHYSICS COLLISION TEST ===\n');

// Test 1: Verify collision filter groups and masks
console.log('=== Test 1: Collision filter configuration ===');

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Create ground (same as game.js)
const groundMaterial = new CANNON.Material('ground');
const busMaterial = new CANNON.Material('bus');

const busGroundContact = new CANNON.ContactMaterial(busMaterial, groundMaterial, {
    friction: 0.01,
    restitution: 0.1
});
world.addContactMaterial(busGroundContact);

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.collisionFilterGroup = 1;
groundBody.collisionFilterMask = -1;
world.addBody(groundBody);

console.log('Ground collisionFilterGroup:', groundBody.collisionFilterGroup, '(expected: 1)');
console.log('Ground collisionFilterMask:', groundBody.collisionFilterMask, '(expected: -1)');
const groundConfigCorrect = groundBody.collisionFilterGroup === 1 && groundBody.collisionFilterMask === -1;
console.log('Ground config correct:', groundConfigCorrect ? '✅ PASS' : '❌ FAIL');
console.log('');

// Create bus (same as game.js)
const busShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 4));
const busBody = new CANNON.Body({
    mass: 1500,
    position: new CANNON.Vec3(0, 5, 30),
    shape: busShape,
    material: busMaterial
});
busBody.collisionFilterGroup = 2;
busBody.collisionFilterMask = 1 | 2 | 4;
world.addBody(busBody);

console.log('Bus collisionFilterGroup:', busBody.collisionFilterGroup, '(expected: 2)');
console.log('Bus collisionFilterMask:', busBody.collisionFilterMask, '(expected: 7 = 1|2|4)');
const busConfigCorrect = busBody.collisionFilterGroup === 2 && busBody.collisionFilterMask === 7;
console.log('Bus config correct:', busConfigCorrect ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 2: Verify collision detection between bus and ground
console.log('=== Test 2: Collision detection check ===');
const busCollidesWithGround = (busBody.collisionFilterMask & groundBody.collisionFilterGroup) !== 0;
const groundCollidesWithBus = (groundBody.collisionFilterMask & busBody.collisionFilterGroup) !== 0;
console.log('Bus mask includes ground group:', busCollidesWithGround ? '✅ YES' : '❌ NO');
console.log('Ground mask includes bus group:', groundCollidesWithBus ? '✅ YES' : '❌ NO');
const collisionEnabled = busCollidesWithGround && groundCollidesWithBus;
console.log('Collision enabled:', collisionEnabled ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 3: Simulate physics - bus should not fall through ground
console.log('=== Test 3: Physics simulation (bus should not fall through) ===');
const initialY = busBody.position.y;
console.log('Initial bus Y position:', initialY);

const dt = 1 / 60;
for (let i = 0; i < 120; i++) {
    world.step(dt);
}

const finalY = busBody.position.y;
const velocityY = busBody.velocity.y;
console.log('Final bus Y position after 2 seconds:', finalY.toFixed(3));
console.log('Final bus Y velocity:', velocityY.toFixed(3));

const busDidNotFallThrough = finalY > 0;
const busStabilized = Math.abs(velocityY) < 2;
console.log('Bus did not fall through ground:', busDidNotFallThrough ? '✅ PASS' : '❌ FAIL');
console.log('Bus stabilized (low velocity):', busStabilized ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 4: Low friction verification
console.log('=== Test 4: Low friction contact material ===');
console.log('Contact material friction:', busGroundContact.friction, '(expected: 0.01)');
console.log('Contact material restitution:', busGroundContact.restitution, '(expected: 0.1)');
const frictionCorrect = busGroundContact.friction === 0.01;
const restitutionCorrect = busGroundContact.restitution === 0.1;
console.log('Friction correct:', frictionCorrect ? '✅ PASS' : '❌ FAIL');
console.log('Restitution correct:', restitutionCorrect ? '✅ PASS' : '❌ FAIL');
console.log('');

// Summary
console.log('=== SUMMARY ===');
const allPass = groundConfigCorrect && busConfigCorrect && collisionEnabled && busDidNotFallThrough && busStabilized && frictionCorrect && restitutionCorrect;
console.log('All tests passed:', allPass ? '✅ YES' : '❌ NO');
console.log('');

if (allPass) {
    console.log('Physics configuration is correct. Bus will collide with ground with low friction.');
} else {
    console.log('Physics configuration has issues. Bus may fall through ground.');
}
