const fs = require('fs');
const path = require('path');

// Mock window
global.window = {};

// Load the strategy engine
const code = fs.readFileSync(path.join(__dirname, '../aviator-ai-pro-lab/js/strategies.js'), 'utf8');
eval(code);

const StrategyEngine = global.window.StrategyEngine;
const engine = new StrategyEngine();

// Generate dummy data
const numRounds = 10000;
const crashPoints = Array.from({ length: numRounds }, () => Math.random() * 5 + 1);

const iterations = 100;
console.log(`Running ${iterations} iterations of backtest with ${numRounds} rounds...`);

const start = Date.now();
for (let i = 0; i < iterations; i++) {
  engine.backtest('martingale', crashPoints);
}
const end = Date.now();

console.log(`Total time: ${end - start}ms`);
console.log(`Average time per backtest: ${(end - start) / iterations}ms`);
