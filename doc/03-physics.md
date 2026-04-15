# Physics World Initialization

This document covers lines 131-151 of game.js, which sets up the Cannon.js physics world and materials.

## Function: initPhysics()

```javascript
function initPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
```

## Physics World Creation

**CANNON.World:** Creates a new physics simulation world.

- Handles all physics bodies and their interactions
- Manages collision detection between bodies
- Solves constraints and applies forces

## Gravity Configuration

```javascript
world.gravity.set(0, -9.82, 0);
```

**Parameters:**
- X: 0 (no horizontal gravity)
- Y: -9.82 (Earth gravity in m/s², negative = downward)
- Z: 0 (no forward/backward gravity)

**Why -9.82?** This is Earth's gravitational acceleration. It provides realistic falling behavior.

## Broadphase Algorithm

```javascript
world.broadphase = new CANNON.NaiveBroadphase();
```

**What is Broadphase?**

Collision detection has two phases:
1. **Broadphase**: Quick check for potential collisions (coarse)
2. **Narrowphase**: Exact collision calculation (expensive)

**NaiveBroadphase** checks every body against every other body. Simple but O(n²) complexity.

**Why use NaiveBroadphase?**
- Our scene has few dynamic bodies (just bus and 4 wheels)
- Simplicity over optimization
- For games with 100+ objects, consider `SAPBroadphase` (Sweep and Prune)

## Physics Materials

```javascript
const groundMaterial = new CANNON.Material('ground');
const busMaterial = new CANNON.Material('bus');
```

**Purpose:** Physics materials define surface properties for friction and restitution.

- Materials are assigned to physics bodies
- Contact materials define how two materials interact
- Different from visual materials (Three.js materials)

## Contact Material Configuration

```javascript
const busGroundContact = new CANNON.ContactMaterial(busMaterial, groundMaterial, {
    friction: 0.01,
    restitution: 0.1
});
world.addContactMaterial(busGroundContact);
```

**Parameters:**
- `busMaterial`: First material in contact
- `groundMaterial`: Second material in contact
- `friction: 0.01`: Very low friction (almost ice-like)
- `restitution: 0.1`: Low bounce (0 = no bounce, 1 = super bouncy)

**Why Low Friction (0.01)?**

Normal friction values (0.5-0.8) caused the bus to get "stuck" on the ground. The bus-ground collision was causing excessive friction that prevented movement. By setting friction to nearly zero, the bus slides freely.

**This was a critical bug fix.** Originally the bus wouldn't move at all because friction locked it in place.

## Material Storage

```javascript
world.groundMaterial = groundMaterial;
world.busMaterial = busMaterial;
```

**Purpose:** Store materials on the world object for later access.

- Ground body needs groundMaterial when created
- Bus body needs busMaterial when created
- Storing on world avoids global variables

## Physics Architecture

The physics world follows this hierarchy:

```
CANNON.World
├── gravity: Vec3(0, -9.82, 0)
├── broadphase: NaiveBroadphase
├── materials: ['ground', 'bus']
├── contactMaterials: [busGroundContact]
└── bodies: (added later)
    ├── groundBody (static, mass=0)
    ├── busBody (dynamic, mass=1500)
    └── wheelBody x4 (dynamic, mass=10 each)
```

## Performance Implications

**NaiveBroadphase overhead:**
- 5 dynamic bodies = 10 collision checks per frame
- Negligible for this game
- Would be problematic with 50+ objects

**Material lookups:**
- Contact materials cached internally by Cannon.js
- No performance impact after initial setup

## Why Separate Physics from Rendering?

1. **Decoupling**: Physics runs at fixed timestep (60Hz), rendering varies
2. **Interpolation**: Smooth visuals even with physics hiccups
3. **Testing**: Physics can be tested without rendering
4. **Flexibility**: Could switch to different renderer (e.g., different engine)

## Common Issues and Solutions

**Issue:** Bus falling through ground
**Solution:** Ensure ground body has `mass: 0` (static)

**Issue:** Bus bouncing wildly
**Solution:** Reduce restitution to 0.1 or lower

**Issue:** Bus sliding sideways
**Solution:** Friction of 0.01 is intentional for this game; increase for realistic friction

**Issue:** Physics jitter
**Solution:** Increase physics iterations (not shown, defaults are fine for this game)
