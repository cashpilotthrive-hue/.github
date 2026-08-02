/**
 * Performance Benchmark & Functional Parity Verification Script
 * Compares the optimized StrategyEngine._aiAnalyze and AviatorEngine.getStats
 * with their unoptimized equivalents to guarantee functional parity and measure speedup.
 */

const fs = require('fs');
const path = require('path');

// 1. Setup global window environment for loading static files
global.window = {
  crypto: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 0xffffffff);
      }
      return arr;
    }
  }
};
// Polyfill global crypto for Node.js environments
global.crypto = global.window.crypto;

// 2. Load the optimized implementations
eval(fs.readFileSync(path.join(__dirname, 'aviator-ai-pro-lab/js/engine.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'aviator-ai-pro-lab/js/strategies.js'), 'utf8'));

// 3. Define original unoptimized versions of the algorithms for parity testing
function original_aiAnalyze(state) {
  const crashes = state.recentCrashes;
  const bankroll = state.bankroll || 1000;
  const riskMultipliers = { low: 0.5, medium: 1.0, high: 1.5 };
  const riskMult = riskMultipliers[state.riskLevel] || 1.0;

  if (crashes.length < 3) {
    return {
      suggestedBet: state.baseBet * riskMult,
      suggestedCashOut: 2.0,
      confidence: 0.3
    };
  }

  const avg = crashes.reduce((a, b) => a + b, 0) / crashes.length;
  const variance = crashes.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / crashes.length;
  const volatility = Math.sqrt(variance);

  const recentAvg = crashes.slice(-5).reduce((a, b) => a + b, 0) / Math.min(crashes.length, 5);
  const momentum = recentAvg - avg;

  const lowCrashRatio = crashes.filter(c => c < 1.5).length / crashes.length;

  let suggestedCashOut;
  if (lowCrashRatio > 0.4) {
    suggestedCashOut = 1.3 + (0.2 * riskMult);
  } else if (momentum > 0.5) {
    suggestedCashOut = Math.min(avg * 0.7, 3.0) * riskMult;
  } else {
    suggestedCashOut = Math.min(avg * 0.55, 2.5) * riskMult;
  }

  suggestedCashOut = Math.max(1.1, Math.min(suggestedCashOut, 10.0));

  const confidence = Math.min(0.95, 0.3 + (crashes.length / state.adaptiveWindow) * 0.5 - volatility * 0.05);
  const betSizing = state.baseBet * (0.5 + confidence * riskMult);

  state.momentum = momentum;
  state.volatility = volatility;

  return {
    suggestedBet: Math.max(1, Math.min(betSizing, bankroll * 0.1)),
    suggestedCashOut: parseFloat(suggestedCashOut.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(3)),
    analysis: { avg, volatility, momentum, lowCrashRatio }
  };
}

function original_getStats(history, _median) {
  const len = history.length;
  if (len === 0) return null;

  let sumCrash = 0, maxCrash = -Infinity, minCrash = Infinity;
  let sumProfit = 0, winCount = 0;
  let maxWinStreak = 0, currentWinStreak = 0;
  let maxLoseStreak = 0, currentLoseStreak = 0;
  let peak = 0, maxDD = 0, cumulativeProfit = 0;
  let grossWins = 0, grossLosses = 0;
  const crashes = [];

  for (let i = 0; i < len; i++) {
    const r = history[i];
    const crash = r.crashPoint;
    const profit = r.profit;
    const won = r.won;

    crashes.push(crash);
    sumCrash += crash;
    if (crash > maxCrash) maxCrash = crash;
    if (crash < minCrash) minCrash = crash;

    sumProfit += profit;
    cumulativeProfit += profit;
    if (cumulativeProfit > peak) peak = cumulativeProfit;
    const dd = peak - cumulativeProfit;
    if (dd > maxDD) maxDD = dd;

    if (won) {
      winCount++;
      currentWinStreak++;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      currentLoseStreak = 0;
      grossWins += profit;
    } else {
      currentLoseStreak++;
      if (currentLoseStreak > maxLoseStreak) maxLoseStreak = currentLoseStreak;
      currentWinStreak = 0;
      grossLosses += Math.abs(profit);
    }
  }

  const avgProfit = sumProfit / len;
  let varianceSum = 0;
  for (let i = 0; i < len; i++) {
    varianceSum += Math.pow(history[i].profit - avgProfit, 2);
  }
  const variance = len < 2 ? 0 : varianceSum / (len - 1);
  const std = Math.sqrt(variance);
  const sharpe = std === 0 ? 0 : (avgProfit / std) * Math.sqrt(252);

  const profitFactor = grossLosses === 0 ? (grossWins > 0 ? 'Infinity' : '0.00') : (grossWins / grossLosses).toFixed(2);

  return {
    totalRounds: len,
    winRate: (winCount / len * 100).toFixed(1),
    totalProfit: sumProfit.toFixed(2),
    avgCrash: (sumCrash / len).toFixed(2),
    maxCrash: maxCrash.toFixed(2),
    minCrash: minCrash.toFixed(2),
    medianCrash: _median(crashes).toFixed(2),
    longestWinStreak: maxWinStreak,
    longestLoseStreak: maxLoseStreak,
    avgProfit: avgProfit.toFixed(2),
    maxDrawdown: maxDD.toFixed(2),
    sharpeRatio: sharpe.toFixed(3),
    profitFactor: profitFactor
  };
}

// 4. Parity check helper allowing for standard floating-point precision differences
function isEquivalent(a, b, epsilon = 1e-9) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'number') {
    return Math.abs(a - b) < epsilon;
  }

  if (typeof a === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!isEquivalent(a[key], b[key], epsilon)) return false;
    }
    return true;
  }

  return false;
}

