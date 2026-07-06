
const fs = require('fs');
const path = require('path');

// Mock window
global.window = {};

// Load strategies.js
const strategiesCode = fs.readFileSync(path.join(__dirname, 'aviator-ai-pro-lab/js/strategies.js'), 'utf8');
eval(strategiesCode);

const StrategyEngine = global.window.StrategyEngine;
const engine = new StrategyEngine();

// Generate deterministic mock crash points
const crashPoints = Array.from({ length: 1000 }, (_, i) => 1.1 + (i % 5) * 0.5);

// Capture original params
const originalParams = { ...engine.strategies['aiNeural'].params };
console.log('Original params:', originalParams);

const iterations = 10;
engine.optimize('aiNeural', crashPoints, 1000, iterations);

// Check current params
const currentParams = engine.strategies['aiNeural'].params;
console.log('Current params after optimize:', currentParams);

let match = true;
for (const key in originalParams) {
    if (originalParams[key] !== currentParams[key]) {
        console.error(`Mismatch for ${key}: expected ${originalParams[key]}, got ${currentParams[key]}`);
        match = false;
    }
}

if (match) {
    console.log('SUCCESS: Params correctly restored!');
} else {
    console.log('FAILURE: Params NOT correctly restored!');
    process.exit(1);
}
