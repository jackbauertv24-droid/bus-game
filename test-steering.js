// Test steering and movement locally
const CANNON = require('cannon');

console.log('=== LOCAL STEERING TEST ===\n');

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Ground
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.collisionFilterGroup = 1;
world.addBody(groundBody);

// Bus
const busBody = new CANNON.Body({
    mass: 1500,
    position: new CANNON.Vec3(0, 2, 30)
});
busBody.addShape(new CANNON.Box(new CANNON.Vec3(1.25, 1.6, 5)));
busBody.collisionFilterGroup = 2;
busBody.collisionFilterMask = 2 | 4;
world.addBody(busBody);

// Game variables
const acceleration = 80;
const maxSpeed = 50;
let currentSteering = 0;
const steeringSpeed = 0.05;
const maxSteering = 0.5;
let currentSpeed = 0;

console.log('Initial: x=0, z=30 (camera at z=20, looking toward +z)');
console.log('');

function simulateStep(keys) {
    // Steering
    if (keys['ArrowLeft']) {
        currentSteering = Math.min(currentSteering + steeringSpeed, maxSteering);
    } else if (keys['ArrowRight']) {
        currentSteering = Math.max(currentSteering - steeringSpeed, -maxSteering);
    } else {
        currentSteering *= 0.9;
    }

    // Engine force
    let engineForce = 0;
    if (keys['ArrowUp']) {
        engineForce = acceleration * 100;
    } else if (keys['ArrowDown']) {
        engineForce = -acceleration * 100;
    }

    // Calculate forward direction
    const forward = new CANNON.Vec3(0, 0, 1);
    const rotatedForward = busBody.quaternion.vmult(forward);
    currentSpeed = rotatedForward.dot(busBody.velocity);

    // Apply steering rotation (NEW FIX)
    if (Math.abs(currentSpeed) > 0.1) {
        busBody.angularVelocity.y = currentSteering * currentSpeed * 0.3;
    } else {
        busBody.angularVelocity.y = 0;
    }

    // Apply engine force
    const force = new CANNON.Vec3(
        rotatedForward.x * engineForce,
        0,
        rotatedForward.z * engineForce
    );
    busBody.applyForce(force, busBody.position);

    // Friction
    busBody.velocity.x *= 0.99;
    busBody.velocity.z *= 0.99;

    world.step(1/60);
}

// Test 1: Accelerate only
console.log('=== Test 1: Accelerate only (UP arrow) ===');
for (let i = 0; i < 120; i++) {
    simulateStep({ ArrowUp: true });
}
console.log('Position:', 'x=' + busBody.position.x.toFixed(2), 'z=' + busBody.position.z.toFixed(2));
console.log('Expected: z should increase (bus moves away from camera)');
console.log('Result:', busBody.position.z > 31 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Reset
busBody.position.set(0, 2, 30);
busBody.velocity.set(0, 0, 0);
busBody.angularVelocity.set(0, 0, 0);
busBody.quaternion.set(0, 0, 0, 1);
currentSteering = 0;

// Test 2: Steer left + accelerate
console.log('=== Test 2: Steer LEFT + Accelerate ===');
for (let i = 0; i < 120; i++) {
    simulateStep({ ArrowLeft: true, ArrowUp: true });
}
console.log('Position:', 'x=' + busBody.position.x.toFixed(2), 'z=' + busBody.position.z.toFixed(2));
console.log('Expected: x should increase (left turn)');
console.log('Result:', busBody.position.x > 0.5 ? '✅ PASS (steering works!)' : '❌ FAIL');
console.log('');

// Reset
busBody.position.set(0, 2, 30);
busBody.velocity.set(0, 0, 0);
busBody.angularVelocity.set(0, 0, 0);
busBody.quaternion.set(0, 0, 0, 1);
currentSteering = 0;

// Test 3: Steer right + accelerate
console.log('=== Test 3: Steer RIGHT + Accelerate ===');
for (let i = 0; i < 120; i++) {
    simulateStep({ ArrowRight: true, ArrowUp: true });
}
console.log('Position:', 'x=' + busBody.position.x.toFixed(2), 'z=' + busBody.position.z.toFixed(2));
console.log('Expected: x should be negative (right turn)');
console.log('Result:', busBody.position.x < -0.5 ? '✅ PASS (steering works!)' : '❌ FAIL');

console.log('\n=== ALL TESTS COMPLETE ===');
