// Test camera controls implementation
const CANNON = require('cannon');
const THREE = require('three');

console.log('=== CAMERA CONTROLS TEST ===\n');

// Simulate game state
let cameraAngle = 0;
let cameraDistance = 25;
let cameraHeight = 12;

// Physics world
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

// Camera (same as game code)
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

// updateCamera function (copied from game.js)
function updateCamera() {
    const busPosition = new THREE.Vector3(
        busBody.position.x,
        busBody.position.y,
        busBody.position.z
    );

    const camX = Math.sin(cameraAngle) * cameraDistance;
    const camZ = Math.cos(cameraAngle) * cameraDistance;

    const targetCameraPos = new THREE.Vector3(
        busPosition.x + camX,
        busPosition.y + cameraHeight,
        busPosition.z - camZ
    );
    
    camera.position.lerp(targetCameraPos, 1.0);  // 1.0 for instant (test)
    camera.lookAt(busPosition);
}

// Test 1: Default camera position
console.log('=== Test 1: Default camera (angle=0) ===');
updateCamera();
console.log('Bus position: z=' + busBody.position.z.toFixed(2));
console.log('Camera position: x=' + camera.position.x.toFixed(2) + ', y=' + camera.position.y.toFixed(2) + ', z=' + camera.position.z.toFixed(2));
const behindBus = camera.position.z < busBody.position.z;
console.log('Camera is behind bus: ' + (behindBus ? '✅ YES' : '❌ NO'));
console.log('');

// Test 2: Rotate camera 90 degrees (right side)
console.log('=== Test 2: Rotate camera right (angle=PI/2) ===');
cameraAngle = Math.PI / 2;
updateCamera();
console.log('Camera position: x=' + camera.position.x.toFixed(2) + ', z=' + camera.position.z.toFixed(2));
const rightSide = camera.position.x > 20;
console.log('Camera is on right side: ' + (rightSide ? '✅ YES' : '❌ NO'));
console.log('');

// Test 3: Rotate camera to front
console.log('=== Test 3: Rotate camera to front (angle=PI) ===');
cameraAngle = Math.PI;
updateCamera();
console.log('Camera position: x=' + camera.position.x.toFixed(2) + ', z=' + camera.position.z.toFixed(2));
const frontSide = camera.position.z > busBody.position.z;
console.log('Camera is in front of bus: ' + (frontSide ? '✅ YES' : '❌ NO'));
console.log('');

// Test 4: Zoom out
console.log('=== Test 4: Zoom out (distance=40) ===');
cameraAngle = 0;
cameraDistance = 40;
updateCamera();
console.log('Camera position: z=' + camera.position.z.toFixed(2));
const zoomedOut = camera.position.z < (busBody.position.z - 35);
console.log('Camera zoomed out correctly: ' + (zoomedOut ? '✅ YES' : '❌ NO'));
console.log('');

// Test 5: Drive forward, camera follows
console.log('=== Test 5: Camera follows bus ===');
cameraAngle = 0;
cameraDistance = 25;
busBody.position.set(0, 2, 30);

for (let i = 0; i < 60; i++) {
    const forward = new CANNON.Vec3(0, 0, 1);
    const rotatedForward = busBody.quaternion.vmult(forward);
    busBody.applyForce(new CANNON.Vec3(0, 0, 8000), busBody.position);
    busBody.velocity.z *= 0.99;
    world.step(1/60);
}

updateCamera();
console.log('Bus moved to: z=' + busBody.position.z.toFixed(2));
console.log('Camera at: z=' + camera.position.z.toFixed(2));
const follows = camera.position.z < busBody.position.z;
console.log('Camera still behind bus: ' + (follows ? '✅ YES' : '❌ NO'));
console.log('');

// Summary
console.log('=== SUMMARY ===');
console.log('All tests passed: ' + (behindBus && rightSide && frontSide && zoomedOut && follows ? '✅ YES' : '❌ NO'));
