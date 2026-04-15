# Input Handling and Vehicle Update

This document covers lines 535-630 of game.js, which handles keyboard input and updates vehicle physics.

## Keyboard Input Handlers

```javascript
function onKeyDown(event) {
    keys[event.code] = true;
}

function onKeyUp(event) {
    keys[event.code] = false;
}
```

### How Input Works

**Event flow:**
1. Browser fires keydown/keyup events
2. Event listeners (added in init) call these handlers
3. Handlers store state in `keys` object
4. `updateVehicle()` reads `keys` every frame

**event.code vs event.key:**
- `event.code`: Physical key location (e.g., 'KeyW', 'ArrowUp')
- `event.key`: Character produced (e.g., 'w', 'W')
- We use `event.code` because it's layout-independent

**keys object structure:**
```javascript
keys = {
    'ArrowUp': true,    // while pressed
    'KeyW': true,       // while pressed
    'ArrowLeft': false, // when released
    // ... etc
}
```

## Function: updateVehicle(delta)

### Steering Logic

```javascript
if (keys['ArrowLeft'] || keys['KeyA']) {
    currentSteering = Math.min(currentSteering + steeringSpeed, maxSteering);
} else if (keys['ArrowRight'] || keys['KeyD']) {
    currentSteering = Math.max(currentSteering - steeringSpeed, -maxSteering);
} else {
    currentSteering *= 0.9;
}
```

**Steering accumulation:**
- Left pressed: Increase steering (positive = left turn)
- Right pressed: Decrease steering (negative = right turn)
- Neither: Return to center (multiply by 0.9)

**Rate of change:**
- steeringSpeed = 0.05 radians/frame
- Takes ~10 frames to reach max steering (0.5 radians)

**Return to center:**
- When no input, steering decays
- Multiplied by 0.9 each frame
- Smooth return, not instant

### Visual Wheel Steering

```javascript
wheels.forEach(wheel => {
    if (wheel.isFront) {
        wheel.mesh.rotation.y = currentSteering;
    }
});
```

**Front wheels only:**
- Front wheels (z > 0) rotate visually
- Rear wheels stay straight
- Matches real car behavior

**Visual feedback:**
- Player sees wheels turn
- Confirms input is registered
- Adds realism

### Acceleration/Braking

```javascript
let engineForce = 0;
if (keys['ArrowUp'] || keys['KeyW']) {
    engineForce = acceleration * 100;
} else if (keys['ArrowDown'] || keys['KeyS']) {
    engineForce = -acceleration * 100;
}
```

**Force calculation:**
- acceleration = 80 (constant)
- engineForce = 80 × 100 = 8000 Newtons
- Negative force for reverse/braking

**Why × 100?**
- acceleration is a multiplier, not actual force
- 8000N is appropriate for a 1500kg bus
- Provides responsive acceleration

### Speed Calculation

```javascript
const forward = new CANNON.Vec3(0, 0, 1);
const rotatedForward = busBody.quaternion.vmult(forward);
const velocity = busBody.velocity;
currentSpeed = rotatedForward.dot(velocity);
```

**Local vs World Velocity:**
- `busBody.velocity` is in world coordinates
- We need speed in bus's forward direction
- Rotate forward vector by bus quaternion
- Dot product gives speed along forward axis

**Why vmult?**

Original bug: Used `quaternion.mult(forward, result)` which multiplies two quaternions, not a quaternion and vector.

Fixed with `quaternion.vmult(forward)` which correctly rotates a vector by a quaternion.

### Steering Physics Application

```javascript
if (Math.abs(currentSpeed) > 0.1) {
    busBody.angularVelocity.y = currentSteering * currentSpeed * 0.3;
} else {
    busBody.angularVelocity.y = 0;
}
```

**Steering only when moving:**
- Requires speed > 0.1 m/s
- Prevents turning while stationary
- Realistic behavior

**Angular velocity calculation:**
- `currentSteering`: Steering angle
- `currentSpeed`: Forward speed
- `0.3`: Turning sensitivity multiplier

**Direction:**
- Positive currentSteering (left) × positive speed (forward) = turn left
- Negative currentSteering (right) × positive speed = turn right
- Negative speed (reverse) reverses turning direction

### Force Application

```javascript
const force = new CANNON.Vec3(0, 0, 0);
if (Math.abs(currentSpeed) < maxSpeed) {
    force.x = rotatedForward.x * engineForce;
    force.z = rotatedForward.z * engineForce;
}
busBody.applyForce(force, busBody.position);
```

**Speed limiting:**
- Only apply force if below maxSpeed (80 m/s)
- Prevents unrealistic velocities
- Natural speed cap

**Force direction:**
- Force applied in rotated forward direction
- Bus accelerates in the direction it faces
- Even when turning, force is forward

**applyForce vs applyImpulse:**
- `applyForce`: Continuous force (N) - integrated over timestep
- `applyImpulse`: Instant velocity change (N·s) - immediate effect

### Damping/Friction

```javascript
busBody.velocity.x *= 0.99;
busBody.velocity.y *= 0.99;
busBody.velocity.z *= 0.99;
```

**Velocity decay:**
- Multiplied by 0.99 each frame
- Simulates air resistance and rolling resistance
- 1% velocity loss per frame

**Why 0.99?**
- Original friction was 0.92 (too much)
- Lower value allows momentum
- Still prevents perpetual motion

### Downforce

```javascript
busBody.applyForce(new CANNON.Vec3(0, -500, 0), busBody.position);
```

**Purpose:**
- Pushes bus toward ground
- Prevents bouncing/flipping
- Keeps tires on surface

**Original value:**
- Was -20000 N (too much)
- Caused strange behavior
- Reduced to -500 N

### Reset Check

```javascript
if (keys['KeyR']) {
    resetBus();
}
```

**R key:**
- Instantly resets bus to starting position
- Useful when stuck or flipped
- Calls `resetBus()` function

### Speed Display

```javascript
const displaySpeed = Math.abs(Math.round(currentSpeed * 3.6));
document.getElementById('speed').textContent = `Speed: ${displaySpeed} km/h`;
```

**Unit conversion:**
- currentSpeed is in m/s
- × 3.6 converts to km/h
- 1 m/s = 3.6 km/h

**Math.abs:**
- Speed always positive
- Direction shown by motion, not sign

### Wheel Animation

```javascript
wheels.forEach(wheel => {
    wheel.mesh.rotation.x += currentSpeed * 0.1;
});
```

**Visual wheel spinning:**
- Wheels rotate around X-axis
- Speed proportional to bus speed
- Positive speed = forward rotation
- Negative speed = reverse rotation

**0.1 multiplier:**
- Controls spin rate
- Higher = faster visual spin
- Doesn't affect physics

## Debug Panel Updates

Lines 593-607 update the debug panel every frame:
- Key pressed (or none)
- Force vector (x, y, z)
- Velocity vector (x, y, z)
- Position (x, y, z)

**Purpose:**
- Visual debugging
- Verify physics values
- Confirm input handling

## Frame-Rate Independence

**delta parameter:**
- Passed to updateVehicle but not currently used
- Could be used for frame-rate independent physics
- Currently physics uses fixed timestep (1/60)

**Potential improvement:**
```javascript
// Not implemented, but could be:
currentSteering += steeringSpeed * delta * 60;
```
