# Ground and Road System

This document covers lines 170-241 of game.js, which creates the ground plane and road network.

## Function: createGround()

### Visual Ground Mesh

```javascript
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
```

**PlaneGeometry(500, 500):**
- Creates a flat plane 500×500 units
- Centered at origin (0,0,0)
- Default orientation: horizontal (facing up Y+)

**Material Properties:**
- `color: 0x3a7d44`: Dark green (grass color)
- `roughness: 0.8`: Mostly diffuse, not shiny
- `metalness: 0.2`: Slight metallic sheen

**Rotation:**
- `-Math.PI / 2` on X-axis = rotate 90° downward
- Plane starts flat facing up, rotation makes it horizontal ground

**receiveShadow = true:**
- Ground accepts shadows from other objects
- Buildings, bus cast shadows onto ground
- Creates depth and realism

### Physics Ground Body

```javascript
const groundShape = new CANNON.Plane();
groundBody = new CANNON.Body({ mass: 0, material: world.groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
groundBody.collisionFilterGroup = 1;
groundBody.collisionFilterMask = -1;
world.addBody(groundBody);
```

**CANNON.Plane():**
- Infinite plane shape for physics
- More efficient than BoxGeometry for ground
- Collisions calculated as plane equation

**mass: 0:**
- Static body (immovable)
- Infinite mass effectively
- Other objects collide with it, but it never moves

**Material Assignment:**
- Uses `world.groundMaterial` created in `initPhysics()`
- Low friction contact with bus material

**Quaternion Rotation:**
- Same rotation as visual mesh
- `setFromAxisAngle(axis, angle)` rotates around axis
- Axis (1,0,0) = X-axis, angle -π/2 = 90° down

### Collision Filtering

```javascript
groundBody.collisionFilterGroup = 1;
groundBody.collisionFilterMask = -1;
```

**Group 1:** Ground belongs to collision group 1

**Mask -1:** Binary -1 = all bits set = collides with everything

**Binary collision filtering:**
- Each body has a group (what it is)
- Each body has a mask (what it collides with)
- Collision occurs if: `(bodyA.group & bodyB.mask) && (bodyB.group & bodyA.mask)`

## Function: createRoads()

### Road Material

```javascript
const roadMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444444,
    roughness: 0.9 
});
```

- Dark gray asphalt color
- High roughness (matte surface)

### Main Roads

```javascript
const roadHGeometry = new THREE.PlaneGeometry(500, 20);
const roadH = new THREE.Mesh(roadHGeometry, roadMaterial);
roadH.rotation.x = -Math.PI / 2;
roadH.position.set(0, 0.01, 0);
roadH.receiveShadow = true;
scene.add(roadH);

const roadVGeometry = new THREE.PlaneGeometry(20, 500);
const roadV = new THREE.Mesh(roadVGeometry, roadMaterial);
roadV.rotation.x = -Math.PI / 2;
roadV.position.set(0, 0.01, 0);
roadV.receiveShadow = true;
scene.add(roadV);
```

**Two perpendicular roads:**
- Horizontal road: 500 units long, 20 units wide, along Z-axis
- Vertical road: 20 units wide, 500 units long, along X-axis
- Cross at origin, forming a + shape

**Y-position: 0.01:**
- Slightly above ground (0.01 units)
- Prevents Z-fighting (flickering when surfaces overlap)
- Roads render on top of grass

### Road Markings

```javascript
const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

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
```

**Marking Details:**
- White dashes painted on roads
- Each marking: 4×1 unit rectangle
- Spaced 10 units apart
- Y-position: 0.02 (above roads)

**Total markings:**
- Loop: -240 to 240 = 48 iterations
- Horizontal markings: 48
- Vertical markings: 48
- Total: 96 white dashes

**MeshBasicMaterial:**
- Unlit material (always full brightness)
- White markings visible even in shadows
- No lighting calculations = better performance

## World Scale

**Unit system:**
- 1 unit = 1 meter
- Ground: 500m × 500m (250m in each direction)
- Road width: 20m (realistic 4-lane road)
- Marking spacing: 10m (realistic dash spacing)

## Visual Hierarchy

From bottom to top:
1. Ground (y=0): Green grass
2. Roads (y=0.01): Gray asphalt
3. Markings (y=0.02): White paint

This layering ensures correct rendering order.

## Physics Considerations

**No road physics:**
- Roads are purely visual
- Physics ground is flat everywhere
- Simplifies physics simulation

**Alternative approach (not used):**
- Could add friction zones on roads
- Roads could have higher friction than grass
- Would require multiple ground bodies or height maps

## Performance Optimization

**Shared material:**
- All roads use same material instance
- Reduces draw calls
- GPU can batch render roads together

**No physics for roads:**
- Only one ground physics body
- Simplifies collision detection
- Roads don't need separate collision
