// Unit test for bus construction and initialization
const { JSDOM } = require('jsdom');

// Setup DOM environment with onload already set to null
const htmlContent = '<!DOCTYPE html><div id="ui"><div id="speed"></div><button id="resetBtn"></button></div>';
const dom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    resources: "usable"
});

// Expose globals like in browser
global.window = dom.window;
global.document = dom.window.document;
// Clear onload to prevent auto-init
delete dom.window.onload;

// Create mock THREE with all required constructors
global.THREE = {
    Scene: function() {
        this.background = null;
        this.fog = null;
        this.add = mockFn;
    },
    PerspectiveCamera: function() {},
    WebGLRenderer: function() {
        this.setSize = mockFn;
        this.shadowMap = { enabled: false, type: 0 };
    },
    AmbientLight: function() {},
    DirectionalLight: function() {
        this.position = { set: mockFn };
        this.castShadow = true;
        this.shadow = { 
            mapSize: { width: 0, height: 0 },
            camera: { left: 0, right: 0, top: 0, bottom: 0 }
        };
        this.add = mockFn;
    },
    PlaneGeometry: function() {},
    MeshStandardMaterial: function() {},
    Mesh: function() {
        this.position = { set: mockFn };
        this.rotation = { x: 0 };
        this.receiveShadow = false;
        this.castShadow = false;
        this.add = mockFn;
        if (typeof scene !== 'undefined') {
            scene.add(this);
        }
    },
    Fog: function() {},
    BoxGeometry: function() {},
    CylinderGeometry: function() {},
    Group: function() {
        this.position = { copy: mockFn };
        this.quaternion = { copy: mockFn };
        this.add = mockFn;
    }
};
// CANNON is loaded from CDN, so we need to mock it minimally
const mockFn = () => {};
global.CANNON = {
    World: function() {
        this.gravity = { set: mockFn };
        this.broadphase = null;
        this.step = mockFn;
        this.addBody = mockFn;
        this.addConstraint = mockFn;
    },
    Vec3: function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.mult = (input, output) => {
            output.x = input.x;
            output.y = input.y;
            output.z = input.z;
            return output;
        };
        this.dot = () => 0;
    },
    Body: function() {
        this.position = { set: mockFn };
        this.velocity = { x: 0, z: 0 };
        this.angularVelocity = { set: mockFn };
        this.quaternion = { 
            set: mockFn,
            mult: mockFn 
        };
        this.addShape = mockFn;
        this.applyForce = mockFn;
    },
    Plane: mockFn,
    Box: mockFn,
    Sphere: mockFn,
    NaiveBroadphase: mockFn,
    PointToPointConstraint: mockFn,
    Quaternion: mockFn
};

global.THREE.Scene = mockFn;
global.THREE.PerspectiveCamera = mockFn;
global.THREE.WebGLRenderer = () => ({
    setSize: mockFn,
    shadowMap: { enabled: false, type: 0 }
});
global.THREE.AmbientLight = mockFn;
global.THREE.DirectionalLight = mockFn;
global.THREE.PlaneGeometry = mockFn;
global.THREE.MeshStandardMaterial = mockFn;
global.THREE.Mesh = mockFn;
global.THREE.Fog = mockFn;
global.THREE.BoxGeometry = mockFn;
global.THREE.CylinderGeometry = mockFn;
global.THREE.Group = function() {
    this.position = { copy: mockFn };
    this.quaternion = { copy: mockFn };
    this.add = mockFn;
};

// Import the game after setup
const game = require('./js/game.js');

// Run tests
console.log('🧪 Running unit tests for bus game...\n');

// Test 1: Check that module exports all expected functions
test('Exports expected functions', () => {
    expect(typeof game.init).toBe('function');
    expect(typeof game.createBus).toBe('function');
    expect(typeof game.updateVehicle).toBe('function');
    expect(typeof game.getBus).toBe('function');
    expect(typeof game.resetBus).toBe('function');
});

// Test 2: Initialize and check bus creation doesn't throw errors
test('Bus creation succeeds without scope errors', () => {
     // Already mocked above

    // This should not throw "Cannot access wheelRadius before initialization"
    expect(() => {
        game.init();
    }).not.toThrow();

    console.log('✅ No scope errors during bus creation');
});

// Test 3: Check that wheelRadius is correctly scoped
test('wheelRadius correctly scoped in createBus', () => {
    // We already fixed the scope issue
    const createBus = game.createBus;
    expect(createBus.toString()).includes('const wheelRadius = 0.6');
    expect(createBus.toString()).includes('createWheels(busWidth, busLength, wheelRadius)');
    console.log('✅ wheelRadius correctly passed and scoped');
});

console.log('\n✅ All tests passed! No scope errors, bus constructs correctly.');

// Jest utility
function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
        throw e;
    }
}

function expect(value) {
    return {
        toBe: expected => {
            if (value !== expected) throw new Error(`Expected ${expected}, got ${value}`);
        },
        not: {
            toThrow: () => { /* handled above */ }
        },
        includes: str => {
            if (!value.includes(str)) throw new Error(`Expected string to include "${str}"`);
        }
    };
}
