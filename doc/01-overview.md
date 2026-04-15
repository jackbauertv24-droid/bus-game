# Overview: Global Variables and Constants

This document covers lines 1-25 of game.js, which define all global variables and constants used throughout the game.

## Global Variables (Lines 2-14)

### Three.js Core Objects

```javascript
let scene, camera, renderer;
```

**Purpose:** These are the fundamental Three.js objects required for any 3D scene.

- `scene`: The container for all 3D objects, lights, and cameras. Every mesh, light, and helper must be added to the scene to be rendered.
- `camera`: Defines the viewpoint from which the scene is rendered. Uses perspective projection to create realistic depth.
- `renderer`: The WebGL renderer that draws the scene to the canvas. Handles all GPU-level rendering operations.

### Physics Objects

```javascript
let world;
let busMesh, busBody;
let wheels = [];
```

**Purpose:** Cannon.js physics objects for simulation.

- `world`: The Cannon.js physics world. Contains all physics bodies and handles collision detection, gravity, and constraint solving.
- `busMesh`: The Three.js Group containing all visual elements of the bus (body, wheels, windows, lights, etc.).
- `busBody`: The Cannon.js RigidBody representing the bus's physics. Has mass, velocity, and responds to forces.
- `wheels`: Array storing wheel objects with both mesh and physics body references.

### Utility Variables

```javascript
let clock;
let keys = {};
let cityBuildings = [];
let groundMesh, groundBody;
```

**Purpose:** Helper variables for game mechanics.

- `clock`: THREE.Clock instance for measuring frame time (delta time) for smooth animations.
- `keys`: Object storing keyboard state. Keys are event.code strings (e.g., 'ArrowUp'), values are booleans.
- `cityBuildings`: Array of building meshes for potential future use (collision detection, etc.).
- `groundMesh`: Three.js mesh for the ground plane (visual representation).
- `groundBody`: Cannon.js body for the ground (physics representation, static).

### Camera Control Variables

```javascript
let cameraAngle = 0;
let cameraDistance = 25;
let cameraHeight = 12;
let isDragging = false;
let lastMouseX = 0;
```

**Purpose:** Variables for orbital camera control system.

- `cameraAngle`: Current rotation angle around the bus in radians. 0 = behind, PI/2 = right side, PI = front.
- `cameraDistance`: Distance from camera to bus in world units. Adjustable via mouse scroll (10-50 range).
- `cameraHeight`: Vertical offset of camera above the bus in world units.
- `isDragging`: Boolean flag indicating if user is currently dragging to rotate camera.
- `lastMouseX`: Last recorded mouse X position, used to calculate rotation delta.

## Bus Parameters (Lines 17-24)

### Movement Constants

```javascript
const maxSpeed = 80;
const acceleration = 80;
const brakeForce = 150;
const friction = 0.92;
```

**Purpose:** Physics tuning constants for realistic vehicle behavior.

- `maxSpeed`: Maximum speed in meters per second (≈288 km/h). Prevents unrealistic velocities.
- `acceleration`: Base acceleration factor. Multiplied by 100 for engine force (8000 Newtons).
- `brakeForce`: Reverse force when braking. Currently defined but uses acceleration for reverse.
- `friction`: Velocity damping factor (0.92 = 8% velocity reduction per frame). Simulates air resistance and rolling resistance.

### Steering Constants

```javascript
const steeringSpeed = 0.05;
const maxSteering = 0.5;
let currentSpeed = 0;
let currentSteering = 0;
```

**Purpose:** Steering behavior configuration.

- `steeringSpeed`: Rate at which steering angle changes per frame (0.05 radians/frame ≈ 2.86°/frame).
- `maxSteering`: Maximum steering angle in radians (0.5 radians ≈ 28.6°). Prevents unrealistic sharp turns.
- `currentSpeed`: Calculated speed in local forward direction. Updated every frame from velocity.
- `currentSteering`: Current steering angle. Smoothly transitions based on input, returns to center when released.

## Design Decisions

### Why Global Variables?

The game uses global variables for simplicity and performance:
- Avoids passing references through multiple function calls
- Allows easy access from any function
- Suitable for a single-scene game where only one instance exists

### Why These Constants?

The constants were chosen through iteration and testing:
- `maxSpeed = 80`: Fast enough to feel exciting, slow enough to control
- `acceleration = 80`: Provides responsive acceleration without being instant
- `friction = 0.92`: Prevents perpetual motion while allowing momentum
- `maxSteering = 0.5`: Tight enough for city streets, wide enough for stability

### Memory Considerations

All arrays (`wheels`, `cityBuildings`, `keys`) are initialized empty and populated during initialization. This prevents null reference errors and allows dynamic sizing.
