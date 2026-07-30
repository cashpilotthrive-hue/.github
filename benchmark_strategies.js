const fs = require('fs');
const path = require('path');

// Mock window
global.window = {};

// Load strategies.js
const strategiesCode = fs.readFileSync(path.join(__dirname, 'aviator-ai-pro-lab/js/strategies.js'), 'utf8');
eval(strategiesCode);

const StrategyEngine = global.window.StrategyEngine;
const engine = new StrategyEngine();

// Generate dummy crash points
const crashPoints = Array.from({ length: 1000 }, (_, i) => 1.1 + (i % 5) * 0.5);

console.log('Benchmarking AI Neural strategy optimization (100 iterations, 1000 rounds)...');
const start = Date.now();
const result = engine.optimize('aiNeural', crashPoints, 1000, 100);
const end = Date.now();

console.log('Time taken:', end - start, 'ms');
console.log('Best ROI:', result.bestResult.roi, '%');
