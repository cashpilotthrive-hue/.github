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
    // BOLT OPTIMIZATION: Avoid Array.from and join overhead by using a simple loop for hex conversion
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    let hex = '';
    for (let i = 0; i < arr.length; i++) {
      hex += arr[i].toString(16).padStart(8, '0');
    }
    return hex;
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

    // BOLT OPTIMIZATION: Use a performant mathematical rounding helper instead of parseFloat(toFixed(2))
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

  _round(n, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
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
    const history = this.history;
    const len = history.length;
    if (len === 0) return null;

    // BOLT OPTIMIZATION: Consolidate all metrics into a single O(N) pass to avoid multiple array iterations (map, filter, reduce)
    let totalProfit = 0;
    let totalCrash = 0;
    let maxCrash = -Infinity;
    let minCrash = Infinity;
    let winsCount = 0;

    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLoseStreak = 0;
    let maxLoseStreak = 0;

    let peak = 0;
    let cumulativeProfit = 0;
    let maxDD = 0;

    let grossWins = 0;
    let grossLosses = 0;

    let sumProfits = 0;
    let sumSquaredProfits = 0;

    const crashes = new Array(len);

    for (let i = 0; i < len; i++) {
      const r = history[i];
      const cp = r.crashPoint;
      const profit = r.profit;

      crashes[i] = cp;
      totalCrash += cp;
      if (cp > maxCrash) maxCrash = cp;
      if (cp < minCrash) minCrash = cp;

      totalProfit += profit;
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

      cumulativeProfit += profit;
      if (cumulativeProfit > peak) peak = cumulativeProfit;
      const dd = peak - cumulativeProfit;
      if (dd > maxDD) maxDD = dd;

      if (profit > 0) grossWins += profit;
      else if (profit < 0) grossLosses += Math.abs(profit);

      sumProfits += profit;
      sumSquaredProfits += profit * profit;
    }

    // Sharpe ratio using single-pass variance formula: Var(X) = E[X^2] - (E[X])^2
    const meanProfit = sumProfits / len;
    let sharpe = 0;
    if (len >= 2) {
      const variance = (sumSquaredProfits - (sumProfits * sumProfits) / len) / (len - 1);
      const std = Math.sqrt(Math.max(0, variance));
      sharpe = std === 0 ? 0 : (meanProfit / std) * Math.sqrt(252);
    }

    const profitFactor = grossLosses === 0 ? (grossWins > 0 ? Infinity : 0) : grossWins / grossLosses;

    return {
      totalRounds: len,
      winRate: (winsCount / len * 100).toFixed(1),
      totalProfit: totalProfit.toFixed(2),
      avgCrash: (totalCrash / len).toFixed(2),
      maxCrash: maxCrash.toFixed(2),
      minCrash: minCrash.toFixed(2),
      medianCrash: this._median(crashes).toFixed(2),
      longestWinStreak: maxWinStreak,
      longestLoseStreak: maxLoseStreak,
      avgProfit: (totalProfit / len).toFixed(2),
      maxDrawdown: maxDD.toFixed(2),
      sharpeRatio: sharpe.toFixed(3),
      profitFactor: profitFactor.toFixed(2)
    };
  }

  _median(arr) {
    // BOLT OPTIMIZATION: Use the provided array directly to avoid extra cloning where safe
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  }

  reset() {
    this.history = [];
    this.seed = this._generateSeed();
  }
}

window.AviatorEngine = AviatorEngine;
