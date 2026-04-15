// Chunk Manager for infinite map generation

// Seeded random number generator for deterministic chunk generation
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

// Single chunk containing ground, roads, and buildings
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
        
        // Generate ground
        this.createGround();
        
        // Generate roads if this chunk is on a road line
        if (this.x % 5 === 0) {
            this.createVerticalRoad();
        }
        if (this.z % 5 === 0) {
            this.createHorizontalRoad();
        }
        
        // Generate buildings (skip if on road)
        if (this.x % 5 !== 0 && this.z % 5 !== 0) {
            this.createBuildings(random);
        }
        
        this.loaded = true;
    }
    
    unload() {
        if (!this.loaded) return;
        
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        
        this.meshes = [];
        this.loaded = false;
    }
    
    createGround() {
        const geometry = new THREE.PlaneGeometry(ChunkManager.CHUNK_SIZE, ChunkManager.CHUNK_SIZE);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3a7d44,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(
            this.x * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2,
            0,
            this.z * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2
        );
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.meshes.push(ground);
    }
    
    createVerticalRoad() {
        const geometry = new THREE.PlaneGeometry(20, ChunkManager.CHUNK_SIZE);
        const material = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.9
        });
        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2;
        road.position.set(
            this.x * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2,
            0.01,
            this.z * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2
        );
        road.receiveShadow = true;
        this.scene.add(road);
        this.meshes.push(road);
        
        // Add road markings
        this.createRoadMarkings(true);
    }
    
    createHorizontalRoad() {
        const geometry = new THREE.PlaneGeometry(ChunkManager.CHUNK_SIZE, 20);
        const material = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.9
        });
        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2;
        road.position.set(
            this.x * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2,
            0.01,
            this.z * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2
        );
        road.receiveShadow = true;
        this.scene.add(road);
        this.meshes.push(road);
        
        // Add road markings
        this.createRoadMarkings(false);
    }
    
    createRoadMarkings(vertical) {
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const markingGeometry = vertical 
            ? new THREE.PlaneGeometry(1, 4)
            : new THREE.PlaneGeometry(4, 1);
        
        const chunkCenterX = this.x * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2;
        const chunkCenterZ = this.z * ChunkManager.CHUNK_SIZE + ChunkManager.CHUNK_SIZE / 2;
        
        // Add markings every 10 meters
        for (let i = -40; i <= 40; i += 10) {
            const marking = new THREE.Mesh(markingGeometry, material);
            marking.rotation.x = -Math.PI / 2;
            
            if (vertical) {
                marking.position.set(chunkCenterX, 0.02, chunkCenterZ + i);
            } else {
                marking.position.set(chunkCenterX + i, 0.02, chunkCenterZ);
            }
            
            this.scene.add(marking);
            this.meshes.push(marking);
        }
    }
    
    createBuildings(random) {
        const buildingColors = [0xcccccc, 0xaaaaaa, 0x999999, 0xb0b0b0, 0xd3d3d3];
        const numBuildings = random.int(2, 6);
        
        const chunkOriginX = this.x * ChunkManager.CHUNK_SIZE;
        const chunkOriginZ = this.z * ChunkManager.CHUNK_SIZE;
        
        for (let i = 0; i < numBuildings; i++) {
            const width = random.range(10, 25);
            const depth = random.range(10, 25);
            const height = random.range(10, 50);
            
            // Position within chunk, avoiding edges near roads
            const posX = chunkOriginX + random.range(15, ChunkManager.CHUNK_SIZE - 15);
            const posZ = chunkOriginZ + random.range(15, ChunkManager.CHUNK_SIZE - 15);
            
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const color = buildingColors[random.int(0, buildingColors.length - 1)];
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7
            });
            
            const building = new THREE.Mesh(geometry, material);
            building.position.set(posX, height / 2, posZ);
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);
            this.meshes.push(building);
        }
    }
}

// Main chunk manager
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
        
        // Only update if player moved to a different chunk
        if (currentChunk.x === this.lastPlayerChunk.x && 
            currentChunk.z === this.lastPlayerChunk.z) {
            return;
        }
        
        this.lastPlayerChunk = currentChunk;
        
        // Load chunks around player
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
        
        // Unload distant chunks
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

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChunkManager, Chunk, SeededRandom };
}
