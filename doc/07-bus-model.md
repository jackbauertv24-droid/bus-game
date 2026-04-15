# Bus Model: Visual Construction

This document covers lines 291-454 of game.js, which creates the visual representation of the bus.

## Function: createBus() - Visual Section

### Bus Dimensions

```javascript
const busWidth = 2.5;
const busHeight = 3.0;
const busLength = 10;
const wheelRadius = 0.6;
```

**Real-world scale (1 unit = 1 meter):**
- Width: 2.5m (typical bus width)
- Height: 3.0m (standard bus height)
- Length: 10m (compact city bus)
- Wheel radius: 0.6m (large bus wheel)

### Material Definitions

```javascript
const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFCC00,
    roughness: 0.6,
    metalness: 0.1
});
const blackMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    roughness: 0.8 
});
const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2244AA,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1 
});
```

**Body Material:**
- School bus yellow (0xFFCC00)
- Moderate roughness (painted metal)
- Low metalness (painted surface)

**Black Material:**
- Nearly black (0x111111)
- High roughness (rubber/plastic feel)
- Used for bumpers, mirrors

**Window Material:**
- Blue tint (simulates glass)
- Transparent (opacity 0.3)
- Smooth surface (low roughness)

### Main Body Construction

```javascript
busMesh = new THREE.Group();

const bodyGeometry = new THREE.BoxGeometry(busWidth, busHeight, busLength);
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = busHeight / 2 + wheelRadius;
body.castShadow = true;
busMesh.add(body);
```

**Group Container:**
- `busMesh` is a THREE.Group
- All bus parts added to this group
- Allows moving entire bus as one unit

**Body Position:**
- Y = busHeight/2 + wheelRadius
- Bottom of body sits on top of wheels
- Height/2 because geometry is centered

### Front End (At +Z)

```javascript
const frontBumper = new THREE.Mesh(frontBumperGeometry, blackMaterial);
frontBumper.position.set(0, wheelRadius + 0.3, busLength / 2 + 0.1);

const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
hood.position.set(0, wheelRadius + 0.6, busLength / 2 - 0.5);

const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
windshield.position.set(0, busHeight + wheelRadius - 0.5, busLength / 2 - 1.2);

const destSign = new THREE.Mesh(signGeometry, signMaterial);
destSign.position.set(0, busHeight + wheelRadius + 0.3, busLength / 2 - 1.0);
```

**Front components positioned at +Z:**
- Bumper: At very front (busLength/2 + 0.1)
- Hood: Slightly back from bumper
- Windshield: Above hood
- Destination sign: Above windshield

### Headlights

```javascript
const headlightGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
const headlightMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFEE,
    emissive: 0x888866,
    roughness: 0.1 
});

const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
leftHeadlight.rotation.x = Math.PI / 2;
leftHeadlight.position.set(-0.9, wheelRadius + 1.2, busLength / 2 + 0.1);
```

**Headlight details:**
- Cylinder geometry (radius 0.25m)
- Yellow-white color
- Emissive glow (appears lit even in shadows)
- Rotation makes cylinder face forward

### Rear End (At -Z)

```javascript
const rearBumper = new THREE.Mesh(rearBumperGeometry, blackMaterial);
rearBumper.position.set(0, wheelRadius + 0.25, -busLength / 2 - 0.1);

const taillightMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFF0000,
    emissive: 0x440000,
    roughness: 0.2 
});
```

**Rear components positioned at -Z:**
- Bumper: At very back (-busLength/2 - 0.1)
- Taillights: Red with emissive glow

### Side Windows

```javascript
for (let i = -3; i <= 3; i++) {
    const leftWindow = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 1.0),
        windowMaterial
    );
    leftWindow.position.set(
        -busWidth / 2 - 0.05,
        busHeight / 2 + wheelRadius + 0.8,
        i * 1.2
    );
    busMesh.add(leftWindow);
    // Right window similar...
}
```

**Window pattern:**
- 7 windows per side (i = -3 to 3)
- Each window: 0.1 thick, 1.2 tall, 1.0 wide
- Spacing: 1.2 meters apart
- Total: 14 windows (7 left + 7 right)

### Side Mirrors

```javascript
const mirrorGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
const mirrorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    roughness: 0.5 
});

const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
leftMirror.position.set(-busWidth / 2 - 0.4, busHeight + wheelRadius - 0.3, busLength / 2 - 1.5);
```

**Mirror details:**
- Small rectangular mirrors
- Positioned near front of bus
- Driver-side and passenger-side

### Roof

```javascript
const roofGeometry = new THREE.BoxGeometry(busWidth - 0.1, 0.15, busLength - 0.5);
const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
roof.position.set(0, busHeight + wheelRadius + 0.1, 0);
```

**Roof features:**
- Slightly smaller than body (busWidth - 0.1)
- Thin raised section (0.15 thick)
- Matches body color

## Directional Orientation

**Critical design decision:**

The bus model faces +Z direction:
- Headlights at +Z (front)
- Taillights at -Z (rear)
- Windshield at +Z
- When bus moves +Z, it moves forward

This matches the physics forward direction (0, 0, 1).

## Mesh Hierarchy

```
busMesh (THREE.Group)
├── body (main yellow box)
├── frontBumper (black)
├── hood (yellow)
├── windshield (blue transparent)
├── destSign (white)
├── leftHeadlight, rightHeadlight (white/yellow)
├── rearBumper (black)
├── leftTaillight, rightTaillight (red)
├── leftWindow x7, rightWindow x7 (blue transparent)
├── leftMirror, rightMirror (black)
├── roof (yellow)
└── wheelMeshes x4 (black, added in createWheels)
```

## Visual Design Rationale

### Why School Bus Yellow?

1. **Instantly recognizable** as a bus
2. **High visibility** - stands out against gray city
3. **Cultural association** - players immediately understand it's a bus
4. **Contrast** - clear against any background

### Why Separate Materials?

1. **Different properties** - bumpers matte, body glossy
2. **Emissive lights** - headlights/taillights glow
3. **Transparent windows** - see-through effect
4. **Efficiency** - materials shared across parts

## Total Geometry Count

- Main body: 1
- Front parts: 4 (bumper, hood, windshield, sign)
- Headlights: 2
- Rear bumper: 1
- Taillights: 2
- Windows: 14
- Mirrors: 2
- Roof: 1
- Wheels: 4 (added later)

**Total meshes: 31** (excluding wheels)
