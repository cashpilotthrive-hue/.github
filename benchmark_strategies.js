const fs = require('fs');

function loadEngine(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { window: {} };
  const fn = new Function('window', code + '\nreturn window;');
  const resultWindow = fn(sandbox.window);
  return resultWindow.StrategyEngine;
}

// Generate deterministic crash points
function generateDeterministicCrashPoints(count) {
  const points = [];
  let seed = 12345;
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const crash = rand < 0.03 ? 1.0 : Math.max(1.0, Math.floor((100 / (1 - rand)) / 100 * 100) / 100);
    points.push(crash);
  }
  return points;
}

const crashPoints = generateDeterministicCrashPoints(1000);

// Load optimized strategy engine
const OptimizedStrategyEngine = loadEngine('aviator-ai-pro-lab/js/strategies.js');
const optimizedEngine = new OptimizedStrategyEngine();

console.log('=== Performance Benchmark (aiNeural Optimization - 80 runs) ===');
const startOpt = performance.now();
const optResult = optimizedEngine.optimize('aiNeural', crashPoints, 1000, 80);
const endOpt = performance.now();
const optTime = endOpt - startOpt;
console.log(`Optimized Optimization Run: ${optTime.toFixed(2)} ms`);

console.log('\n=== Direct Backtest (aiNeural - 1000 rounds) ===');
const optBacktest = optimizedEngine.backtest('aiNeural', crashPoints, 1000);
console.log(`Final Bankroll: ${optBacktest.finalBankroll}`);
console.log(`Total Rounds:   ${optBacktest.totalRounds}`);
console.log(`Wins:           ${optBacktest.wins}`);
console.log(`Losses:         ${optBacktest.losses}`);
console.log(`Win Rate:       ${optBacktest.winRate}%`);
console.log(`Total Profit:   $${optBacktest.totalProfit}`);
console.log(`ROI:            ${optBacktest.roi}%`);
console.log(`Max Drawdown:   $${optBacktest.maxDrawdown}`);
console.log(`Peak Bankroll:  $${optBacktest.peakBankroll}`);

console.log('\n=== Direct Backtest (martingale - 1000 rounds) ===');
const optMartingale = optimizedEngine.backtest('martingale', crashPoints, 1000);
console.log(`Final Bankroll: ${optMartingale.finalBankroll}`);
console.log(`Total Rounds:   ${optMartingale.totalRounds}`);
console.log(`Wins:           ${optMartingale.wins}`);
console.log(`Losses:         ${optMartingale.losses}`);
console.log(`Win Rate:       ${optMartingale.winRate}%`);
console.log(`Total Profit:   $${optMartingale.totalProfit}`);
console.log(`ROI:            ${optMartingale.roi}%`);
console.log(`Max Drawdown:   $${optMartingale.maxDrawdown}`);
console.log(`Peak Bankroll:  $${optMartingale.peakBankroll}`);
