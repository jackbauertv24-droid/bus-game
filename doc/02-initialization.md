# Initialization: The init() Function

This document covers lines 26-129 of game.js, which contains the main initialization function that sets up the entire game.

## Function Overview

The `init()` function is the entry point for the entire game. It's called automatically when the page loads via `window.onload = init` at the end of the file. This function creates and configures all game systems in the correct order.

## Scene Creation (Lines 28-31)

```javascript
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
```

**Purpose:** Creates the Three.js scene with sky-blue background and distance fog.

- `scene.background`: Sets clear color to light blue (0x87CEEB = RGB 135, 206, 235), simulating a clear sky.
- `scene.fog`: Adds atmospheric fog that increases with distance. Objects beyond 500 units are fully fogged, creating a natural horizon.

**Why Fog?** Fog serves two purposes:
1. Hides the edge of the world naturally
2. Adds depth perception and atmosphere

## Camera Setup (Lines 33-40)

```javascript
camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 10, 20);
```

**Purpose:** Creates a perspective camera with appropriate field of view and clipping planes.

- `75`: Field of view in degrees. Wider angle (75°) gives better peripheral vision for driving.
- `window.innerWidth / window.innerHeight`: Aspect ratio matches the browser window.
- `0.1`: Near clipping plane. Objects closer than 0.1 units won't render.
- `1000`: Far clipping plane. Objects beyond 1000 units won't render.
- Initial position `(0, 10, 20)`: 10 units up, 20 units back from origin. This initial position is immediately overwritten by `updateCamera()`.

## Renderer Configuration (Lines 42-47)

```javascript
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
```

**Purpose:** Creates WebGL renderer with anti-aliasing and shadow support.

- `antialias: true`: Smooths jagged edges on diagonal lines. Slight performance cost but essential for visual quality.
- `setSize()`: Matches renderer resolution to window size.
- `shadowMap.enabled = true`: Activates shadow rendering. Requires lights with `castShadow = true`.
- `PCFSoftShadowMap`: Percentage-Closer Filtering produces soft shadow edges. More expensive than basic shadows but looks natural.
- `appendChild()`: Adds the canvas element to the DOM, making it visible.

## Initialization Order (Lines 49-60)

```javascript
initPhysics();
createLighting();
createGround();
createCity();
createBus();
```

**Order is critical:**

1. **initPhysics()** - Must be first because ground and bus need physics materials
2. **createLighting()** - Lights needed before shadows can be cast
3. **createGround()** - Ground provides the surface for the bus and city
4. **createCity()** - Buildings need ground below them
5. **createBus()** - Bus is the player object, created last so it appears on top

## Clock for Animation (Line 63)

```javascript
clock = new THREE.Clock();
```

**Purpose:** Tracks elapsed time and provides delta time for frame-rate-independent animation.

- `clock.getDelta()`: Returns seconds since last call
- Essential for smooth physics: force per second, not per frame

## Event Listeners: Keyboard (Lines 65-68)

```javascript
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
document.getElementById('resetBtn').addEventListener('click', resetBus);
window.addEventListener('resize', onWindowResize);
```

**Purpose:** Register event handlers for user input.

- `keydown`: Fires when any key is pressed down
- `keyup`: Fires when any key is released
- `resetBtn.click`: Handles reset button in UI
- `resize`: Handles browser window resize

## On-Screen Button Controls (Lines 71-95)

```javascript
const btnUp = document.getElementById('btnUp');
// ... similar for btnDown, btnLeft, btnRight

btnUp.addEventListener('mousedown', () => { keys['ArrowUp'] = true; });
btnUp.addEventListener('mouseup', () => { keys['ArrowUp'] = false; });
btnUp.addEventListener('touchstart', () => { keys['ArrowUp'] = true; });
btnUp.addEventListener('touchend', () => { keys['ArrowUp'] = false; });
```

**Purpose:** Enable touch and mouse controls for mobile/desktop.

- Four events per button: mousedown, mouseup, touchstart, touchend
- All modify the same `keys` object as keyboard input
- Allows unified input handling in `updateVehicle()`

**Why Both Mouse and Touch?**
- `mousedown`/`mouseup` for desktop browsers
- `touchstart`/`touchend` for mobile/tablet browsers

## Test Impulse Button (Lines 97-102)

```javascript
const btnImpulse = document.getElementById('btnImpulse');
btnImpulse.addEventListener('click', () => {
    console.log('Applying impulse!');
    busBody.applyImpulse(new CANNON.Vec3(0, 0, 5000), busBody.position);
});
```

**Purpose:** Debugging tool to verify physics is working.

- Applies instant velocity change (impulse) to bus
- 5000 Newton-seconds forward
- Useful for testing physics without needing keyboard

## Camera Controls: Mouse Drag (Lines 104-120)

```javascript
renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        cameraAngle += deltaX * 0.01;
        lastMouseX = e.clientX;
    }
});
```

**Purpose:** Allow user to rotate camera by dragging mouse.

**Event Flow:**
1. `mousedown` on canvas: Start dragging, record mouse X
2. `mousemove` anywhere: If dragging, calculate X delta, update angle
3. `mouseup` anywhere: Stop dragging

**Why window listeners?**
- `mouseup` and `mousemove` on window allow dragging to continue even if cursor leaves canvas

## Camera Controls: Zoom (Lines 122-125)

```javascript
renderer.domElement.addEventListener('wheel', (e) => {
    cameraDistance += e.deltaY * 0.05;
    cameraDistance = Math.max(10, Math.min(50, cameraDistance));
});
```

**Purpose:** Allow user to zoom in/out with mouse wheel.

- `e.deltaY`: Scroll amount (positive = scroll down = zoom out)
- `0.05`: Sensitivity multiplier
- `Math.max(10, Math.min(50, ...))`: Clamp distance between 10 and 50 units

**Clamp Reasoning:**
- Minimum 10: Prevents camera from being inside the bus
- Maximum 50: Prevents camera from being too far to see the bus clearly

## Start Animation Loop (Line 128)

```javascript
animate();
```

**Purpose:** Begin the render loop.

- Calls `animate()` once to start the cycle
- `animate()` uses `requestAnimationFrame()` to call itself recursively
- Creates 60fps loop for rendering and physics updates

## Common Pitfalls Avoided

1. **Physics before rendering**: Physics materials created before bodies
2. **Lights before shadows**: Shadows require lights to exist first
3. **Event listeners after DOM ready**: `window.onload = init` ensures DOM exists
4. **Clamped zoom values**: Prevents invalid camera positions

## Performance Considerations

- All event listeners added once during init, not per frame
- Canvas created once and reused
- Clock created once and queried every frame
