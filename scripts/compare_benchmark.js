const fs = require('fs');
const path = require('path');
global.window = {};
const codePath = path.join(__dirname, '../aviator-ai-pro-lab/js/strategies.js');
const strategyCode = fs.readFileSync(codePath, 'utf8');
eval(strategyCode);
const StrategyEngine = global.window.StrategyEngine;
const engine = new StrategyEngine();
const crashPoints = Array.from({ length: 5000 }, (_, i) => 1 + (Math.sin(i) + 1) * 5);
function runBenchmark(label) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < 200; i++) {
    engine.backtest('martingale', crashPoints);
    engine.backtest('aiNeural', crashPoints);
  }
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000;
  console.log(`${label}: ${duration.toFixed(2)}ms`);
}
runBenchmark('Current');
