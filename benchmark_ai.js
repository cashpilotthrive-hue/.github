const fs = require('fs');

// Mock window and crypto
global.window = {};
global.crypto = {
    getRandomValues: function(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 0xffffffff);
        }
        return arr;
    }
};

// Load files
const engineCode = fs.readFileSync('aviator-ai-pro-lab/js/engine.js', 'utf8');
eval(engineCode);
const AviatorEngine = window.AviatorEngine;

const strategiesCode = fs.readFileSync('aviator-ai-pro-lab/js/strategies.js', 'utf8');
eval(strategiesCode);
const StrategyEngine = window.StrategyEngine;

const engine = new AviatorEngine();
const strategyEngine = new StrategyEngine();

const crashPoints = engine.generateCrashHistory(1000);

// Warm up
strategyEngine.optimize('aiNeural', crashPoints, 1000, 10);

const iterations = 100;
const start = Date.now();
strategyEngine.optimize('aiNeural', crashPoints, 1000, iterations);
const end = Date.now();

console.log(`AI Neural Optimization with ${iterations} iterations and 1000 crash points took ${end - start}ms`);
