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

// Load original
const OriginalStrategyEngine = loadEngine('aviator-ai-pro-lab/js/strategies.js.bak');
const originalEngine = new OriginalStrategyEngine();

// Load optimized
const OptimizedStrategyEngine = loadEngine('aviator-ai-pro-lab/js/strategies.js');
const optimizedEngine = new OptimizedStrategyEngine();

console.log('=== Performance Comparison (aiNeural Optimization - 80 runs) ===');
const startOrig = performance.now();
const origResult = originalEngine.optimize('aiNeural', crashPoints, 1000, 80);
const endOrig = performance.now();
const origTime = endOrig - startOrig;
console.log(`Unoptimized Optimization Run: ${origTime.toFixed(2)} ms`);

const startOpt = performance.now();
const optResult = optimizedEngine.optimize('aiNeural', crashPoints, 1000, 80);
const endOpt = performance.now();
const optTime = endOpt - startOpt;
console.log(`Optimized Optimization Run: ${optTime.toFixed(2)} ms`);

const speedup = (origTime / optTime).toFixed(2);
const reduction = (((origTime - optTime) / origTime) * 100).toFixed(1);
console.log(`Speedup: ${speedup}x (${reduction}% faster)`);

console.log('\n=== Direct Backtest Parity Check (aiNeural) ===');
const origBacktest = originalEngine.backtest('aiNeural', crashPoints, 1000);
const optBacktest = optimizedEngine.backtest('aiNeural', crashPoints, 1000);

const keysToCompare = ['finalBankroll', 'totalRounds', 'wins', 'losses', 'winRate', 'totalProfit', 'roi', 'maxDrawdown', 'peakBankroll'];

let match = true;
for (const key of keysToCompare) {
  const origVal = origBacktest[key];
  const optVal = optBacktest[key];
  if (origVal !== optVal) {
    console.error(`Mismatch for key "${key}": Unoptimized=${origVal} vs Optimized=${optVal}`);
    match = false;
  } else {
    console.log(`Match for "${key}": ${origVal}`);
  }
}

console.log('\n=== Direct Backtest Parity Check (martingale) ===');
const origMartingale = originalEngine.backtest('martingale', crashPoints, 1000);
const optMartingale = optimizedEngine.backtest('martingale', crashPoints, 1000);

for (const key of keysToCompare) {
  const origVal = origMartingale[key];
  const optVal = optMartingale[key];
  if (origVal !== optVal) {
    console.error(`Mismatch for key "${key}": Unoptimized=${origVal} vs Optimized=${optVal}`);
    match = false;
  } else {
    console.log(`Match for "${key}": ${origVal}`);
  }
}

if (match) {
  console.log('\nSUCCESS: 100% Functional Parity achieved on standard backtests!');
} else {
  console.error('\nFAILURE: Direct backtest mismatch detected!');
  process.exit(1);
}
