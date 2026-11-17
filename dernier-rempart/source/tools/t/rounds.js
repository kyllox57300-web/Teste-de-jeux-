export default async (page, shot) => {
  const r = await page.evaluate(() => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); const p = D.player, out = [];
    D.game.hurt = () => { window.hurts = (window.hurts || 0) + 1; };
    let refunds = 0; const rf = D.game.refund; D.game.refund = () => { refunds++; rf(); };
    D.weapons.give('rifle'); window.rooms = {}; for (const d of D.world.doors) D.world.openDoor(d);
    const aim = () => { let b = null, bd = 1e9; for (const z of D.zombies.list) { if (z.state !== 'chase') continue; const d = Math.hypot(z.x - p.x, z.z - p.z); if (d < bd) { bd = d; b = z; } } if (!b) return null; const e = b.bones.Spine2.matrixWorld.elements; const dx = e[12] - p.x, dz = e[14] - p.z; p.yaw = Math.atan2(-dx, -dz); p.pitch = Math.atan2(e[13] - (p.y + 1.66), Math.hypot(dx, dz)) - p.recoil; return bd; };
    let lastRound = 0, t0 = 0, maxAlive = 0, steps = 0;
    while (D.game.round < 9 && steps < 60 * 60 * 14) {
      steps++; const d = aim(); D.debug.input.fire = d !== null && d < 9; p.weapons[p.cur].reserve = 200;
      // walk a loop through the three rooms so pathfinding is exercised
      const ph = (D.time * 0.05) % 6; const tgt = [[10, -2], [4, -10], [-2, -20], [20, -20], [25, -4], [26, 13]][ph | 0]; if (D.time - (window.lastTp || 0) > 20) { window.lastTp = D.time; p.x = tgt[0]; p.z = tgt[1]; }
      D.debug.input.fwd = false; if (d === null || d > 4) { const s = D.world.flow; /* steer straight to target using own BFS-free heading */ p.yaw = d === null ? Math.atan2(-(tgt[0] - p.x), -(tgt[1] - p.z)) : p.yaw; }
      D.debug.simulate(1 / 60); for (const z of D.zombies.list) if (z.state === 'chase') { const k = D.world.roomAt(z.x, z.z) || 'none'; window.rooms[k] = (window.rooms[k] || 0) + 1; } maxAlive = Math.max(maxAlive, D.zombies.alive);
      if (D.game.round !== lastRound) { out.push({ round: D.game.round, at: +D.time.toFixed(0), kills: p.kills, hs: p.headshots, hurts: window.hurts || 0, refunds, maxAlive, pts: p.points }); lastRound = D.game.round; maxAlive = 0; }
    }
    out.push({ end: +D.time.toFixed(0), round: D.game.round, alive: D.zombies.alive, list: D.zombies.list.map((z) => z.state + ':' + z.type + ':' + z.x.toFixed(1) + ',' + z.z.toFixed(1)), kills: p.kills, refunds, rooms: window.rooms, wins: D.world.windows.map(w => w.count).join(''), drops: D.game.drops.length, power: D.game.power });
    return JSON.stringify(out, null, 0);
  });
  console.log(r);
};
