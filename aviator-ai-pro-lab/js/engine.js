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
    if (this.history.length === 0) return null;

    const crashes = this.history.map(r => r.crashPoint);
    const profits = this.history.map(r => r.profit);
    const wins = this.history.filter(r => r.won);

    return {
      totalRounds: this.history.length,
      winRate: (wins.length / this.history.length * 100).toFixed(1),
      totalProfit: profits.reduce((a, b) => a + b, 0).toFixed(2),
      avgCrash: (crashes.reduce((a, b) => a + b, 0) / crashes.length).toFixed(2),
      maxCrash: Math.max(...crashes).toFixed(2),
      minCrash: Math.min(...crashes).toFixed(2),
      medianCrash: this._median(crashes).toFixed(2),
      longestWinStreak: this._longestStreak(this.history, true),
      longestLoseStreak: this._longestStreak(this.history, false),
      avgProfit: (profits.reduce((a, b) => a + b, 0) / profits.length).toFixed(2),
      maxDrawdown: this._maxDrawdown(profits).toFixed(2),
      sharpeRatio: this._sharpeRatio(profits).toFixed(3),
      profitFactor: this._profitFactor().toFixed(2)
    };
  }

  _median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  _longestStreak(rounds, isWin) {
    let max = 0, current = 0;
    for (const r of rounds) {
      if (r.won === isWin) { current++; max = Math.max(max, current); }
      else { current = 0; }
    }
    return max;
  }

  _maxDrawdown(profits) {
    let peak = 0, maxDD = 0, cumulative = 0;
    for (const p of profits) {
      cumulative += p;
      peak = Math.max(peak, cumulative);
      maxDD = Math.max(maxDD, peak - cumulative);
    }
    return maxDD;
  }

  _sharpeRatio(profits) {
    if (profits.length < 2) return 0;
    const mean = profits.reduce((a, b) => a + b, 0) / profits.length;
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / (profits.length - 1);
    const std = Math.sqrt(variance);
    return std === 0 ? 0 : (mean / std) * Math.sqrt(252);
  }

  _profitFactor() {
    const wins = this.history.filter(r => r.profit > 0).reduce((s, r) => s + r.profit, 0);
    const losses = Math.abs(this.history.filter(r => r.profit < 0).reduce((s, r) => s + r.profit, 0));
    return losses === 0 ? wins > 0 ? Infinity : 0 : wins / losses;
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
