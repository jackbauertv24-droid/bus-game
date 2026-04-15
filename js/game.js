// Game constants and global variables
let scene, camera, renderer;
let world;
let busMesh, busBody;
let wheels = [];
let clock;
let keys = {};
let cityBuildings = [];
let groundMesh, groundBody;

// Bus parameters
const maxSpeed = 80;
const acceleration = 80;
const brakeForce = 150;
const friction = 0.92;
const steeringSpeed = 0.05;
const maxSteering = 0.5;
let currentSpeed = 0;
let currentSteering = 0;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 10, 20);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Initialize physics
    initPhysics();

    // Create lighting
    createLighting();

    // Create environment
    createGround();
    createCity();

    // Create bus
    createBus();

    // Create clock for timing
    clock = new THREE.Clock();

    // Event listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.getElementById('resetBtn').addEventListener('click', resetBus);
    window.addEventListener('resize', onWindowResize);

    // On-screen button controls
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');

    btnUp.addEventListener('mousedown', () => { keys['ArrowUp'] = true; });
    btnUp.addEventListener('mouseup', () => { keys['ArrowUp'] = false; });
    btnUp.addEventListener('touchstart', () => { keys['ArrowUp'] = true; });
    btnUp.addEventListener('touchend', () => { keys['ArrowUp'] = false; });

    btnDown.addEventListener('mousedown', () => { keys['ArrowDown'] = true; });
    btnDown.addEventListener('mouseup', () => { keys['ArrowDown'] = false; });
    btnDown.addEventListener('touchstart', () => { keys['ArrowDown'] = true; });
    btnDown.addEventListener('touchend', () => { keys['ArrowDown'] = false; });

    btnLeft.addEventListener('mousedown', () => { keys['ArrowLeft'] = true; });
    btnLeft.addEventListener('mouseup', () => { keys['ArrowLeft'] = false; });
    btnLeft.addEventListener('touchstart', () => { keys['ArrowLeft'] = true; });
    btnLeft.addEventListener('touchend', () => { keys['ArrowLeft'] = false; });

    btnRight.addEventListener('mousedown', () => { keys['ArrowRight'] = true; });
    btnRight.addEventListener('mouseup', () => { keys['ArrowRight'] = false; });
    btnRight.addEventListener('touchstart', () => { keys['ArrowRight'] = true; });
    btnRight.addEventListener('touchend', () => { keys['ArrowRight'] = false; });

    // Start animation loop
    animate();
}

// Initialize physics world
function initPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
}

// Create lighting
function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);
}

// Create ground
function createGround() {
    // Three.js mesh
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7d44,
        roughness: 0.8,
        metalness: 0.2
    });
    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Physics body
    const groundShape = new CANNON.Plane();
    groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);

    // Add roads
    createRoads();
}

// Create road network
function createRoads() {
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.9 
    });

    // Main horizontal road
    const roadHGeometry = new THREE.PlaneGeometry(500, 20);
    const roadH = new THREE.Mesh(roadHGeometry, roadMaterial);
    roadH.rotation.x = -Math.PI / 2;
    roadH.position.set(0, 0.01, 0);
    roadH.receiveShadow = true;
    scene.add(roadH);

    // Main vertical road
    const roadVGeometry = new THREE.PlaneGeometry(20, 500);
    const roadV = new THREE.Mesh(roadVGeometry, roadMaterial);
    roadV.rotation.x = -Math.PI / 2;
    roadV.position.set(0, 0.01, 0);
    roadV.receiveShadow = true;
    scene.add(roadV);

    // Add road markings
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Center markings on main roads
    for (let i = -240; i < 240; i += 10) {
        const markingH = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 1),
            markingMaterial
        );
        markingH.rotation.x = -Math.PI / 2;
        markingH.position.set(i, 0.02, 0);
        scene.add(markingH);

        const markingV = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 4),
            markingMaterial
        );
        markingV.rotation.x = -Math.PI / 2;
        markingV.position.set(0, 0.02, i);
        scene.add(markingV);
    }
}

