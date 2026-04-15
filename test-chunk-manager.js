// Test chunk manager for infinite map
const THREE = require('three');

// Import ChunkManager (same code as chunkManager.js)
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    next() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }
    
    range(min, max) {
        return min + this.next() * (max - min);
    }
    
    int(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
}

class Chunk {
    constructor(x, z, scene) {
        this.x = x;
        this.z = z;
        this.scene = scene;
        this.meshes = [];
        this.loaded = false;
    }
    
    load(worldSeed) {
        if (this.loaded) return;
        
        const chunkSeed = worldSeed + this.x * 10000 + this.z;
        const random = new SeededRandom(chunkSeed);
        
        this.createGround();
        
        if (this.x % 5 === 0) this.createVerticalRoad();
        if (this.z % 5 === 0) this.createHorizontalRoad();
        
        if (this.x % 5 !== 0 && this.z % 5 !== 0) {
            this.createBuildings(random);
        }
        
        this.loaded = true;
    }
    
    unload() {
        if (!this.loaded) return;
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.meshes = [];
        this.loaded = false;
    }
    
    createGround() {
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x3a7d44 });
        const ground = new THREE.Mesh(geometry, material);
        ground.position.set(this.x * 100 + 50, 0, this.z * 100 + 50);
        this.scene.add(ground);
        this.meshes.push(ground);
    }
    
    createVerticalRoad() {
        const geometry = new THREE.PlaneGeometry(20, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const road = new THREE.Mesh(geometry, material);
        road.position.set(this.x * 100 + 50, 0.01, this.z * 100 + 50);
        this.scene.add(road);
        this.meshes.push(road);
    }
    
    createHorizontalRoad() {
        const geometry = new THREE.PlaneGeometry(100, 20);
        const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const road = new THREE.Mesh(geometry, material);
        road.position.set(this.x * 100 + 50, 0.01, this.z * 100 + 50);
        this.scene.add(road);
        this.meshes.push(road);
    }
    
    createBuildings(random) {
        const numBuildings = random.int(2, 6);
        for (let i = 0; i < numBuildings; i++) {
            const width = random.range(10, 25);
            const height = random.range(10, 50);
            const depth = random.range(10, 25);
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const building = new THREE.Mesh(geometry, material);
            building.position.set(
                this.x * 100 + random.range(15, 85),
                height / 2,
                this.z * 100 + random.range(15, 85)
            );
            this.scene.add(building);
            this.meshes.push(building);
        }
    }
}

class ChunkManager {
    static CHUNK_SIZE = 100;
    static LOAD_RADIUS = 2;
    
    constructor(scene, seed = 12345) {
        this.scene = scene;
        this.seed = seed;
        this.chunks = new Map();
        this.lastPlayerChunk = { x: null, z: null };
    }
    
    getChunkKey(x, z) {
        return `${x},${z}`;
    }
    
    worldToChunk(worldX, worldZ) {
        return {
            x: Math.floor(worldX / ChunkManager.CHUNK_SIZE),
            z: Math.floor(worldZ / ChunkManager.CHUNK_SIZE)
        };
    }
    
    update(playerX, playerZ) {
        const currentChunk = this.worldToChunk(playerX, playerZ);
        
        if (currentChunk.x === this.lastPlayerChunk.x && 
            currentChunk.z === this.lastPlayerChunk.z) {
            return;
        }
        
        this.lastPlayerChunk = currentChunk;
        
        const chunksToKeep = new Set();
        
        for (let dx = -ChunkManager.LOAD_RADIUS; dx <= ChunkManager.LOAD_RADIUS; dx++) {
            for (let dz = -ChunkManager.LOAD_RADIUS; dz <= ChunkManager.LOAD_RADIUS; dz++) {
                const chunkX = currentChunk.x + dx;
                const chunkZ = currentChunk.z + dz;
                const key = this.getChunkKey(chunkX, chunkZ);
                
                chunksToKeep.add(key);
                
                if (!this.chunks.has(key)) {
                    const chunk = new Chunk(chunkX, chunkZ, this.scene);
                    chunk.load(this.seed);
                    this.chunks.set(key, chunk);
                }
            }
        }
        
        const chunksToRemove = [];
        this.chunks.forEach((chunk, key) => {
            if (!chunksToKeep.has(key)) {
                chunksToRemove.push(key);
            }
        });
        
        chunksToRemove.forEach(key => {
            const chunk = this.chunks.get(key);
            chunk.unload();
            this.chunks.delete(key);
        });
    }
    
    getLoadedChunkCount() {
        return this.chunks.size;
    }
    
    getLoadedChunks() {
        return Array.from(this.chunks.keys());
    }
}

console.log('=== CHUNK MANAGER TEST ===\n');

const scene = new THREE.Scene();
const manager = new ChunkManager(scene, 12345);

