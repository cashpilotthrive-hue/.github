/**
 * Aviator AI Pro Lab - Game Simulator Engine
 * Provably fair crash point generation and game simulation
 */

// BOLT OPTIMIZATION: Hoist constants and helper functions to prevent per-call closures/reallocations
const E_2_52 = 2 ** 52;

function _hex8(v) {
  return (v >>> 0).toString(16).padStart(8, '0');
}

class AviatorEngine {
  constructor(houseEdge = 0.03) {
    this.houseEdge = houseEdge;
    this.history = [];
    this.seed = this._generateSeed();
  }

  // BOLT OPTIMIZATION: Reuse instance Uint32Array buffer to avoid typed array re-allocation per seed
  _generateSeed() {
    if (!this._seedBuffer) this._seedBuffer = new Uint32Array(4);
    crypto.getRandomValues(this._seedBuffer);
    return _hex8(this._seedBuffer[0]) + _hex8(this._seedBuffer[1]) + _hex8(this._seedBuffer[2]) + _hex8(this._seedBuffer[3]);
  }

  /**
   * Generate a provably fair crash point using hash-based RNG
   * Returns multiplier >= 1.00
   */
  generateCrashPoint() {
    const hashInput = this.seed + ':' + this.history.length;
    const hash = this._simpleHash(hashInput);
    const h = parseInt(hash.slice(0, 13), 16);
    const result = (100 * E_2_52 - h) / (E_2_52 - h);
    const crashPoint = Math.max(1.0, Math.floor(result) / 100);
    return crashPoint;
  }

  _simpleHash(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    let h3 = 0x9e3779b9;
    let h4 = 0x12345678;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
      h3 = Math.imul(h3 ^ ch, 2246822519);
      h4 = Math.imul(h4 ^ ch, 3266489917);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
    h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
    return _hex8(h1) + _hex8(h2) + _hex8(h3) + _hex8(h4);
  }

  /**
   * Simulate a single round
   */
  simulateRound(betAmount, cashOutAt) {
    const crashPoint = this.generateCrashPoint();
    const won = cashOutAt <= crashPoint;
    const payout = won ? betAmount * cashOutAt : 0;
    const profit = payout - betAmount;

    // BOLT OPTIMIZATION: Use a faster mathematical rounding helper instead of toFixed().
    const round = {
      id: this.history.length + 1,
      crashPoint: this._round(crashPoint),
      betAmount,
      cashOutAt: this._round(cashOutAt),
      won,
      payout: this._round(payout),
      profit: this._round(profit),
      timestamp: Date.now()
    };

    this.history.push(round);
    this.seed = this._generateSeed();
    return round;
  }

  /**
   * Generate batch of crash points for backtesting
   */
  // BOLT OPTIMIZATION: Pre-allocate array size for batch crash history generation
  generateCrashHistory(count) {
    const points = new Array(count);
    for (let i = 0; i < count; i++) {
      points[i] = this.generateCrashPoint();
      this.seed = this._generateSeed();
    }
    return points;
  }

  /**
   * Get statistical analysis of crash history
   */
  getStats() {
    const len = this.history.length;
    if (len === 0) return null;

    // BOLT OPTIMIZATION: Pre-allocate Float64Array for crashes to optimize median sorting and memory footprint
    let sumCrash = 0, maxCrash = -Infinity, minCrash = Infinity;
    let sumProfit = 0, winCount = 0;
    let maxWinStreak = 0, currentWinStreak = 0;
    let maxLoseStreak = 0, currentLoseStreak = 0;
    let peak = 0, maxDD = 0, cumulativeProfit = 0;
    let grossWins = 0, grossLosses = 0;
    const crashes = new Float64Array(len);

    for (let i = 0; i < len; i++) {
      const r = this.history[i];
      const crash = r.crashPoint;
      const profit = r.profit;
      const won = r.won;

      crashes[i] = crash;
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
      const diff = this.history[i].profit - avgProfit;
      varianceSum += diff * diff;
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
      medianCrash: this._median(crashes).toFixed(2),
      longestWinStreak: maxWinStreak,
      longestLoseStreak: maxLoseStreak,
      avgProfit: avgProfit.toFixed(2),
      maxDrawdown: maxDD.toFixed(2),
      sharpeRatio: sharpe.toFixed(3),
      profitFactor: profitFactor
    };
  }

  _round(num, decimals = 2) {
    const p = Math.pow(10, decimals);
    return Math.round(num * p) / p;
  }

  // BOLT OPTIMIZATION: Use Float64Array native sorting for fast median calculation
  _median(arr) {
    const sorted = arr instanceof Float64Array ? arr.slice().sort() : Float64Array.from(arr).sort();
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
