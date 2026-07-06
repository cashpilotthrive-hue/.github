
const fs = require('fs');
const path = require('path');

// Mock window
global.window = {};

// Load strategies.js
const strategiesCode = fs.readFileSync(path.join(__dirname, 'aviator-ai-pro-lab/js/strategies.js'), 'utf8');
// Remove window.StrategyEngine = StrategyEngine; at the end to avoid eval issues if needed,
// but it should be fine.
eval(strategiesCode);

const StrategyEngine = global.window.StrategyEngine;
const engine = new StrategyEngine();

// Generate deterministic mock crash points for consistent benchmarking
const crashPoints = Array.from({ length: 1000 }, (_, i) => 1.1 + (i % 5) * 0.5);

const iterations = 100;
const start = Date.now();
const result = engine.optimize('aiNeural', crashPoints, 1000, iterations);
const end = Date.now();

console.log(`Optimization (aiNeural, 1000 rounds, ${iterations} iterations) took ${end - start}ms`);
if (result && result.bestResult) {
    console.log(`Best ROI: ${result.bestResult.roi}%`);
} else {
    console.log('No result found');
}
