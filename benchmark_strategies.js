const fs = require('fs');

// Stub window to allow importing browser files in Node
global.window = {};

// Import the files
require('./aviator-ai-pro-lab/js/engine.js');
require('./aviator-ai-pro-lab/js/strategies.js');

const AviatorEngine = window.AviatorEngine;
const StrategyEngine = window.StrategyEngine;

function runBenchmark() {
  const engine = new AviatorEngine();
  const strategyEngine = new StrategyEngine();

  console.log('--- Benchmarking Aviator AI Pro Lab Strategy Engine ---');

  // Measure generateCrashHistory (10,000 counts)
  console.time('generateCrashHistory (10,000)');
  const crashData = engine.generateCrashHistory(10000);
  console.timeEnd('generateCrashHistory (10,000)');

  // Measure backtest on 'aiNeural' (1,000 rounds)
  console.time('backtest aiNeural (1,000 rounds)');
  const result1 = strategyEngine.backtest('aiNeural', crashData.slice(0, 1000), 1000);
  console.timeEnd('backtest aiNeural (1,000 rounds)');

  // Measure optimize on 'aiNeural' (500 iterations, 1,000 rounds)
  console.time('optimize aiNeural (500 iterations of 1,000 rounds)');
  const optResult = strategyEngine.optimize('aiNeural', crashData.slice(0, 1000), 1000, 500);
  console.timeEnd('optimize aiNeural (500 iterations of 1,000 rounds)');

  console.log('\nResults summary:');
  console.log('Final bankroll:', result1.finalBankroll);
  console.log('Wins / Losses:', result1.wins, '/', result1.losses);
  console.log('Optimal ROI found:', optResult.bestResult ? optResult.bestResult.roi : 'None');
  console.log('-------------------------------------------------------');
}

runBenchmark();
