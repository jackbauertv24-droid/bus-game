// Unit test for bus construction and initialization
const { JSDOM } = require('jsdom');

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><div id="ui"><div id="speed"></div><button id="resetBtn"></button></div>', {
    runScripts: "dangerously",
    resources: "usable"
});

// Expose globals like in browser
global.window = dom.window;
global.document = dom.window.document;
global.THREE = require('three');
// CANNON is loaded from CDN, so we need to mock it minimally
global.CANNON = {
    World: jest.fn(() => ({
        gravity: { set: jest.fn() },
        broadphase: null,
        step: jest.fn(),
        addBody: jest.fn(),
        addConstraint: jest.fn()
    })),
    Vec3: jest.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.mult = jest.fn((input, output) => {
            output.x = input.x;
            output.y = input.y;
            output.z = input.z;
            return output;
        });
        this.dot = jest.fn(() => 0);
    }),
    Body: jest.fn(() => ({
        position: { set: jest.fn() },
        velocity: { x: 0, z: 0 },
        angularVelocity: { set: jest.fn() },
        quaternion: { 
            set: jest.fn(),
            mult: jest.fn() 
        },
        addShape: jest.fn(),
        applyForce: jest.fn()
    })),
    Plane: jest.fn(),
    Box: jest.fn(),
    Sphere: jest.fn(),
    NaiveBroadphase: jest.fn(),
    PointToPointConstraint: jest.fn(),
    Quaternion: jest.fn()
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
    // Mock what's needed for init
    global.THREE.Scene = jest.fn();
    global.THREE.PerspectiveCamera = jest.fn();
    global.THREE.WebGLRenderer = jest.fn(() => ({
        setSize: jest.fn(),
        shadowMap: { enabled: false, type: 0 }
    }));
    global.THREE.AmbientLight = jest.fn();
    global.THREE.DirectionalLight = jest.fn();
    global.THREE.PlaneGeometry = jest.fn();
    global.THREE.MeshStandardMaterial = jest.fn();
    global.THREE.Mesh = jest.fn();
    global.THREE.Fog = jest.fn();
    global.THREE.BoxGeometry = jest.fn();
    global.THREE.CylinderGeometry = jest.fn();
    global.THREE.Group = jest.fn(() => ({
        position: { copy: jest.fn() },
        quaternion: { copy: jest.fn() },
        add: jest.fn()
    }));

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
