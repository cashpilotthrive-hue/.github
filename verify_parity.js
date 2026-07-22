const fs = require('fs');

// Define global.window before loading the scripts to avoid ReferenceError
global.window = {};

// Load original StrategyEngine by modifying class name to prevent conflict
const originalCode = fs.readFileSync('aviator-ai-pro-lab/js/strategies.js.bak', 'utf8')
  .replace(/class StrategyEngine/g, 'class OriginalStrategyEngine')
  .replace(/window\.StrategyEngine = StrategyEngine;/g, 'window.OriginalStrategyEngine = OriginalStrategyEngine;');

eval(originalCode);
const OriginalStrategyEngine = window.OriginalStrategyEngine;

// Load optimized StrategyEngine
const optimizedCode = fs.readFileSync('aviator-ai-pro-lab/js/strategies.js', 'utf8');
eval(optimizedCode);
const OptimizedStrategyEngine = window.StrategyEngine;

console.log('Successfully loaded both Original and Optimized StrategyEngine classes.\n');

// Set up mock crash points for test
const numRounds = 1000;
const crashPoints = [];
for (let i = 0; i < numRounds; i++) {
  // realistic crash points
  crashPoints.push(1.0 + Math.random() * 5.0);
}

const originalEngine = new OriginalStrategyEngine();
const optimizedEngine = new OptimizedStrategyEngine();

const strategiesToTest = ['fixed', 'martingale', 'antiMartingale', 'fibonacci', 'dalembert', 'kelly', 'labouchere', 'aiNeural'];

console.log('--- VERIFYING FUNCTIONAL PARITY BETWEEN ORIGINAL AND OPTIMIZED ---');
let parityPassed = true;

for (const strategy of strategiesToTest) {
  console.log(`Testing strategy: ${strategy}`);

  // Test 1: Parity of full backtest (includeResults: true)
  const originalRes = originalEngine.backtest(strategy, crashPoints, 1000);
  const optimizedRes = optimizedEngine.backtest(strategy, crashPoints, 1000, { includeResults: true });

  const keysToCompare = ['finalBankroll', 'totalRounds', 'wins', 'losses', 'winRate', 'totalProfit', 'roi', 'maxDrawdown', 'peakBankroll'];

  for (const key of keysToCompare) {
    if (originalRes[key] !== optimizedRes[key]) {
      console.error(`  [FAIL] Mismatch for key "${key}" under strategy "${strategy}":`);
      console.error(`         Original: ${originalRes[key]}`);
      console.error(`         Optimized: ${optimizedRes[key]}`);
      parityPassed = false;
    }
  }

  // Test 2: Parity of optimized backtest (includeResults: false) vs. full backtest inside optimized engine
  const optimizedResNoResults = optimizedEngine.backtest(strategy, crashPoints, 1000, { includeResults: false });
  for (const key of keysToCompare) {
    if (optimizedResNoResults[key] !== optimizedRes[key]) {
      console.error(`  [FAIL] Mismatch under includeResults: false for key "${key}" under strategy "${strategy}":`);
      console.error(`         Full: ${optimizedRes[key]}`);
      console.error(`         Fast: ${optimizedResNoResults[key]}`);
      parityPassed = false;
    }
  }

  if (optimizedResNoResults.results !== null) {
    console.error(`  [FAIL] results should be null when includeResults is false`);
    parityPassed = false;
  }

  if (optimizedRes.results === null || optimizedRes.results.length === 0) {
    console.error(`  [FAIL] results should be populated when includeResults is true`);
    parityPassed = false;
  }
}

if (parityPassed) {
  console.log('\n✅ SUCCESS: Functional parity verified perfectly across all strategies!\n');
} else {
  console.error('\n❌ FAILURE: Functional differences detected between original and optimized code.\n');
  process.exit(1);
}

// Run performance benchmark for StrategyEngine.optimize
console.log('--- RUNNING PERFORMANCE BENCHMARK ---');
const iterations = 500;
const strategyToOptimize = 'aiNeural';

console.log(`Running StrategyEngine.optimize() for ${strategyToOptimize} with ${iterations} iterations of ${numRounds} rounds...`);

const startOriginal = Date.now();
const originalOptimizeRes = originalEngine.optimize(strategyToOptimize, crashPoints, 1000, iterations);
const endOriginal = Date.now();
const originalTime = endOriginal - startOriginal;

console.log(`Original Optimize Time: ${originalTime}ms`);

const startOptimized = Date.now();
const optimizedOptimizeRes = optimizedEngine.optimize(strategyToOptimize, crashPoints, 1000, iterations);
const endOptimized = Date.now();
const optimizedTime = endOptimized - startOptimized;

console.log(`Optimized Optimize Time: ${optimizedTime}ms`);

const speedup = ((originalTime - optimizedTime) / originalTime * 100).toFixed(1);
console.log(`\n⚡ Speedup: ${speedup}% faster!`);

// Double check best score parity or sanity
console.log(`Original best ROI: ${originalOptimizeRes.bestResult.roi}%`);
console.log(`Optimized best ROI: ${optimizedOptimizeRes.bestResult.roi}%`);
if (optimizedOptimizeRes.bestResult.results === null) {
  console.error('❌ FAILURE: Optimized bestResult.results is null! The final high-fidelity backtest failed to run.');
  process.exit(1);
} else {
  console.log('✅ SUCCESS: Optimized bestResult.results is fully populated.');
}

console.log('All tests passed successfully!');