// Create procedural city buildings
function createCity() {
    const buildingColors = [
        0xcccccc, 0xaaaaaa, 0x999999, 0xb0b0b0, 0xd3d3d3
    ];

    // Grid layout for city blocks
    const blockSize = 40;
    const roadWidth = 20;
    const citySize = 10;

    for (let bx = -citySize; bx <= citySize; bx++) {
        for (let bz = -citySize; bz <= citySize; bz++) {
            // Skip areas where roads are
            if (Math.abs(bx) < 1 || Math.abs(bz) < 1) continue;

            const blockX = bx * (blockSize + roadWidth);
            const blockZ = bz * (blockSize + roadWidth);

            // Random number of buildings per block
            const buildingsPerBlock = Math.floor(Math.random() * 4) + 2;

            for (let i = 0; i < buildingsPerBlock; i++) {
                const width = Math.random() * 15 + 10;
                const depth = Math.random() * 15 + 10;
                const height = Math.random() * 40 + 10;

                const posX = blockX + (Math.random() - 0.5) * (blockSize - width);
                const posZ = blockZ + (Math.random() - 0.5) * (blockSize - depth);

                const geometry = new THREE.BoxGeometry(width, height, depth);
                const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
                const material = new THREE.MeshStandardMaterial({ 
                    color: color,
                    roughness: 0.7 
                });
                const building = new THREE.Mesh(geometry, material);
                building.position.set(posX, height / 2, posZ);
                building.castShadow = true;
                building.receiveShadow = true;
                scene.add(building);

                cityBuildings.push(building);
            }
        }
    }
}

// Create the bus with physics - more realistic model
function createBus() {
    // Bus dimensions
    const busWidth = 2.5;
    const busHeight = 3.2;
    const busLength = 10;
    const wheelRadius = 0.6;

    // Create main bus group
    busMesh = new THREE.Group();

    // Main body - lower chassis
    const chassisHeight = busHeight * 0.8;
    const chassisGeometry = new THREE.BoxGeometry(busWidth, chassisHeight, busLength);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xdd2222,
        roughness: 0.4,
        metalness: 0.3
    });
    const chassis = new THREE.Mesh(chassisGeometry, bodyMaterial);
    chassis.position.y = chassisHeight / 2 + wheelRadius;
    chassis.castShadow = true;
    busMesh.add(chassis);

    // Upper cabin - slightly narrower for rounded look
    const cabinWidth = busWidth * 0.95;
    const cabinHeight = busHeight * 0.6;
    const cabinGeometry = new THREE.BoxGeometry(cabinWidth, cabinHeight, busLength * 0.8);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff3333,
        roughness: 0.3,
        metalness: 0.2
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, chassisHeight + cabinHeight / 2 + wheelRadius, 0.5);
    cabin.castShadow = true;
    busMesh.add(cabin);

    // Front bumper
    const bumperGeometry = new THREE.BoxGeometry(busWidth, 0.3, 0.3);
    const bumperMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.8 
    });
    const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    frontBumper.position.set(0, 0.5 + wheelRadius, -busLength / 2 - 0.1);
    frontBumper.castShadow = true;
    busMesh.add(frontBumper);

    // Rear bumper
    const rearBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    rearBumper.position.set(0, 0.5 + wheelRadius, busLength / 2 + 0.1);
    rearBumper.castShadow = true;
    busMesh.add(rearBumper);

    // Headlights
    const headlightGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffcc,
        emissive: 0xffffaa,
        roughness: 0.1 
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.rotation.z = Math.PI / 2;
    leftHeadlight.position.set(-0.8, 1.0 + wheelRadius, -busLength / 2 - 0.25);
    busMesh.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.rotation.z = Math.PI / 2;
    rightHeadlight.position.set(0.8, 1.0 + wheelRadius, -busLength / 2 - 0.25);
    busMesh.add(rightHeadlight);

    // Taillights
    const taillightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff2222,
        emissive: 0xaa0000,
        roughness: 0.2 
    });
    const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    leftTaillight.rotation.z = Math.PI / 2;
    leftTaillight.position.set(-0.8, 1.0 + wheelRadius, busLength / 2 + 0.25);
    busMesh.add(leftTaillight);

    const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    rightTaillight.rotation.z = Math.PI / 2;
    rightTaillight.position.set(0.8, 1.0 + wheelRadius, busLength / 2 + 0.25);
    busMesh.add(rightTaillight);

    // Roof sign/advertisement area
    const signGeometry = new THREE.BoxGeometry(cabinWidth * 0.9, 0.1, busLength * 0.3);
    const signMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee,
        roughness: 0.9 
    });
    const roofSign = new THREE.Mesh(signGeometry, signMaterial);
    roofSign.position.set(0, chassisHeight + cabinHeight + 0.05 + wheelRadius, -1);
    roofSign.castShadow = true;
    busMesh.add(roofSign);

    // Add windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1 
    });

    // Side windows - more numerous for realistic city bus
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue; // Skip middle for spacing
        const leftWindow = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.4, 1.3),
            windowMaterial
        );
        leftWindow.position.set(
            -cabinWidth / 2 - 0.05,
            chassisHeight + cabinHeight / 2 + wheelRadius,
            i * 1.3
        );
        busMesh.add(leftWindow);

        const rightWindow = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.4, 1.3),
            windowMaterial
        );
        rightWindow.position.set(
            cabinWidth / 2 + 0.05,
            chassisHeight + cabinHeight / 2 + wheelRadius,
            i * 1.3
        );
        busMesh.add(rightWindow);
    }

    // Front windshield - larger curved shape approximation
    const frontWindshield = new THREE.Mesh(
        new THREE.BoxGeometry(cabinWidth - 0.2, 1.8, 0.1),
        windowMaterial
    );
    frontWindshield.position.set(
        0,
        chassisHeight + 1.0 + wheelRadius,
        -busLength * 0.4 - 0.05
    );
    cabin.add(frontWindshield);

    // Rear window
    const rearWindshield = new THREE.Mesh(
        new THREE.BoxGeometry(cabinWidth - 0.2, 1.2, 0.1),
        windowMaterial
    );
    rearWindshield.position.set(
        0,
        chassisHeight + 1.2 + wheelRadius,
        busLength * 0.4 + 0.05
    );
    cabin.add(rearWindshield);

    // Door in the front right
    const doorGeometry = new THREE.BoxGeometry(0.1, 2, 2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcc2222,
        roughness: 0.4 
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(
        cabinWidth / 2 + 0.03,
        1 + wheelRadius,
        -1
    );
    cabin.add(door);

    // Position the entire bus
    busMesh.position.y = 0;
    scene.add(busMesh);

    // Physics body for bus - still use box for simplicity
    const busShape = new CANNON.Box(
        new CANNON.Vec3(busWidth / 2, busHeight / 2, busLength / 2)
    );
    busBody = new CANNON.Body({
        mass: 1500, // Heavier for more realistic physics
        position: new CANNON.Vec3(0, busHeight / 2 + wheelRadius, 30),
        shape: busShape
    });
    world.addBody(busBody);

    // Create wheels
    createWheels(busWidth, busLength, wheelRadius);
}

