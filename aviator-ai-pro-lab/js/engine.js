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

    const round = {
      id: this.history.length + 1,
      crashPoint: parseFloat(crashPoint.toFixed(2)),
      betAmount,
      cashOutAt: parseFloat(cashOutAt.toFixed(2)),
      won,
      payout: parseFloat(payout.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
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
    const count = this.history.length;
    if (count === 0) return null;

    let totalProfit = 0;
    let totalCrash = 0;
    let maxCrash = -Infinity;
    let minCrash = Infinity;
    let winCount = 0;
    let winSum = 0;
    let lossSum = 0;

    let maxWinStreak = 0;
    let currentWinStreak = 0;
    let maxLoseStreak = 0;
    let currentLoseStreak = 0;

    let peak = 0;
    let maxDD = 0;
    let cumulativeProfit = 0;

    const crashes = new Array(count);
    const profits = new Array(count);

    // BOLT OPTIMIZATION: Consolidate metrics calculation into a single O(N) pass
    // to avoid redundant iterations and array allocations.
    for (let i = 0; i < count; i++) {
      const r = this.history[i];
      const p = r.profit;
      const c = r.crashPoint;

      profits[i] = p;
      crashes[i] = c;

      totalProfit += p;
      totalCrash += c;
      if (c > maxCrash) maxCrash = c;
      if (c < minCrash) minCrash = c;

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

      if (p > 0) winSum += p;
      else if (p < 0) lossSum += Math.abs(p);

      cumulativeProfit += p;
      if (cumulativeProfit > peak) peak = cumulativeProfit;
      const dd = peak - cumulativeProfit;
      if (dd > maxDD) maxDD = dd;
    }

    const profitFactor = lossSum === 0 ? (winSum > 0 ? Infinity : 0) : winSum / lossSum;

    return {
      totalRounds: count,
      winRate: this._round(winCount / count * 100, 1),
      totalProfit: this._round(totalProfit, 2),
      avgCrash: this._round(totalCrash / count, 2),
      maxCrash: this._round(maxCrash, 2),
      minCrash: this._round(minCrash, 2),
      medianCrash: this._round(this._median(crashes), 2),
      longestWinStreak: maxWinStreak,
      longestLoseStreak: maxLoseStreak,
      avgProfit: this._round(totalProfit / count, 2),
      maxDrawdown: this._round(maxDD, 2),
      sharpeRatio: this._round(this._sharpeRatio(profits, totalProfit / count), 3),
      profitFactor: this._round(profitFactor, 2)
    };
  }

  // BOLT OPTIMIZATION: Use a performant rounding helper based on Math.round
  _round(n, decimals = 2) {
    if (!isFinite(n)) return n.toString();
    const factor = Math.pow(10, decimals);
    return (Math.round(n * factor) / factor).toFixed(decimals);
  }

  _median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  _sharpeRatio(profits, mean) {
    const count = profits.length;
    if (count < 2) return 0;
    let varianceSum = 0;
    for (let i = 0; i < count; i++) {
      varianceSum += Math.pow(profits[i] - mean, 2);
    }
    const variance = varianceSum / (count - 1);
    const std = Math.sqrt(variance);
    return std === 0 ? 0 : (mean / std) * Math.sqrt(252);
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
