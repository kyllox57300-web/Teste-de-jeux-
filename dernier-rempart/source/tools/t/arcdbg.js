export default async (page) => {
  console.log(await page.evaluate(() => { const D = __DR, p = D.player; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    p.weapons = [{ id: 'orage', mag: 8, reserve: 40, up: false }]; p.cur = 0; D.weapons.reset(); p.x = -2; p.z = 4; p.yaw = 0; p.pitch = -0.06; for (let i = 0; i < 40; i++) D.debug.simulate(1/60);
    for (let i = 0; i < 8; i++) { const q = D.zombies.spawn(D.world.windows[0], 6); q.state = 'chase'; q.x = -4 + (i % 4) * 1.4; q.z = 0.5 - Math.floor(i / 4) * 1.6; q.y = 0; q.speed = 0.001; q.t = 0; }
    for (let i = 0; i < 10; i++) D.debug.simulate(1/60);
    D.debug.input.firePressed = true; D.debug.simulate(1/60);
    const lines = D.scene.children.filter((o) => o.isLine && o.visible); const out = [];
    for (const L of lines) { const a = L.geometry.attributes.position, n = L.geometry.drawRange.count; let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) { const v = a.getComponent(i, k); mn[k] = Math.min(mn[k], v); mx[k] = Math.max(mx[k], v); } } out.push(`n=${n} min ${mn.map(v => v.toFixed(2))} max ${mx.map(v => v.toFixed(2))} first ${[a.getX(0), a.getY(0), a.getZ(0)].map(v => v.toFixed(2))}`); }
    return out.join('\n'); }));
};
