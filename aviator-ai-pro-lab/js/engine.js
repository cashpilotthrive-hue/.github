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
    const totalRounds = this.history.length;
    if (totalRounds === 0) return null;

    // BOLT OPTIMIZATION: Consolidate multiple metrics into a single O(N) loop
    // to avoid redundant iterations and array allocations.
    let totalWins = 0;
    let totalProfit = 0;
    let sumCrash = 0;
    let maxCrash = -Infinity;
    let minCrash = Infinity;
    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLoseStreak = 0;
    let maxLoseStreak = 0;
    let peakProfit = 0;
    let maxDrawdown = 0;
    let grossWins = 0;
    let grossLosses = 0;

    const crashes = new Array(totalRounds);
    const profits = new Array(totalRounds);

    for (let i = 0; i < totalRounds; i++) {
      const round = this.history[i];
      const crash = round.crashPoint;
      const profit = round.profit;

      crashes[i] = crash;
      profits[i] = profit;

      if (round.won) {
        totalWins++;
        currentWinStreak++;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        currentLoseStreak = 0;
      } else {
        currentLoseStreak++;
        maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
        currentWinStreak = 0;
      }

      totalProfit += profit;
      sumCrash += crash;
      if (crash > maxCrash) maxCrash = crash;
      if (crash < minCrash) minCrash = crash;

      if (totalProfit > peakProfit) peakProfit = totalProfit;
      const currentDD = peakProfit - totalProfit;
      if (currentDD > maxDrawdown) maxDrawdown = currentDD;

      if (profit > 0) grossWins += profit;
      else if (profit < 0) grossLosses += Math.abs(profit);
    }

    const avgProfit = totalProfit / totalRounds;

    return {
      totalRounds,
      winRate: (totalWins / totalRounds * 100).toFixed(1),
      totalProfit: this._round(totalProfit).toFixed(2),
      avgCrash: this._round(sumCrash / totalRounds).toFixed(2),
      maxCrash: this._round(maxCrash).toFixed(2),
      minCrash: this._round(minCrash).toFixed(2),
      medianCrash: this._round(this._median(crashes)).toFixed(2),
      longestWinStreak: maxWinStreak,
      longestLoseStreak: maxLoseStreak,
      avgProfit: this._round(avgProfit).toFixed(2),
      maxDrawdown: this._round(maxDrawdown).toFixed(2),
      sharpeRatio: this._sharpeRatio(profits, avgProfit).toFixed(3),
      profitFactor: grossLosses === 0 ? (grossWins > 0 ? "Infinity" : "0.00") : this._round(grossWins / grossLosses).toFixed(2)
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

  _sharpeRatio(profits, mean) {
    if (profits.length < 2) return 0;
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / (profits.length - 1);
    const std = Math.sqrt(variance);
    return std === 0 ? 0 : (mean / std) * Math.sqrt(252);
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
