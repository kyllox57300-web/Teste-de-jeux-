export default async (page) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    window.V = (n = 6) => { const p = D.player; p.x = -2; p.z = 1.2; p.yaw = 0.2; p.pitch = -0.02; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.EQ = (id) => { D.player.weapons = [{ id, mag: 5, reserve: 50, up: false }]; D.player.cur = 0; D.weapons.reset(); V(50); };
  });
  for (const id of ['rifle', 'pistol']) console.log(id, await page.evaluate((id) => { EQ(id); const T = D.debug.THREE, g = D.weapons.vm[id].g, inv = g.matrixWorld.clone().invert(), out = { grip: g.userData.grip, fore: g.userData.fore };
    for (const s of ['R', 'L']) { const B = D.weapons.arms[s].B, o = {}; for (const k of ['ForeArm', 'Hand', 'HandIndex1', 'HandIndex2', 'HandIndex3', 'HandMiddle1', 'HandMiddle2', 'HandMiddle3', 'HandPinky1', 'HandPinky3', 'HandThumb1', 'HandThumb2', 'HandThumb3']) { if (!B[k]) { o[k] = 'MISSING'; continue; } const v = new T.Vector3().setFromMatrixPosition(B[k].matrixWorld).applyMatrix4(inv); o[k.replace('Hand', '') || 'Wrist'] = [Math.round(v.x * 1000), Math.round(v.y * 1000), Math.round(v.z * 1000)].join(','); } out[s] = o; }
    return JSON.stringify(out); }, id));
};
