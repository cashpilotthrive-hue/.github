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

  _generateSeed() {
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    return Array.from(arr, v => v.toString(16).padStart(8, '0')).join('');
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

  _round(num, decimals = 2) {
    const p = Math.pow(10, decimals);
    return Math.round(num * p) / p;
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
    // BOLT OPTIMIZATION: Use a fast mathematical rounding helper instead of
    // expensive parseFloat(toFixed(2)) for multiple round fields.
    const crashPoint = this.generateCrashPoint();
    const won = cashOutAt <= crashPoint;
    const payout = won ? betAmount * cashOutAt : 0;
    const profit = payout - betAmount;

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
    // BOLT OPTIMIZATION: Consolidate multiple array iterations into a single O(N) loop
    // to calculate all core metrics in a single pass.
    if (this.history.length === 0) return null;

    const len = this.history.length;
    let winCount = 0;
    let totalProfit = 0;
    let crashSum = 0;
    let maxCrash = -Infinity;
    let minCrash = Infinity;
    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLoseStreak = 0;
    let maxLoseStreak = 0;
    let peakProfit = 0;
    let maxDD = 0;
    let cumulativeProfit = 0;
    let profitSumSq = 0;
    let grossWins = 0;
    let grossLosses = 0;

    const crashes = new Array(len);

    for (let i = 0; i < len; i++) {
      const r = this.history[i];
      const p = r.profit;
      const c = r.crashPoint;

      crashes[i] = c;
      crashSum += c;
      if (c > maxCrash) maxCrash = c;
      if (c < minCrash) minCrash = c;

      totalProfit += p;
      cumulativeProfit += p;
      if (cumulativeProfit > peakProfit) peakProfit = cumulativeProfit;
      const dd = peakProfit - cumulativeProfit;
      if (dd > maxDD) maxDD = dd;

      profitSumSq += p * p;
      if (p > 0) grossWins += p;
      else if (p < 0) grossLosses += Math.abs(p);

      if (r.won) {
        winCount++;
        currentWinStreak++;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
        currentLoseStreak = 0;
      } else {
        currentLoseStreak++;
        if (currentLoseStreak > maxLoseStreak) maxLoseStreak = currentLoseStreak;
        currentWinStreak = 0;
      }
    }

    const avgProfit = totalProfit / len;
    let sharpe = 0;
    if (len >= 2) {
      const variance = (profitSumSq - (totalProfit * totalProfit) / len) / (len - 1);
      const std = Math.sqrt(Math.max(0, variance));
      sharpe = std === 0 ? 0 : (avgProfit / std) * Math.sqrt(252);
    }

    return {
      totalRounds: len,
      winRate: (winCount / len * 100).toFixed(1),
      totalProfit: totalProfit.toFixed(2),
      avgCrash: (crashSum / len).toFixed(2),
      maxCrash: maxCrash.toFixed(2),
      minCrash: minCrash.toFixed(2),
      medianCrash: this._median(crashes).toFixed(2),
      longestWinStreak: maxWinStreak,
      longestLoseStreak: maxLoseStreak,
      avgProfit: avgProfit.toFixed(2),
      maxDrawdown: maxDD.toFixed(2),
      sharpeRatio: sharpe.toFixed(3),
      profitFactor: grossLosses === 0 ? (grossWins > 0 ? "Infinity" : "0.00") : (grossWins / grossLosses).toFixed(2)
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
