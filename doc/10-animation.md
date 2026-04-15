# Reset, Camera, Sync, and Animation

This document covers lines 632-719 of game.js, which handles reset, camera following, mesh synchronization, and the animation loop.

## Function: resetBus()

```javascript
function resetBus() {
    busBody.position.set(0, 5, 30);
    busBody.velocity.set(0, 0, 0);
    busBody.angularVelocity.set(0, 0, 0);
    busBody.quaternion.set(0, 0, 0, 1);
    currentSpeed = 0;
    currentSteering = 0;
}
```

### Reset Operations

**Position: (0, 5, 30)**
- X = 0: Center of world
- Y = 5: 5 meters above ground (drops on reset)
- Z = 30: Forward from origin

**Velocity: (0, 0, 0)**
- Stops all motion
- Essential for clean restart

**Angular velocity: (0, 0, 0)**
- Stops all rotation
- Prevents spinning on reset

**Quaternion: (0, 0, 0, 1)**
- Identity quaternion (no rotation)
- Bus faces forward (+Z)
- X=0, Y=0, Z=0, W=1

**State variables:**
- `currentSpeed = 0`: Reset calculated speed
- `currentSteering = 0`: Reset steering angle

### When Reset is Called

1. **R key pressed**: Manual reset by player
2. **Not called automatically**: Could add auto-reset when flipped

### Potential Enhancement

```javascript
// Not implemented, but could check if bus is flipped:
if (busBody.quaternion.y > 0.9) {
    resetBus();
}
```

## Function: updateCamera()

```javascript
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
    
    camera.position.lerp(targetCameraPos, 0.1);
    
    camera.lookAt(busPosition);
}
```

### Camera Position Calculation

**Angle-based positioning:**
- `cameraAngle`: User-controlled rotation (drag mouse)
- `cameraDistance`: User-controlled zoom (scroll wheel)
- `cameraHeight`: Fixed height above bus

**Trigonometry:**
- `camX = sin(angle) × distance`: Horizontal offset
- `camZ = cos(angle) × distance`: Forward/back offset

**Default angle = 0:**
- `sin(0) = 0`, `cos(0) = 1`
- camX = 0, camZ = distance
- Position: (busX, busY + height, busZ - distance)
- Camera behind bus (at -Z)

**Angle = π (180°):**
- `sin(π) = 0`, `cos(π) = -1`
- camZ = -distance
- Position: (busX, busY + height, busZ + distance)
- Camera in front of bus (at +Z)

### Smooth Camera Movement

```javascript
camera.position.lerp(targetCameraPos, 0.1);
```

**Lerp (Linear Interpolation):**
- Moves camera toward target position
- 0.1 = 10% of distance per frame
- Creates smooth following effect
- Prevents jerky camera

**Why lerp:**
- Without lerp: Camera snaps instantly
- With lerp: Camera smoothly follows
- 0.1 is a good balance (responsive but smooth)

### Camera Look-At

```javascript
camera.lookAt(busPosition);
```

**Always faces bus:**
- Camera rotates to point at bus
- Works from any position
- Ensures bus stays in frame

## Function: syncMeshes()

```javascript
function syncMeshes() {
    busMesh.position.copy(busBody.position);
    busMesh.quaternion.copy(busBody.quaternion);
}
```

### Synchronization Purpose

**Two representations:**
1. `busBody`: Physics simulation (Cannon.js)
2. `busMesh`: Visual representation (Three.js)

**Physics drives visuals:**
- Physics engine calculates position/rotation
- Copy to Three.js mesh each frame
- Visual mesh follows physics body

### Why Copy (Not Reference)

**copy() creates values, not references:**
```javascript
// Correct:
busMesh.position.copy(busBody.position); // Copies x, y, z values

// Would be wrong:
busMesh.position = busBody.position; // Creates reference (types don't match)
```

### Wheel Sync Not Needed

**Wheels are children of busMesh:**
- Added with `busMesh.add(wheelMesh)`
- Inherit bus position/rotation automatically
- Only need their local rotation (steering)

## Function: onWindowResize()

```javascript
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
```

### Resize Handling

**Aspect ratio:**
- Camera FOV depends on screen shape
- Update when window resizes
- Prevents distortion

**Renderer size:**
- Match canvas to window size
- Full-screen rendering

**Projection matrix:**
- Recalculates based on new aspect ratio
- Required after changing camera properties

## Function: animate()

```javascript
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    world.step(1 / 60, delta);

    updateVehicle(delta);

    updateCamera();

    syncMeshes();

    renderer.render(scene, camera);
}
```

### Animation Loop

**requestAnimationFrame:**
- Browser calls animate() before next repaint
- Usually 60 times per second (60 FPS)
- Synchronizes with display refresh

**Recursive call:**
- `animate()` calls `requestAnimationFrame(animate)`
- Creates infinite loop
- Stops when page closes

### Frame Timing

```javascript
const delta = clock.getDelta();
```

**Delta time:**
- Seconds since last frame
- Typically 0.0167s (60 FPS)
- Can vary if frame rate drops

**Usage:**
- Currently passed to updateVehicle but not used
- Could be used for frame-rate independence

### Physics Step

```javascript
world.step(1 / 60, delta);
```

**Fixed timestep:**
- Physics always advances 1/60 second
- Consistent behavior regardless of frame rate
- `delta` is for internal timing corrections

**Cannon.js step parameters:**
1. Fixed timestep (1/60 second)
2. Time since last call (delta)
3. Optional: max substeps (default 3)

### Update Order

**Critical sequence:**
1. **world.step()**: Advance physics
2. **updateVehicle()**: Apply forces based on input
3. **updateCamera()**: Position camera
4. **syncMeshes()**: Copy physics to visuals
5. **renderer.render()**: Draw frame

**Why this order:**
- Physics must be current before applying new forces
- Meshes synced after physics updated
- Camera updated after bus position known
- Render last, with everything current

### Rendering

```javascript
renderer.render(scene, camera);
```

**Draw frame:**
- Renders scene from camera's perspective
- Outputs to canvas
- Displays on screen

## Module Exports

```javascript
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        createBus,
        updateVehicle,
        getBus: () => ({ busMesh, busBody }),
        resetBus
    };
}
```

### Export Purpose

**For testing:**
- Functions accessible in Node.js environment
- Unit tests can call game functions
- Enables `require('./js/game.js')` in tests

**Exported functions:**
- `init`: Full game initialization
- `createBus`: Create bus mesh and physics
- `updateVehicle`: Physics update
- `getBus`: Get bus references
- `resetBus`: Reset bus position

## Window Onload

```javascript
window.onload = init;
```

### Game Start

**When page loads:**
- Browser fires `load` event
- Calls `init()` function
- Game begins

**Why window.onload:**
- Ensures DOM is ready
- HTML elements accessible
- External scripts loaded
