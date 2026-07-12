
global.window = global;
require('./aviator-ai-pro-lab/js/strategies.js');

const engine = new StrategyEngine();
const crashPoints = Array.from({ length: 100 }, () => 1 + Math.random() * 5);

function verifyParity() {
  console.log('Verifying backtest parity...');
  const resFull = engine.backtest('aiNeural', crashPoints, 1000, { includeResults: true });
  const resFast = engine.backtest('aiNeural', crashPoints, 1000, { includeResults: false });

  const fieldsToCompare = ['finalBankroll', 'totalRounds', 'wins', 'losses', 'totalProfit', 'roi', 'maxDrawdown'];

  let failed = false;
  fieldsToCompare.forEach(field => {
    if (resFull[field] !== resFast[field]) {
      console.error(`Mismatch in field "${field}": Full=${resFull[field]}, Fast=${resFast[field]}`);
      failed = true;
    }
  });

  if (resFast.results !== null) {
    console.error('Fast backtest should have null results');
    failed = true;
  }

  if (!failed) {
    console.log('✅ Backtest parity verified successfully!');
  } else {
    process.exit(1);
  }
}

verifyParity();
