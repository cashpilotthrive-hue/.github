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
  backtest(strategyKey, crashPoints, bankroll = 1000) {
    const strategy = this.strategies[strategyKey];
    if (!strategy) throw new Error(`Unknown strategy: ${strategyKey}`);

    const results = [];
    let currentBankroll = bankroll;
    let state = this._initState(strategyKey, strategy.params);

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

      results.push({
        round: i + 1,
        crashPoint: parseFloat(crashPoint.toFixed(2)),
        betAmount: parseFloat(actualBet.toFixed(2)),
        cashOutTarget: parseFloat(cashOutTarget.toFixed(2)),
        won,
        profit: parseFloat(profit.toFixed(2)),
        bankroll: parseFloat(currentBankroll.toFixed(2))
      });

      this._updateState(strategyKey, state, won, crashPoint, results);
    }

    return {
      strategy: strategy.name,
      results,
      finalBankroll: parseFloat(currentBankroll.toFixed(2)),
      totalRounds: results.length,
      wins: results.filter(r => r.won).length,
      losses: results.filter(r => !r.won).length,
      winRate: results.length > 0 ? (results.filter(r => r.won).length / results.length * 100).toFixed(1) : '0.0',
      totalProfit: parseFloat((currentBankroll - bankroll).toFixed(2)),
      roi: parseFloat(((currentBankroll - bankroll) / bankroll * 100).toFixed(2)),
      maxDrawdown: this._calcMaxDrawdown(results, bankroll),
      peakBankroll: Math.max(...results.map(r => r.bankroll), bankroll).toFixed(2)
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

  _updateState(key, state, won, crashPoint, results) {
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

  _estimateWinProb(cashOut) {
    return Math.min(0.99, 0.97 / cashOut);
  }

  _calcMaxDrawdown(results, initialBankroll) {
    let peak = initialBankroll;
    let maxDD = 0;
    for (const r of results) {
      peak = Math.max(peak, r.bankroll);
      maxDD = Math.max(maxDD, peak - r.bankroll);
    }
    return parseFloat(maxDD.toFixed(2));
  }

  /**
   * AI Optimizer: Find optimal parameters for a strategy
   */
  optimize(strategyKey, crashPoints, bankroll = 1000, iterations = 50) {
    const strategy = this.strategies[strategyKey];
    if (!strategy) return null;

    let bestResult = null;
    let bestParams = null;

    for (let i = 0; i < iterations; i++) {
      const params = this._randomizeParams(strategyKey, strategy.params);
      const tempStrategy = { ...this.strategies[strategyKey], params };
      this.strategies[strategyKey] = tempStrategy;

      try {
        const result = this.backtest(strategyKey, crashPoints, bankroll);
        const score = this._scoreResult(result, bankroll);

        if (!bestResult || score > bestResult.score) {
          bestResult = { ...result, score };
          bestParams = { ...params };
        }
      } catch (e) {
        // Skip invalid parameter combinations
      }
    }

    this.strategies[strategyKey] = { ...strategy, params: strategy.params };

    return {
      bestParams,
      bestResult,
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
