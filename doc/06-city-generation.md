# Procedural City Generation

This document covers lines 243-289 of game.js, which creates a procedural city with buildings.

## Function: createCity()

### Building Color Palette

```javascript
const buildingColors = [
    0xcccccc, 0xaaaaaa, 0x999999, 0xb0b0b0, 0xd3d3d3
];
```

**Purpose:** Realistic urban color variation.

All colors are shades of gray:
- Light gray to medium gray
- Mimics concrete, glass, steel buildings
- Neutral colors don't distract from yellow bus

### Grid Layout Parameters

```javascript
const blockSize = 40;
const roadWidth = 20;
const citySize = 10;
```

**Block System:**
- City divided into blocks (city blocks)
- Each block is 40×40 meters
- Roads between blocks are 20 meters wide
- Grid extends 10 blocks in each direction from center

**Total city size:**
- Blocks: 21 × 21 (from -10 to +10)
- Actual size: 21 × (40 + 20) = 1260 meters
- But roads at center reduce building area

### Grid Iteration

```javascript
for (let bx = -citySize; bx <= citySize; bx++) {
    for (let bz = -citySize; bz <= citySize; bz++) {
        if (Math.abs(bx) < 1 || Math.abs(bz) < 1) continue;
```

**Double loop:** Iterates through all grid positions

**Road check:** Skip blocks where roads exist
- `|bx| < 1`: Skip center horizontal row
- `|bz| < 1`: Skip center vertical row
- Creates the + shaped road crossing

### Block Position Calculation

```javascript
const blockX = bx * (blockSize + roadWidth);
const blockZ = bz * (blockSize + roadWidth);
```

**Spacing:**
- Each block offset by (blockSize + roadWidth)
- 40m block + 20m road = 60m spacing
- Ensures proper gaps between blocks

### Building Generation Per Block

```javascript
const buildingsPerBlock = Math.floor(Math.random() * 4) + 2;
```

**Randomization:**
- 2 to 5 buildings per block
- Creates organic, non-uniform appearance
- Each block is different

### Individual Building Creation

```javascript
for (let i = 0; i < buildingsPerBlock; i++) {
    const width = Math.random() * 15 + 10;
    const depth = Math.random() * 15 + 10;
    const height = Math.random() * 40 + 10;
```

**Building dimensions:**
- Width: 10-25 meters
- Depth: 10-25 meters  
- Height: 10-50 meters (2-15 stories)

### Building Positioning

```javascript
const posX = blockX + (Math.random() - 0.5) * (blockSize - width);
const posZ = blockZ + (Math.random() - 0.5) * (blockSize - depth);
```

**Random placement within block:**
- Center of block + random offset
- Offset bounded by block size minus building size
- Prevents buildings from extending beyond block

### Mesh Creation

```javascript
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
```

**Mesh setup:**
- Box geometry with random dimensions
- Random color from palette
- Standard material with moderate roughness

**Position Y = height/2:**
- Buildings stand on ground (y=0)
- Geometry centered at origin, so offset by half height

**Shadow properties:**
- `castShadow = true`: Building casts shadows
- `receiveShadow = true`: Building receives shadows from other buildings

**Storage:** Building added to `cityBuildings` array for potential future use

## Statistics

**Total potential blocks:**
- Grid: 21 × 21 = 441 blocks
- Roads remove: 21 + 21 - 1 = 41 blocks (center row + center column - overlap)
- Building blocks: 400 blocks

**Buildings generated:**
- Min: 2 × 400 = 800 buildings
- Max: 5 × 400 = 2000 buildings
- Average: ~1200 buildings

## Visual Design Choices

### Why Gray Buildings?

1. **Realism**: Urban skylines are predominantly gray
2. **Contrast**: Yellow bus stands out against gray
3. **Performance**: Fewer material variations = better batching

### Why Random Heights?

1. **Visual interest**: Varied skyline is more engaging
2. **Realism**: Cities have buildings of different heights
3. **Navigation**: Height variation aids orientation

### Why BoxGeometry?

1. **Performance**: Simple geometry renders fast
2. **Style**: Matches low-poly aesthetic
3. **Simplicity**: No need for complex building models

## Performance Considerations

**Draw calls:**
- Each building is a separate mesh
- ~1200 draw calls
- Acceptable for this game scale

**Optimization options (not used):**
- Merge static geometry into single mesh
- Use instanced rendering
- LOD (Level of Detail) system

**Memory usage:**
- Each building: ~100 bytes for geometry + material reference
- Total: ~120KB for building data
- Negligible memory impact

## Potential Enhancements

**Not implemented but possible:**
1. Building windows (add texture)
2. Different building types (office, residential)
3. Physics collision for buildings
4. Destructible buildings
5. Building interiors (if bus could enter)

## City Layout Visualization

```
    [-10,-10]                    [+10,-10]
         ┌────┬────┬────┬────┐
         │ B  │ B  │ B  │ B  │
         ├────┼────┼────┼────┤
         │ B  │ B  │ B  │ B  │
         ├────┼────┼────┼────┤
         │ B  │══════════│ B │  ← Road (horizontal)
         ├────┼────┼────┼────┤
         │ B  │ ║  │ ║  │ B │  ← Road (vertical)
         ├────┼────┼────┼────┤
         │ B  │ B  │ B  │ B  │
         └────┴────┴────┴────┘
    [-10,+10]                    [+10,+10]
    
    B = Building block
    ═ = Horizontal road
    ║ = Vertical road
```
