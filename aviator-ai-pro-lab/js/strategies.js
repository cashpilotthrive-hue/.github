/**
 * Aviator AI Pro Lab - Strategy Definitions & Optimizer
 * Multiple betting strategies with AI-powered optimization
 */

class StrategyEngine {
  constructor() {
    this.strategies = {
      fixed: {
        name: 'Fixed Target',
        description: 'Bet fixed amount, cash out at fixed multiplier',
        icon: '🎯',
        color: '#3498db',
        params: { baseBet: 10, cashOut: 2.0 }
      },
      martingale: {
        name: 'Martingale',
        description: 'Double bet after loss, reset after win',
        icon: '📈',
        color: '#e74c3c',
        params: { baseBet: 10, cashOut: 2.0, multiplier: 2.0, maxBet: 1000 }
      },
      antiMartingale: {
        name: 'Anti-Martingale',
        description: 'Double bet after win, reset after loss',
        icon: '📉',
        color: '#2ecc71',
        params: { baseBet: 10, cashOut: 2.0, multiplier: 2.0, maxWins: 3 }
      },
      fibonacci: {
        name: 'Fibonacci',
        description: 'Follow Fibonacci sequence on losses',
        icon: '🔢',
        color: '#9b59b6',
        params: { baseBet: 10, cashOut: 2.0 }
      },
      dalembert: {
        name: "D'Alembert",
        description: 'Increase by 1 unit on loss, decrease on win',
        icon: '⚖️',
        color: '#f39c12',
        params: { baseBet: 10, cashOut: 2.0, unitSize: 5 }
      },
      kelly: {
        name: 'Kelly Criterion',
        description: 'Optimal bet sizing based on edge',
        icon: '🧮',
        color: '#1abc9c',
        params: { baseBet: 10, cashOut: 2.0, bankroll: 1000, fraction: 0.25 }
      },
      labouchere: {
        name: 'Labouchere',
        description: 'Cancel numbers from a sequence on wins',
        icon: '📋',
        color: '#e67e22',
        params: { baseBet: 10, cashOut: 2.0, sequence: [1, 2, 3, 4, 5] }
      },
      aiNeural: {
        name: 'AI Neural',
        description: 'AI-optimized adaptive strategy using pattern analysis',
        icon: '🤖',
        color: '#8e44ad',
        params: { baseBet: 10, bankroll: 1000, riskLevel: 'medium', adaptiveWindow: 20 }
      }
    };
  }

  /**
   * Execute a strategy for a given number of rounds against crash data
   */
  backtest(strategyKey, crashPoints, bankroll = 1000, options = {}) {
    const { includeResults = true } = options;
    const strategy = this.strategies[strategyKey];
    if (!strategy) throw new Error(`Unknown strategy: ${strategyKey}`);

    const results = includeResults ? [] : null;
    let currentBankroll = bankroll;
    let state = this._initState(strategyKey, strategy.params);

    // BOLT OPTIMIZATION: Calculate metrics in a single pass to avoid redundant array iterations
    let wins = 0;
    let losses = 0;
    let peakBankroll = bankroll;
    let maxDrawdown = 0;
    let totalRounds = 0;

    for (let i = 0; i < crashPoints.length; i++) {
      if (currentBankroll <= 0) break;

      const { betAmount, cashOutTarget } = this._getNextBet(strategyKey, state, currentBankroll);
      const actualBet = Math.min(betAmount, currentBankroll);

      if (actualBet <= 0) break;

      const crashPoint = crashPoints[i];
      const won = cashOutTarget <= crashPoint;
      const payout = won ? actualBet * cashOutTarget : 0;
      const profit = payout - actualBet;
      currentBankroll += profit;

      if (won) {
        wins++;
      } else {
        losses++;
      }

      if (currentBankroll > peakBankroll) {
        peakBankroll = currentBankroll;
      }
      const currentDrawdown = peakBankroll - currentBankroll;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }

      totalRounds++;

      // BOLT OPTIMIZATION: Skip results array creation and rounding when not needed (e.g. during optimization)
      if (includeResults) {
        results.push({
          round: i + 1,
          crashPoint: this._round(crashPoint, 2),
          betAmount: this._round(actualBet, 2),
          cashOutTarget: this._round(cashOutTarget, 2),
          won,
          profit: this._round(profit, 2),
          bankroll: this._round(currentBankroll, 2)
        });
      }

      this._updateState(strategyKey, state, won, crashPoint);
    }

    const totalProfit = currentBankroll - bankroll;