// Create wheels with vehicle physics
function createWheels(busWidth, busLength, wheelRadius) {
    const wheelWidth = 0.5;
    const wheelPositions = [
        { x: -1.2, z:  4 }, // front left
        { x:  1.2, z:  4 }, // front right
        { x: -1.2, z: -4 }, // rear left
        { x:  1.2, z: -4 }  // rear right
    ];

    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.8 
    });

    wheelPositions.forEach(pos => {
        // Three.js wheel mesh
        const wheelGeometry = new THREE.CylinderGeometry(
            wheelRadius,
            wheelRadius,
            wheelWidth,
            16
        );
        const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelMesh.rotation.z = Math.PI / 2;
        wheelMesh.position.set(pos.x, wheelRadius, pos.z);
        wheelMesh.castShadow = true;
        busMesh.add(wheelMesh);

        // Physics wheel
        const wheelShape = new CANNON.Sphere(wheelRadius);
        const wheelBody = new CANNON.Body({
            mass: 10,
            position: new CANNON.Vec3(
                busBody.position.x + pos.x,
                wheelRadius,
                busBody.position.z + pos.z
            )
        });
        wheelBody.addShape(wheelShape);
        wheelBody.linearDamping = 0.5;
        world.addBody(wheelBody);

        // Connect wheel to chassis with point-to-point constraint
        const wheelConstraint = new CANNON.PointToPointConstraint(
            busBody,
            new CANNON.Vec3(pos.x, 0, pos.z),
            wheelBody,
            new CANNON.Vec3(0, 0, 0)
        );
        world.addConstraint(wheelConstraint);

        wheels.push({
            mesh: wheelMesh,
            body: wheelBody,
            isFront: pos.z > 0
        });
    });
}

// Handle keyboard input
function onKeyDown(event) {
    keys[event.code] = true;
}

function onKeyUp(event) {
    keys[event.code] = false;
}

