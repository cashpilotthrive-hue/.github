const fs = require('fs');
const code = fs.readFileSync('./aviator-ai-pro-lab/js/strategies.js', 'utf8');

// Simple mock for window
const mockWindow = {};
const contextFunc = new Function('window', code);
contextFunc(mockWindow);
const StrategyEngineClass = mockWindow.StrategyEngine;

const engine = new StrategyEngineClass();
const crashPoints = Array.from({ length: 1000 }, (_, i) => 1.1 + (i % 5) * 0.5); // Deterministic

console.time('optimize-aiNeural-100');
engine.optimize('aiNeural', crashPoints, 1000, 100);
console.timeEnd('optimize-aiNeural-100');

console.time('optimize-martingale-100');
engine.optimize('martingale', crashPoints, 1000, 100);
console.timeEnd('optimize-martingale-100');