    return {
      strategy: strategy.name,
      results,
      finalBankroll: this._round(currentBankroll, 2),
      totalRounds,
      wins,
      losses,
      winRate: totalRounds > 0 ? this._round(wins / totalRounds * 100, 1).toFixed(1) : '0.0',
      totalProfit: this._round(totalProfit, 2),
      roi: this._round((totalProfit / bankroll * 100), 2),
      maxDrawdown: this._round(maxDrawdown, 2),
      peakBankroll: this._round(peakBankroll, 2).toFixed(2)
    };
  }

  _initState(key, params) {
    const state = { ...params, consecutiveLosses: 0, consecutiveWins: 0, currentBet: params.baseBet };

    switch (key) {
      case 'fibonacci':
        state.fibIndex = 0;
        state.fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
        break;
      case 'labouchere':
        state.sequence = [...(params.sequence || [1, 2, 3, 4, 5])];
        break;
      case 'aiNeural':
        state.recentCrashes = [];
        state.adaptiveCashOut = 2.0;
        state.momentum = 0;
        state.volatility = 1;
        break;
    }
    return state;
  }

  _getNextBet(key, state, bankroll) {
    let betAmount = state.baseBet;
    let cashOutTarget = state.cashOut || 2.0;

    switch (key) {
      case 'fixed':
        betAmount = state.baseBet;
        cashOutTarget = state.cashOut;
        break;

      case 'martingale':
        betAmount = state.currentBet;
        cashOutTarget = state.cashOut;
        break;

      case 'antiMartingale':
        betAmount = state.currentBet;
        cashOutTarget = state.cashOut;
        break;

      case 'fibonacci':
        betAmount = state.baseBet * state.fibSequence[Math.min(state.fibIndex, state.fibSequence.length - 1)];
        cashOutTarget = state.cashOut;
        break;

      case 'dalembert':
        betAmount = state.currentBet;
        cashOutTarget = state.cashOut;
        break;

      case 'kelly': {
        const winProb = this._estimateWinProb(cashOutTarget);
        const edge = winProb * cashOutTarget - 1;
        const kellyFraction = Math.max(0, edge / (cashOutTarget - 1)) * state.fraction;
        betAmount = Math.max(state.baseBet, bankroll * kellyFraction);
        cashOutTarget = state.cashOut;
        break;
      }

      case 'labouchere':
        if (state.sequence.length === 0) state.sequence = [1, 2, 3, 4, 5];
        if (state.sequence.length === 1) {
          betAmount = state.baseBet * state.sequence[0];
        } else {
          betAmount = state.baseBet * (state.sequence[0] + state.sequence[state.sequence.length - 1]);
        }
        cashOutTarget = state.cashOut;
        break;

      case 'aiNeural': {
        const analysis = this._aiAnalyze(state);
        betAmount = analysis.suggestedBet;
        cashOutTarget = analysis.suggestedCashOut;
        break;
      }
    }

    return {
      betAmount: Math.min(Math.max(betAmount, 1), state.maxBet || bankroll),
      cashOutTarget
    };
  }

  _updateState(key, state, won, crashPoint) {
    if (won) {
      state.consecutiveWins++;
      state.consecutiveLosses = 0;
    } else {
      state.consecutiveLosses++;
      state.consecutiveWins = 0;
    }

    switch (key) {
      case 'martingale':
        state.currentBet = won ? state.baseBet : Math.min(state.currentBet * state.multiplier, state.maxBet || 1000);
        break;

      case 'antiMartingale':
        if (won && state.consecutiveWins < state.maxWins) {
          state.currentBet *= state.multiplier;
        } else {
          state.currentBet = state.baseBet;
        }
        break;

      case 'fibonacci':
        state.fibIndex = won ? Math.max(0, state.fibIndex - 2) : state.fibIndex + 1;
        break;

      case 'dalembert':
        state.currentBet = won
          ? Math.max(state.baseBet, state.currentBet - state.unitSize)
          : state.currentBet + state.unitSize;
        break;

      case 'labouchere':
        if (won) {
          if (state.sequence.length > 1) {
            state.sequence.shift();
            state.sequence.pop();
          } else {
            state.sequence = [1, 2, 3, 4, 5];
          }
        } else {
          const lastBet = state.sequence.length === 1
            ? state.sequence[0]
            : state.sequence[0] + state.sequence[state.sequence.length - 1];
          state.sequence.push(lastBet);
        }
        break;

      case 'aiNeural':
        state.recentCrashes.push(crashPoint);
        if (state.recentCrashes.length > state.adaptiveWindow) {
          state.recentCrashes.shift();
        }
        break;
    }
  }

  _aiAnalyze(state) {
    const crashes = state.recentCrashes;
    const count = crashes.length;
    const bankroll = state.bankroll || 1000;
    const riskMultipliers = { low: 0.5, medium: 1.0, high: 1.5 };
    const riskMult = riskMultipliers[state.riskLevel] || 1.0;

    if (count < 3) {
      return {
        suggestedBet: state.baseBet * riskMult,
        suggestedCashOut: 2.0,
        confidence: 0.3
      };
    }

    // BOLT OPTIMIZATION: Calculate metrics in a single pass O(N) to avoid multiple array iterations
    let sum = 0;
    let sumSq = 0;
    let recentSum = 0;
    let lowCrashCount = 0;
    const recentLimit = Math.min(count, 5);

    for (let i = 0; i < count; i++) {
      const c = crashes[i];
      sum += c;
      sumSq += c * c;
      if (c < 1.5) lowCrashCount++;
      if (i >= count - recentLimit) recentSum += c;
    }

    const avg = sum / count;
    const variance = (sumSq / count) - (avg * avg);
    const volatility = Math.sqrt(Math.max(0, variance));
    const recentAvg = recentSum / recentLimit;
    const momentum = recentAvg - avg;
    const lowCrashRatio = lowCrashCount / count;

    let suggestedCashOut;
    if (lowCrashRatio > 0.4) {
      suggestedCashOut = 1.3 + (0.2 * riskMult);
    } else if (momentum > 0.5) {
      suggestedCashOut = Math.min(avg * 0.7, 3.0) * riskMult;
    } else {
      suggestedCashOut = Math.min(avg * 0.55, 2.5) * riskMult;
    }

    suggestedCashOut = Math.max(1.1, Math.min(suggestedCashOut, 10.0));

    const confidence = Math.min(0.95, 0.3 + (count / state.adaptiveWindow) * 0.5 - volatility * 0.05);
    const betSizing = state.baseBet * (0.5 + confidence * riskMult);

    state.momentum = momentum;
    state.volatility = volatility;

    return {
      suggestedBet: Math.max(1, Math.min(betSizing, bankroll * 0.1)),
      suggestedCashOut: this._round(suggestedCashOut, 2),
      confidence: this._round(confidence, 3),
      analysis: { avg, volatility, momentum, lowCrashRatio }
    };
  }

  _estimateWinProb(cashOut) {
    return Math.min(0.99, 0.97 / cashOut);
  }

  _round(num, decimals = 2) {
    const p = Math.pow(10, decimals);
    return Math.round(num * p) / p;
  }

  /**
   * AI Optimizer: Find optimal parameters for a strategy
   */
  optimize(strategyKey, crashPoints, bankroll = 1000, iterations = 50) {
    const strategy = this.strategies[strategyKey];
    if (!strategy) return null;

    let bestResult = null;
    let bestParams = null;

    // Save original params to restore later
    const originalParams = { ...strategy.params };

    for (let i = 0; i < iterations; i++) {
      const params = this._randomizeParams(strategyKey, originalParams);
      this.strategies[strategyKey].params = params;

      try {
        // BOLT OPTIMIZATION: Use includeResults: false during optimization iterations
        // to skip expensive object allocations and result set generation.
        const result = this.backtest(strategyKey, crashPoints, bankroll, { includeResults: false });
        const score = this._scoreResult(result, bankroll);

        if (!bestResult || score > bestResult.score) {
          bestResult = { ...result, score };
          bestParams = { ...params };
        }
      } catch (e) {
        // Skip invalid parameter combinations
      }
    }

    // Restore original params
    this.strategies[strategyKey].params = originalParams;

    // BOLT OPTIMIZATION: Perform one final full backtest with best params to get full result data for UI
    let finalBestResult = null;
    if (bestParams) {
      this.strategies[strategyKey].params = bestParams;
      finalBestResult = this.backtest(strategyKey, crashPoints, bankroll, { includeResults: true });
      finalBestResult.score = bestResult.score;
      this.strategies[strategyKey].params = originalParams;
    }

    return {
      bestParams,
      bestResult: finalBestResult,
      optimizationRuns: iterations
    };
  }

  _randomizeParams(key, baseParams) {
    const params = { ...baseParams };
    const rand = (min, max) => min + Math.random() * (max - min);

    params.cashOut = parseFloat(rand(1.1, 5.0).toFixed(2));
    params.baseBet = parseFloat(rand(1, 50).toFixed(0));

    switch (key) {
      case 'martingale':
        params.multiplier = parseFloat(rand(1.5, 3.0).toFixed(1));
        params.maxBet = parseFloat(rand(200, 2000).toFixed(0));
        break;
      case 'antiMartingale':
        params.multiplier = parseFloat(rand(1.5, 3.0).toFixed(1));
        params.maxWins = Math.floor(rand(2, 6));
        break;
      case 'dalembert':
        params.unitSize = parseFloat(rand(1, 20).toFixed(0));
        break;
      case 'kelly':
        params.fraction = parseFloat(rand(0.05, 0.5).toFixed(2));
        break;
      case 'aiNeural':
        params.riskLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
        params.adaptiveWindow = Math.floor(rand(10, 50));
        break;
    }
    return params;
  }

  _scoreResult(result, bankroll) {
    const roi = result.totalProfit / bankroll;
    const winRate = result.wins / Math.max(1, result.totalRounds);
    const drawdownPenalty = result.maxDrawdown / bankroll;
    const survivalBonus = result.totalRounds / 100;
    return roi * 2 + winRate - drawdownPenalty * 3 + survivalBonus * 0.1;
  }

  getStrategyList() {
    return Object.entries(this.strategies).map(([key, s]) => ({
      key,
      ...s
    }));
  }
}

window.StrategyEngine = StrategyEngine;