// Update vehicle physics based on input
function updateVehicle(delta) {
    // Steering
    if (keys['ArrowLeft'] || keys['KeyA']) {
        currentSteering = Math.min(currentSteering + steeringSpeed, maxSteering);
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        currentSteering = Math.max(currentSteering - steeringSpeed, -maxSteering);
    } else {
        // Return steering to center
        currentSteering *= 0.9;
    }

    // Apply steering rotation to front wheels
    wheels.forEach(wheel => {
        if (wheel.isFront) {
            wheel.mesh.rotation.y = currentSteering;
        }
    });

    // Acceleration/braking
    let engineForce = 0;
    if (keys['ArrowUp'] || keys['KeyW']) {
        engineForce = acceleration * 100;
    } else if (keys['ArrowDown'] || keys['KeyS']) {
        engineForce = -acceleration * 100;
    }

    // Calculate current speed in local coordinates
    const forward = new CANNON.Vec3(0, 0, 1);
    const rotatedForward = busBody.quaternion.vmult(forward);
    const velocity = busBody.velocity;
    currentSpeed = rotatedForward.dot(velocity);

    // Apply engine force in forward direction
    const force = new CANNON.Vec3(0, 0, 0);
    if (Math.abs(currentSpeed) < maxSpeed) {
        force.x = rotatedForward.x * engineForce;
        force.z = rotatedForward.z * engineForce;
    }
    busBody.applyForce(force, busBody.position);

    // Debug output
    const keyStatus = document.getElementById('keyStatus');
    const forceStatus = document.getElementById('forceStatus');
    const velocityStatus = document.getElementById('velocityStatus');
    const positionStatus = document.getElementById('positionStatus');
    if (keyStatus) {
        const activeKey = keys['ArrowUp'] ? 'UP' : keys['ArrowDown'] ? 'DOWN' : keys['ArrowLeft'] ? 'LEFT' : keys['ArrowRight'] ? 'RIGHT' : 'none';
        keyStatus.textContent = 'Key: ' + activeKey;
    }
    if (forceStatus) forceStatus.textContent = 'Force: ' + force.x.toFixed(1) + ', ' + force.y.toFixed(1) + ', ' + force.z.toFixed(1);
    if (velocityStatus) velocityStatus.textContent = 'Vel: ' + velocity.x.toFixed(2) + ', ' + velocity.y.toFixed(2) + ', ' + velocity.z.toFixed(2);
    if (positionStatus) positionStatus.textContent = 'Pos: ' + busBody.position.x.toFixed(1) + ', ' + busBody.position.y.toFixed(1) + ', ' + busBody.position.z.toFixed(1);

    // Apply damping/friction
    busBody.velocity.x *= friction - Math.abs(currentSteering) * 0.1;
    busBody.velocity.z *= friction;

    // Apply downforce to keep bus on ground
    busBody.applyForce(new CANNON.Vec3(0, -20000, 0), busBody.position);

    // Reset with R key
    if (keys['KeyR']) {
        resetBus();
    }

    // Update speed display
    const displaySpeed = Math.abs(Math.round(currentSpeed * 3.6)); // Convert m/s to km/h
    document.getElementById('speed').textContent = `Speed: ${displaySpeed} km/h`;

    // Spin wheels based on speed
    wheels.forEach(wheel => {
        wheel.mesh.rotation.x += currentSpeed * 0.1;
    });
}

// Reset bus position
function resetBus() {
    busBody.position.set(0, 5, 30);
    busBody.velocity.set(0, 0, 0);
    busBody.angularVelocity.set(0, 0, 0);
    busBody.quaternion.set(0, 0, 0, 1);
    currentSpeed = 0;
    currentSteering = 0;
}

// Update camera to follow bus
function updateCamera() {
    // Get bus position and direction
    const busPosition = new THREE.Vector3(
        busBody.position.x,
        busBody.position.y,
        busBody.position.z
    );

    // Calculate desired camera position (behind and above bus)
    const offset = new THREE.Vector3(0, 8, 15);
    const busQuaternion = new THREE.Quaternion(
        busBody.quaternion.x,
        busBody.quaternion.y,
        busBody.quaternion.z,
        busBody.quaternion.w
    );
    offset.applyQuaternion(busQuaternion);

    // Smoothly move camera to target position
    const targetCameraPos = busPosition.clone().add(offset);
    camera.position.lerp(targetCameraPos, 0.1);

    // Look at bus
    camera.lookAt(busPosition);
}

// Synchronize Three.js meshes with Cannon physics bodies
function syncMeshes() {
    busMesh.position.copy(busBody.position);
    busMesh.quaternion.copy(busBody.quaternion);

    // Wheel meshes are already children of busMesh group, so no need to update position
    // because they are already correctly positioned locally - physics handles constraints automatically
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Step physics
    world.step(1 / 60, delta);

    // Update vehicle based on input
    updateVehicle(delta);

    // Update camera to follow bus
    updateCamera();

    // Synchronize graphics with physics
    syncMeshes();

    // Render scene
    renderer.render(scene, camera);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        createBus,
        updateVehicle,
        getBus: () => ({ busMesh, busBody }),
        resetBus
    };
}

// Start the game when page loads
window.onload = init;