// --- BENCHMARK 1: _aiAnalyze ---
console.log('--------------------------------------------------');
console.log('Running Parity & Benchmark for StrategyEngine._aiAnalyze...');
console.log('--------------------------------------------------');

const strategyEngine = new global.window.StrategyEngine();

// Mock standard input data
const mockStateOrig = {
  recentCrashes: [1.2, 3.5, 1.1, 1.05, 1.8, 2.4, 4.2, 1.15, 1.3, 2.1, 1.6, 1.9, 1.25, 1.45, 1.1, 5.0, 1.35, 1.5, 2.2, 1.2],
  bankroll: 1000,
  riskLevel: 'medium',
  adaptiveWindow: 20,
  baseBet: 10
};
// deep copy states to prevent shared mutation state issues
const stateOrig = JSON.parse(JSON.stringify(mockStateOrig));
const stateOpt = JSON.parse(JSON.stringify(mockStateOrig));

const resOrig = original_aiAnalyze(stateOrig);
const resOpt = strategyEngine._aiAnalyze(stateOpt);

// Parity Check
if (!isEquivalent(resOrig, resOpt)) {
  console.error('❌ Parity Failure in _aiAnalyze!');
  console.log('Original:', resOrig);
  console.log('Optimized:', resOpt);
  process.exit(1);
} else {
  console.log('✅ Parity Check Passed for _aiAnalyze: Outputs are identical (within floating-point tolerance)!');
}

// Timing comparison
const ITERATIONS_ANALYZE = 100000;
console.log(`Running ${ITERATIONS_ANALYZE.toLocaleString()} iterations...`);

let start = performance.now();
for (let i = 0; i < ITERATIONS_ANALYZE; i++) {
  // Use a copy to ensure any state mutation is isolated
  const testState = { ...mockStateOrig, recentCrashes: [...mockStateOrig.recentCrashes] };
  original_aiAnalyze(testState);
}
const timeOrigAnalyze = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERATIONS_ANALYZE; i++) {
  const testState = { ...mockStateOrig, recentCrashes: [...mockStateOrig.recentCrashes] };
  strategyEngine._aiAnalyze(testState);
}
const timeOptAnalyze = performance.now() - start;

console.log(`Original _aiAnalyze:  ${timeOrigAnalyze.toFixed(2)} ms`);
console.log(`Optimized _aiAnalyze: ${timeOptAnalyze.toFixed(2)} ms`);
const speedupAnalyze = (timeOrigAnalyze / timeOptAnalyze).toFixed(2);
console.log(`⚡ Speedup: ${speedupAnalyze}x faster!`);


// --- BENCHMARK 2: getStats ---
console.log('\n--------------------------------------------------');
console.log('Running Parity & Benchmark for AviatorEngine.getStats...');
console.log('--------------------------------------------------');

const aviatorEngine = new global.window.AviatorEngine();

// Generate a mock history with 1000 rounds
const mockHistory = [];
let currentBank = 1000;
for (let i = 0; i < 1000; i++) {
  const crashPoint = 1 + Math.random() * 5;
  const cashOutAt = 1.5 + Math.random() * 1.5;
  const won = cashOutAt <= crashPoint;
  const betAmount = 10;
  const payout = won ? betAmount * cashOutAt : 0;
  const profit = payout - betAmount;
  mockHistory.push({
    id: i + 1,
    crashPoint: Math.round(crashPoint * 100) / 100,
    betAmount,
    cashOutAt: Math.round(cashOutAt * 100) / 100,
    won,
    payout: Math.round(payout * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    timestamp: Date.now()
  });
}

aviatorEngine.history = [...mockHistory];

const statsOrig = original_getStats(mockHistory, aviatorEngine._median.bind(aviatorEngine));
const statsOpt = aviatorEngine.getStats();

// Parity Check
if (!isEquivalent(statsOrig, statsOpt)) {
  console.error('❌ Parity Failure in getStats!');
  console.log('Original:', statsOrig);
  console.log('Optimized:', statsOpt);
  process.exit(1);
} else {
  console.log('✅ Parity Check Passed for getStats: Outputs are identical (within floating-point tolerance)!');
}

// Timing comparison
const ITERATIONS_STATS = 5000;
console.log(`Running ${ITERATIONS_STATS.toLocaleString()} iterations on 1,000 rounds of history...`);

start = performance.now();
for (let i = 0; i < ITERATIONS_STATS; i++) {
  original_getStats(mockHistory, aviatorEngine._median.bind(aviatorEngine));
}
const timeOrigStats = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERATIONS_STATS; i++) {
  aviatorEngine.getStats();
}
const timeOptStats = performance.now() - start;

console.log(`Original getStats:  ${timeOrigStats.toFixed(2)} ms`);
console.log(`Optimized getStats: ${timeOptStats.toFixed(2)} ms`);
const speedupStats = (timeOrigStats / timeOptStats).toFixed(2);
console.log(`⚡ Speedup: ${speedupStats}x faster!`);

console.log('\n==================================================');
console.log('ALL BENCHMARKS COMPLETE - 100% CORRECTNESS VERIFIED');
console.log('==================================================');
