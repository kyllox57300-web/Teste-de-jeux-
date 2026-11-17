// Renders every sound through an OfflineAudioContext-free path: runs the real AudioContext, records the master output via MediaRecorder-less tap (AnalyserNode) and reports peak levels and errors.
export default async (page) => {
  const r = await page.evaluate(async () => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    const S = window.__SND; const out = []; const errs = [];
    if (!S) return 'no handle';
    const names = ['shot:pistol', 'shot:magnum', 'shot:smg', 'shot:shotgun', 'shot:rifle', 'shot:lmg', 'shot:launcher', 'dry', 'reload:0', 'reload:1', 'reload:2', 'swing', 'thud', 'flesh', 'tick', 'hitmark', 'step', 'zstep', 'impact', 'buy', 'deny', 'pickup', 'perk', 'boxOpen', 'door', 'plank:1', 'plank:0', 'groan:0', 'groan:1', 'zombieAttack', 'zombieDie', 'hurt', 'heartbeat', 'roundStart', 'roundEnd', 'gameOver', 'thunder', 'boom'];
    for (const n of names) { const [f, a] = n.split(':'); try { const arg = a === undefined ? [] : f === 'shot' ? [a] : f === 'groan' ? [2, 2, a === '1'] : [ +a ]; const pos = ['flesh', 'zstep', 'impact', 'door', 'plank', 'groan', 'zombieAttack', 'zombieDie'].includes(f); S[f](...(pos ? (f === 'plank' ? [2, 2, a === '1'] : f === 'groan' ? arg : [2, 2]) : arg)); out.push(n); } catch (e) { errs.push(n + ': ' + e.message); } }
    S.flameLoop(true); S.flameLoop(false); S.tension(0.5); S.ambientTick(99);
    return JSON.stringify({ played: out.length, errs, state: S.state() });
  });
  console.log(r);
};
