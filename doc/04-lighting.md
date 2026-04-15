# Lighting System

This document covers lines 153-168 of game.js, which creates the lighting for the 3D scene.

## Function: createLighting()

```javascript
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
```

## Ambient Light

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
```

**Purpose:** Provides base illumination for all objects uniformly.

- `0xffffff`: White light color (full spectrum)
- `0.6`: Intensity (60% of maximum)

**Characteristics:**
- No direction - illuminates from all angles equally
- No shadows
- Simulates scattered light from atmosphere

**Why 0.6 intensity?**
- Provides enough light to see details in shadows
- Leaves room for directional light to add contrast
- Prevents completely dark areas

**Without ambient light:** Areas not directly lit would be pitch black.

## Directional Light

```javascript
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
```

**Purpose:** Simulates sunlight - parallel rays from a distant source.

- `0xffffff`: White light (natural sunlight)
- `0.8`: Intensity (80% of maximum)
- Position: (50, 100, 50) = diagonal from above-right-front

**Directional vs Point Light:**

| Feature | Directional | Point |
|---------|-------------|-------|
| Rays | Parallel | Radial |
| Shadows | Sharp, parallel | Soft, radial spread |
| Source | Infinite distance | Finite distance |
| Use case | Sunlight | Light bulbs |

**Position Interpretation:**

The position defines the light direction, not actual location. Rays travel from position toward origin (0,0,0).

- X=50: Light comes from the right
- Y=100: Light comes from above (primary source)
- Z=50: Light comes from front-right

## Shadow Configuration

```javascript
directionalLight.castShadow = true;
```

**Purpose:** Enable shadow casting for this light.

**Requirements for shadows:**
1. Light must have `castShadow = true`
2. Objects must have `castShadow = true` (caster)
3. Objects must have `receiveShadow = true` (receiver)
4. Renderer must have `shadowMap.enabled = true`

## Shadow Map Resolution

```javascript
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
```

**Purpose:** Define resolution of shadow texture.

- `2048 x 2048`: 4 million pixels for shadow detail
- Higher = sharper shadows, more memory, slower
- Lower = blurrier shadows, less memory, faster

**Memory calculation:**
- 2048 × 2048 = 4,194,304 pixels
- Each pixel stores depth value (typically 16-bit float)
- ~8MB of VRAM for shadow map

**Why 2048?**
- Balance between quality and performance
- Sharp enough for vehicle-sized objects
- Modern GPUs handle this easily

## Shadow Camera Bounds

```javascript
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
```

**Purpose:** Define the area where shadows are rendered.

**How shadow cameras work:**
- Directional light uses an orthographic camera for shadows
- Only objects within these bounds cast shadows
- Outside bounds = no shadows rendered

**Bounds:**
- Left to right: -200 to 200 = 400 units wide
- Bottom to top: -200 to 200 = 400 units tall
- Covers entire playable area

**Trade-off:**
- Larger bounds = more area with shadows, but shadows become pixelated
- Smaller bounds = sharper shadows, but limited coverage
- 400×400 is appropriate for this city-sized scene

## Lighting Design Decisions

### Why Two Lights?

**Ambient + Directional = Daylight simulation**

1. **Ambient** provides base visibility
2. **Directional** adds contrast and shadows
3. Together they simulate realistic outdoor lighting

### Why No Point Lights?

For a city bus game:
- No interior lighting needed
- Streetlights would require many point lights (expensive)
- Daylight provides sufficient illumination

### Color Temperature

Both lights use white (0xffffff):
- Neutral color temperature
- Doesn't tint materials
- Allows material colors to show accurately

Alternative: Warm white (0xffffee) for sunset feel

## Shadow Rendering Pipeline

1. **Shadow Pass**: Render scene from light's perspective
2. **Depth values stored** in shadow map texture
3. **Main Pass**: Render scene from camera's perspective
4. **Shadow test**: For each pixel, compare depth to shadow map
5. **If occluded**: Darken pixel (shadow)

## Performance Impact

**Shadow calculations:**
- Render scene twice (shadow pass + main pass)
- Shadow map: ~8MB VRAM
- Per-pixel shadow test: GPU shader operation

**Optimization options (not used here):**
- Cascaded shadow maps for large scenes
- Lower resolution for distant shadows
- Baked shadows for static geometry

## Common Lighting Issues

**Shadows not appearing:**
- Check `renderer.shadowMap.enabled = true`
- Check objects have `castShadow` and `receiveShadow`
- Check shadow camera bounds include the objects

**Shadows too dark:**
- Increase ambient light intensity
- Add soft fill light

**Shadows pixelated:**
- Increase shadow map resolution
- Decrease shadow camera bounds
