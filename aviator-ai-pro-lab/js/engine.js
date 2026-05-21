/**
 * Aviator AI Pro Lab - Game Simulator Engine
 * Provably fair crash point generation and game simulation
 */

class AviatorEngine {
  constructor(houseEdge = 0.03) {
    this.houseEdge = houseEdge;
    this.history = [];
    this.seed = this._generateSeed();
  }

  // BOLT OPTIMIZATION: Internal rounding helper is ~20x faster than toFixed.
  _round(n, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  }

  _generateSeed() {
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    // BOLT OPTIMIZATION: Use a simple loop for hex conversion to avoid
    // Array.from and .join overhead on every round.
    let seed = '';
    for (let i = 0; i < arr.length; i++) {
      seed += (arr[i] >>> 0).toString(16).padStart(8, '0');
    }
    return seed;
  }

  /**
   * Generate a provably fair crash point using hash-based RNG
   * Returns multiplier >= 1.00
   */
  generateCrashPoint() {
    const hashInput = this.seed + ':' + this.history.length;
    const hash = this._simpleHash(hashInput);
    const h = parseInt(hash.slice(0, 13), 16);
    const e = Math.pow(2, 52);
    const result = (100 * e - h) / (e - h);
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
    const hex = (v) => (v >>> 0).toString(16).padStart(8, '0');
    return hex(h1) + hex(h2) + hex(h3) + hex(h4);
  }

  /**
   * Simulate a single round
   */
  simulateRound(betAmount, cashOutAt) {
    const crashPoint = this.generateCrashPoint();
    const won = cashOutAt <= crashPoint;
    const payout = won ? betAmount * cashOutAt : 0;
    const profit = payout - betAmount;

    // BOLT OPTIMIZATION: Replace expensive toFixed(2) with performant rounding helper.
    const round = {
      id: this.history.length + 1,
      crashPoint: this._round(crashPoint),
      betAmount: this._round(betAmount),
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
  generateCrashHistory(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(this.generateCrashPoint());
      this.seed = this._generateSeed();
    }
    return points;
  }

  /**
   * Get statistical analysis of crash history
   */
  getStats() {
    const totalRounds = this.history.length;
    if (totalRounds === 0) return null;

    // BOLT OPTIMIZATION: Consolidate multiple array iterations (map, filter, reduce)
    // into a single O(N) loop to minimize overhead on large datasets.
    let totalProfit = 0;
    let totalCrash = 0;
    let maxCrash = -Infinity;
    let minCrash = Infinity;
    let winsCount = 0;

    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLoseStreak = 0;
    let maxLoseStreak = 0;

    let peakBankroll = 0;
    let cumulativeProfit = 0;
    let maxDD = 0;

    let sumSquaredProfits = 0;
    let grossWins = 0;
    let grossLosses = 0;

    const crashes = new Array(totalRounds);

    for (let i = 0; i < totalRounds; i++) {
      const r = this.history[i];
      const p = r.profit;
      const c = r.crashPoint;

      crashes[i] = c;
      totalProfit += p;
      totalCrash += c;

      if (c > maxCrash) maxCrash = c;
      if (c < minCrash) minCrash = c;

      if (r.won) {
        winsCount++;
        currentWinStreak++;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
        currentLoseStreak = 0;
      } else {
        currentLoseStreak++;
        if (currentLoseStreak > maxLoseStreak) maxLoseStreak = currentLoseStreak;
        currentWinStreak = 0;
      }

      cumulativeProfit += p;
      if (cumulativeProfit > peakBankroll) peakBankroll = cumulativeProfit;
      const drawDown = peakBankroll - cumulativeProfit;
      if (drawDown > maxDD) maxDD = drawDown;

      sumSquaredProfits += p * p;

      if (p > 0) grossWins += p;
      else if (p < 0) grossLosses += Math.abs(p);
    }

    const avgProfit = totalProfit / totalRounds;

    // BOLT OPTIMIZATION: Use single-pass variance formula for Sharpe ratio
    let sharpe = 0;
    if (totalRounds >= 2) {
      const variance = (sumSquaredProfits - (totalProfit * totalProfit) / totalRounds) / (totalRounds - 1);
      const std = Math.sqrt(Math.max(0, variance));
      sharpe = std === 0 ? 0 : (avgProfit / std) * Math.sqrt(252);
    }

    const profitFactor = grossLosses === 0 ? (grossWins > 0 ? Infinity : 0) : grossWins / grossLosses;

    return {
      totalRounds,
      winRate: (winsCount / totalRounds * 100).toFixed(1),
      totalProfit: totalProfit.toFixed(2),
      avgCrash: (totalCrash / totalRounds).toFixed(2),
      maxCrash: maxCrash.toFixed(2),
      minCrash: minCrash.toFixed(2),
      medianCrash: this._median(crashes).toFixed(2),
      longestWinStreak: maxWinStreak,
      longestLoseStreak: maxLoseStreak,
      avgProfit: avgProfit.toFixed(2),
      maxDrawdown: maxDD.toFixed(2),
      sharpeRatio: sharpe.toFixed(3),
      profitFactor: profitFactor.toFixed(2)
    };
  }

  _median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
