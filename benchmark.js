
const fs = require('fs');
const path = require('path');

// Mock window
global.window = {};

// Load the strategy engine
const strategyCode = fs.readFileSync(path.join(__dirname, 'aviator-ai-pro-lab/js/strategies.js'), 'utf8');
eval(strategyCode);
const StrategyEngine = global.window.StrategyEngine;

const engine = new StrategyEngine();
const iterations = 100;
const rounds = 1000;
const strategyKey = 'aiNeural';

// Generate deterministic crash points for reliable benchmarking
const crashPoints = Array.from({ length: rounds }, (_, i) => 1.1 + (i % 5) * 0.5);

function runBenchmark(label) {
    console.log(`Benchmarking ${label}...`);
    const start = Date.now();
    const result = engine.optimize(strategyKey, crashPoints, 1000, iterations);
    const end = Date.now();
    console.log(`${label} took ${end - start}ms`);
    return end - start;
}

// Warm up
runBenchmark('Warm up');
runBenchmark('Warm up');

const time = runBenchmark('Baseline');
console.log(`Final Baseline Time: ${time}ms`);
