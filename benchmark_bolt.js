global.window = {};
require('./aviator-ai-pro-lab/js/strategies.js');
const StrategyEngine = global.window.StrategyEngine;
const engine = new StrategyEngine();

// Use a fixed seed for reproducibility
let seed = 42;
function seededRandom() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
}
Math.random = seededRandom;

const crashPoints = Array.from({ length: 1000 }, (_, i) => 1.1 + (i % 5) * 0.5);

console.time('optimize aiNeural (100 iterations)');
engine.optimize('aiNeural', crashPoints, 1000, 100);
console.timeEnd('optimize aiNeural (100 iterations)');
