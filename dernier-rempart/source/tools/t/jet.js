export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(true); D.game.between = 999; });
  const E = (c) => page.evaluate(c);
  await E(`(()=>{ const p = D.player; p.yaw = Math.PI + 0.3; p.pitch = -0.05; for (let i = 0; i < 40; i++) D.debug.simulate(1/60); for (let i = 0; i < 50; i++) { D.debug.input.fire = true; D.debug.simulate(1/60); } })()`);
  await shot('j1-firing');
  await E(`(()=>{ D.debug.freeze = true; D.debug.view([17, 4, -18], [0, -2, -22], 60); })()`); await shot('j2-side');
  await E(`(()=>{ D.debug.freeze = false; D.debug.input.fire = false; const p = D.player; for (let i = 0; i < 6; i++) { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = p.x - 1.6 + (i % 3) * 1.6; q.z = p.z + 3.0 + Math.floor(i / 3) * 1.0; q.y = 0; q.t = 0; } p.yaw = Math.PI; for (let i = 0; i < 30; i++) D.debug.simulate(1/60); for (let i = 0; i < 36; i++) { D.debug.input.fire = true; D.debug.simulate(1/60); } })()`);
  await shot('j3-crowd');
};
