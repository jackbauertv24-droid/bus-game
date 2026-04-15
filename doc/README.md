# Bus Game Documentation

This folder contains detailed documentation for `game.js`, the main game logic file.

## Documentation Structure

| File | Lines Covered | Description |
|------|---------------|-------------|
| [01-overview.md](01-overview.md) | 1-25 | Global variables and constants |
| [02-initialization.md](02-initialization.md) | 26-129 | The init() function and setup |
| [03-physics.md](03-physics.md) | 131-151 | Physics world initialization |
| [04-lighting.md](04-lighting.md) | 153-168 | Lighting system setup |
| [05-ground-and-roads.md](05-ground-and-roads.md) | 170-241 | Ground plane and road network |
| [06-city-generation.md](06-city-generation.md) | 243-289 | Procedural city generation |
| [07-bus-model.md](07-bus-model.md) | 291-454 | Bus visual model construction |
| [08-bus-physics.md](08-bus-physics.md) | 455-533 | Bus physics body and wheels |
| [09-input-and-update.md](09-input-and-update.md) | 535-630 | Input handling and vehicle physics |
| [10-animation.md](10-animation.md) | 632-719 | Reset, camera, sync, and animation loop |

## How to Use This Documentation

1. Read documents in order for a complete understanding
2. Each document focuses on a specific section of code
3. Code snippets are included with line numbers
4. Design decisions and rationale are explained

## Key Technical Concepts

### Three.js (3D Rendering)
- Scene, Camera, Renderer
- Mesh, Geometry, Material
- Lighting (Ambient, Directional)
- Shadow mapping

### Cannon.js (Physics)
- World, Body, Shape
- Constraints
- Collision filtering
- Materials and contact materials

### Game Architecture
- Single-file game engine
- Fixed timestep physics (60Hz)
- Decoupled physics and rendering
- Event-driven input system

## Major Bug Fixes Documented

1. **Quaternion rotation bug**: `mult()` vs `vmult()` for vector rotation
2. **Friction lock bug**: Collision filtering to prevent bus-ground collision
3. **Camera position bug**: Offset calculation for behind-bus view
4. **Bus direction bug**: Model orientation matching physics forward direction

## File Statistics

- Total lines of code: 719
- Total documentation: ~1000 lines per 10 lines of code
- Total documents: 10

## Dependencies

- **three.js r128**: 3D rendering library
- **cannon.js 0.6.2**: Physics engine
- Both loaded from CDN in index.html

## Testing

Unit tests are in the root directory:
- `test-full.js`: Full integration test
- `test-bus-construction.js`: Bus model tests
- `test-steering.js`: Steering physics tests
- `test-camera.js`: Camera control tests

## Further Reading

- [Three.js Documentation](https://threejs.org/docs/)
- [Cannon.js Documentation](https://schteppe.github.io/cannon.js/docs/)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
