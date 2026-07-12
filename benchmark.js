
global.window = global;
require('./aviator-ai-pro-lab/js/strategies.js');

const engine = new StrategyEngine();
const crashPoints = Array.from({ length: 1000 }, () => 1 + Math.random() * 10);

console.time('Optimization (80 iterations, 1000 rounds)');
engine.optimize('aiNeural', crashPoints, 1000, 80);
console.timeEnd('Optimization (80 iterations, 1000 rounds)');

console.time('Backtest (10000 rounds)');
engine.backtest('aiNeural', Array.from({ length: 10000 }, () => 1 + Math.random() * 10), 1000);
console.timeEnd('Backtest (10000 rounds)');
