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
    const len = this.history.length;
    if (len === 0) return null;

    let winCount = 0;
    let totalProfit = 0;
    let sumCrashes = 0;
    let maxCrash = -Infinity;
    let minCrash = Infinity;
    let sumPositiveProfit = 0;
    let sumNegativeProfit = 0;
    let longestWinStreak = 0;
    let currentWinStreak = 0;
    let longestLoseStreak = 0;
    let currentLoseStreak = 0;
    let maxDD = 0;
    let peak = 0;
    let cumulativeProfit = 0;

    const crashes = new Array(len);
    const profits = new Array(len);

    for (let i = 0; i < len; i++) {
      const r = this.history[i];
      const crash = r.crashPoint;
      const profit = r.profit;
      const won = r.won;

      crashes[i] = crash;
      profits[i] = profit;

      sumCrashes += crash;
      if (crash > maxCrash) maxCrash = crash;
      if (crash < minCrash) minCrash = crash;

      totalProfit += profit;
      if (profit > 0) sumPositiveProfit += profit;
      else if (profit < 0) sumNegativeProfit += Math.abs(profit);

      if (won) {
        winCount++;
        currentWinStreak++;
        if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
        currentLoseStreak = 0;
      } else {
        currentLoseStreak++;
        if (currentLoseStreak > longestLoseStreak) longestLoseStreak = currentLoseStreak;
        currentWinStreak = 0;
      }

      cumulativeProfit += profit;
      if (cumulativeProfit > peak) peak = cumulativeProfit;
      const currentDD = peak - cumulativeProfit;
      if (currentDD > maxDD) maxDD = currentDD;
    }

    const profitFactor = sumNegativeProfit === 0
      ? (sumPositiveProfit > 0 ? Infinity : 0)
      : sumPositiveProfit / sumNegativeProfit;

    return {
      totalRounds: len,
      winRate: (winCount / len * 100).toFixed(1),
      totalProfit: this._round(totalProfit).toFixed(2),
      avgCrash: this._round(sumCrashes / len).toFixed(2),
      maxCrash: this._round(maxCrash).toFixed(2),
      minCrash: this._round(minCrash).toFixed(2),
      medianCrash: this._round(this._median(crashes)).toFixed(2),
      longestWinStreak,
      longestLoseStreak,
      avgProfit: this._round(totalProfit / len).toFixed(2),
      maxDrawdown: this._round(maxDD).toFixed(2),
      sharpeRatio: this._round(this._sharpeRatio(profits), 3).toFixed(3),
      profitFactor: (profitFactor === Infinity ? 'Infinity' : this._round(profitFactor).toFixed(2))
    };
  }

  _round(n, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  }

  _median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  _sharpeRatio(profits) {
    const len = profits.length;
    if (len < 2) return 0;
    let sum = 0;
    for (let i = 0; i < len; i++) sum += profits[i];
    const mean = sum / len;
    let varianceSum = 0;
    for (let i = 0; i < len; i++) varianceSum += Math.pow(profits[i] - mean, 2);
    const std = Math.sqrt(varianceSum / (len - 1));
    return std === 0 ? 0 : (mean / std) * Math.sqrt(252);
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