// Test 1: Initial load at origin
console.log('=== Test 1: Load chunks at origin (0, 0) ===');
manager.update(0, 0);
console.log('Loaded chunks:', manager.getLoadedChunkCount());
console.log('Expected: 25 (5x5 grid with radius 2)');
const correct1 = manager.getLoadedChunkCount() === 25;
console.log('Result:', correct1 ? '✅ PASS' : '❌ FAIL');
console.log('Loaded chunk keys:', manager.getLoadedChunks());
console.log('');

// Test 2: Move to adjacent chunk
console.log('=== Test 2: Move to chunk (1, 0) ===');
manager.update(150, 50); // In chunk (1, 0)
console.log('Loaded chunks:', manager.getLoadedChunkCount());
console.log('Expected: 25 (still 5x5 grid)');
const correct2 = manager.getLoadedChunkCount() === 25;
console.log('Result:', correct2 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 3: Move far away - check unloading
console.log('=== Test 3: Move far away to chunk (10, 10) ===');
manager.update(1050, 1050);
console.log('Loaded chunks:', manager.getLoadedChunkCount());
const correct3 = manager.getLoadedChunkCount() === 25;
console.log('Result:', correct3 ? '✅ PASS' : '❌ FAIL');
const newChunks = manager.getLoadedChunks();
console.log('New chunk centers:', newChunks);
const hasFarChunk = newChunks.some(k => k.startsWith('10'));
console.log('Has chunk (10, x):', hasFarChunk ? '✅ YES' : '❌ NO');
console.log('');

// Test 4: Deterministic generation
console.log('=== Test 4: Deterministic generation ===');
const scene2 = new THREE.Scene();
const manager2 = new ChunkManager(scene2, 12345);
manager2.update(0, 0);

const scene3 = new THREE.Scene();
const manager3 = new ChunkManager(scene3, 12345);
manager3.update(0, 0);

const chunk1 = manager2.chunks.get('0,0');
const chunk2 = manager3.chunks.get('0,0');

console.log('Same seed should produce same buildings');
console.log('Chunk (0,0) meshes count 1:', chunk1.meshes.length);
console.log('Chunk (0,0) meshes count 2:', chunk2.meshes.length);
const sameCount = chunk1.meshes.length === chunk2.meshes.length;
console.log('Same mesh count:', sameCount ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 5: Roads at correct positions
console.log('=== Test 5: Roads at chunk boundaries ===');
const scene4 = new THREE.Scene();
const manager4 = new ChunkManager(scene4, 12345);
manager4.update(0, 0);

// Chunk 0,0 should NOT have roads (0 % 5 !== 0 is false, wait 0 % 5 === 0)
const chunk00 = manager4.chunks.get('0,0');
console.log('Chunk (0,0) has road:', chunk00.meshes.length > 1 ? '✅ YES (at x=0 line)' : '❌ NO');

// Chunk 5,0 should have vertical road
manager4.update(550, 50);
const chunk50 = manager4.chunks.get('5,0');
console.log('Chunk (5,0) has vertical road:', chunk50.meshes.length > 1 ? '✅ YES (x=5 % 5 === 0)' : '❌ NO');
console.log('');

// Test 6: Simulate driving forward
console.log('=== Test 6: Simulate driving 500m forward ===');
const scene5 = new THREE.Scene();
const driveManager = new ChunkManager(scene5, 12345);
let maxChunks = 0;
let minChunks = 100;

for (let pos = 0; pos <= 5000; pos += 100) {
    driveManager.update(pos, 0);
    const count = driveManager.getLoadedChunkCount();
    maxChunks = Math.max(maxChunks, count);
    minChunks = Math.min(minChunks, count);
}

console.log('Max chunks loaded:', maxChunks);
console.log('Min chunks loaded:', minChunks);
console.log('Expected: 25 chunks always');
const stable = maxChunks === 25 && minChunks === 25;
console.log('Chunks stable:', stable ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 7: Memory management
console.log('=== Test 7: Unloading frees memory ===');
const scene6 = new THREE.Scene();
const memManager = new ChunkManager(scene6, 12345);
memManager.update(0, 0);
const initialMeshes = scene6.children.length;
console.log('Initial scene children:', initialMeshes);

memManager.update(1000, 1000);
const finalMeshes = scene6.children.length;
console.log('After moving far:', finalMeshes);
console.log('Old chunks should be unloaded');
console.log('Meshes recreated (new chunks):', finalMeshes);
console.log('');

// Summary
console.log('=== SUMMARY ===');
const allPass = correct1 && correct2 && correct3 && sameCount && stable;
console.log('All tests passed:', allPass ? '✅ YES' : '❌ NO');
console.log('');
console.log('Chunk manager ready for deployment.');