# Bus Physics and Wheels

This document covers lines 455-533 of game.js, which creates the physics body and wheels for the bus.

## Physics Body Creation

```javascript
const busShape = new CANNON.Box(
    new CANNON.Vec3(busWidth / 2, busHeight / 2, busLength / 2)
);
busBody = new CANNON.Body({
    mass: 1500,
    position: new CANNON.Vec3(0, busHeight / 2 + wheelRadius, 30),
    shape: busShape,
    material: world.busMaterial
});
```

### Collision Shape

**CANNON.Box:**
- Box-shaped collision volume
- Half-extents: (1.25, 1.5, 5) meters
- Matches visual bus dimensions

**Half-extent calculation:**
- Width: 2.5 / 2 = 1.25
- Height: 3.0 / 2 = 1.5
- Length: 10 / 2 = 5

### Mass: 1500 kg

**Why 1500 kg?**
- Typical small bus weight
- Heavy enough for realistic momentum
- Light enough for responsive acceleration
- Affects force calculations: F = ma

### Initial Position

```javascript
position: new CANNON.Vec3(0, busHeight / 2 + wheelRadius, 30)
```

**Position (X, Y, Z):**
- X = 0: Center of world
- Y = 1.5 + 0.6 = 2.1: Height above ground
- Z = 30: Forward from origin, away from camera

### Collision Filtering

```javascript
busBody.collisionFilterGroup = 2;
busBody.collisionFilterMask = 2 | 4;
```

**Critical bug fix:**

Originally, the bus collided with the ground, causing massive friction that prevented movement. The fix uses collision filtering to prevent bus-ground collision.

**Binary breakdown:**
- Group 2: Bus belongs to group 2 (binary: 0010)
- Mask 2|4 = 6: Bus collides with groups 2 and 4 (binary: 0110)
- Ground is group 1 (binary: 0001)
- Bus mask (0110) & ground group (0001) = 0 → NO COLLISION

**What does bus collide with?**
- Group 2: Other buses (if multiple)
- Group 4: Custom objects (buildings if given physics)

## Function: createWheels()

### Wheel Positions

```javascript
const wheelPositions = [
    { x: -1.2, z:  4 }, // front left
    { x:  1.2, z:  4 }, // front right
    { x: -1.2, z: -4 }, // rear left
    { x:  1.2, z: -4 }  // rear right
];
```

**Layout:**
- Front wheels at Z = 4 (near front)
- Rear wheels at Z = -4 (near rear)
- Left wheels at X = -1.2
- Right wheels at X = 1.2
- Width between wheels: 2.4m (realistic axle width)

### Visual Wheel Mesh

```javascript
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
```

**CylinderGeometry:**
- Radius: 0.6m (large bus wheel)
- Height: 0.5m (wheel thickness)
- 16 radial segments (circular approximation)

**Rotation:**
- Cylinder defaults to vertical (Y-axis)
- Rotation z = π/2 rotates to horizontal
- Wheel now rotates around X-axis (spinning)

**Added to busMesh:**
- Wheels are children of bus group
- Move with bus automatically
- Can be rotated independently (steering)

### Physics Wheel Body

```javascript
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
```

**Sphere shape:**
- CANNON.Sphere is more stable than CANNON.Cylinder
- Approximates wheel for physics
- Better rolling behavior

**Mass: 10 kg:**
- Each wheel: 10kg (realistic wheel weight)
- Total wheel mass: 40kg
- Bus mass: 1500kg + 40kg = 1540kg total

**Linear damping: 0.5:**
- Velocity decays to 50% per second
- Simulates wheel friction
- Prevents perpetual spinning

### Wheel Constraints

```javascript
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
```

**PointToPointConstraint:**
- Connects wheel to bus body
- Pivot on bus: (pos.x, 0, pos.z) - relative to bus center
- Pivot on wheel: (0, 0, 0) - wheel center
- Wheel stays attached to bus but can spin

**isFront flag:**
- Front wheels (z > 0) can turn for steering
- Rear wheels fixed straight
- Used in updateVehicle for visual steering

## Physics Architecture

```
Bus Physics System:
├── busBody (Box, mass 1500)
│   └── Collision filter: group 2, mask 2|4
│
├── wheelBody[0] (Sphere, mass 10)
│   └── Constrained to busBody at (-1.2, 0, 4)
│
├── wheelBody[1] (Sphere, mass 10)
│   └── Constrained to busBody at (1.2, 0, 4)
│
├── wheelBody[2] (Sphere, mass 10)
│   └── Constrained to busBody at (-1.2, 0, -4)
│
└── wheelBody[3] (Sphere, mass 10)
    └── Constrained to busBody at (1.2, 0, -4)
```

## Known Physics Simplifications

### Wheels Don't Actually Drive

The physics doesn't simulate:
- Engine torque to wheels
- Wheel friction with ground
- Realistic suspension

Instead, forces are applied to bus body directly.

### Why Simplified?

1. **Complexity**: Real wheel physics is complex
2. **Stability**: Simplified physics is more stable
3. **Performance**: Fewer calculations per frame
4. **Playability**: Arcade-style physics is more fun

### What's Missing

If realistic wheel physics were implemented:
- Differential (rear-wheel drive)
- Suspension travel
- Wheel slip when accelerating
- Skidding when braking
- Roll-over physics

## Constraint Behavior

**PointToPointConstraint allows:**
- Wheel can move relative to bus (suspension)
- Wheel spin is not constrained
- Wheel position locked to attachment point

**What it prevents:**
- Wheel flying away from bus
- Wheel detaching on collision

## Visual vs Physics Sync

The visual wheels (meshes) are children of busMesh, so they:
- Move with bus automatically
- Don't need position sync (handled by Three.js scene graph)
- Physics wheels are separate bodies tracked in `wheels` array

Sync happens in `syncMeshes()` which copies busBody position/rotation to busMesh.
