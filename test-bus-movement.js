// Test bus movement with ground collision
const CANNON = require('cannon');

console.log('=== BUS MOVEMENT TEST ===\n');

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

// Materials with low friction
const groundMaterial = new CANNON.Material('ground');
const busMaterial = new CANNON.Material('bus');
const busGroundContact = new CANNON.ContactMaterial(busMaterial, groundMaterial, {
    friction: 0.0,
    restitution: 0.1
});
world.addContactMaterial(busGroundContact);

// Ground
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.collisionFilterGroup = 1;
groundBody.collisionFilterMask = -1;
world.addBody(groundBody);

// Bus (box shape like game.js)
const busShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 4));
const busBody = new CANNON.Body({
    mass: 1500,
    position: new CANNON.Vec3(0, 3, 30),
    shape: busShape,
    material: busMaterial
});
busBody.collisionFilterGroup = 2;
busBody.collisionFilterMask = 1 | 2 | 4;
world.addBody(busBody);

console.log('Initial position:', busBody.position.x.toFixed(2), busBody.position.y.toFixed(2), busBody.position.z.toFixed(2));

// Let bus fall to ground
console.log('\n--- Phase 1: Let bus fall to ground ---');
const dt = 1 / 60;
for (let i = 0; i < 60; i++) {
    world.step(dt);
}
console.log('After 1 second (falling):', busBody.position.x.toFixed(2), busBody.position.y.toFixed(2), busBody.position.z.toFixed(2));
console.log('Velocity:', busBody.velocity.x.toFixed(3), busBody.velocity.y.toFixed(3), busBody.velocity.z.toFixed(3));

// Apply forward force (simulating ArrowUp key)
console.log('\n--- Phase 2: Apply forward force (8000 N) for 3 seconds ---');
const acceleration = 80;
const engineForce = acceleration * 100; // 8000 N

const startZ = busBody.position.z;
for (let i = 0; i < 180; i++) { // 3 seconds at 60fps
    const forward = new CANNON.Vec3(0, 0, 1);
    const rotatedForward = busBody.quaternion.vmult(forward);
    const force = new CANNON.Vec3(
        rotatedForward.x * engineForce,
        0,
        rotatedForward.z * engineForce
    );
    busBody.applyForce(force, busBody.position);
    
    // Apply downforce like game.js
    busBody.applyForce(new CANNON.Vec3(0, -500, 0), busBody.position);
    
    // Apply damping like game.js
    busBody.velocity.x *= 0.99;
    busBody.velocity.y *= 0.99;
    busBody.velocity.z *= 0.99;
    
    world.step(dt);
}
const distance = busBody.position.z - startZ;
console.log('After 3 seconds:', busBody.position.x.toFixed(2), busBody.position.y.toFixed(2), busBody.position.z.toFixed(2));
console.log('Distance traveled:', distance.toFixed(2), 'm');
console.log('Velocity:', busBody.velocity.x.toFixed(3), busBody.velocity.y.toFixed(3), busBody.velocity.z.toFixed(3));

// Check if bus moved
const busMoved = distance > 5;
console.log('\nBus moved forward:', busMoved ? '✅ PASS' : '❌ FAIL (bus is stuck)');

// Additional test: check velocity
const hasVelocity = Math.abs(busBody.velocity.z) > 1;
console.log('Bus has velocity:', hasVelocity ? '✅ PASS' : '❌ FAIL');

// Summary
console.log('\n=== SUMMARY ===');
if (busMoved && hasVelocity) {
    console.log('✅ Bus can move on ground with friction 0.01');
} else {
    console.log('❌ Bus is stuck - friction too high or other issue');
}
