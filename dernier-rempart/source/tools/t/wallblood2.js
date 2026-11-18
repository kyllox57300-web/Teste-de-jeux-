// Throws blood onto the wall in front of the camera (as a shot through a zombie would), shows it fresh and after it ran.
export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    const p = D.player; p.x = 14.5; p.z = -7.2; p.yaw = 1.25 + 0.5; p.pitch = 0.02;
    window.sim = (n) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; sim(30);
    const T = D.debug.THREE, o = new T.Vector3(), d = new T.Vector3(); D.camera.getWorldPosition(o);
    for (let i = 0; i < 7; i++) { d.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.15, -1).normalize().transformDirection(D.camera.matrixWorld); const h = D.debug.rayWorld(o, d, 30); if (h.hit) D.fx.wallBlood(o.clone().addScaledVector(d, h.t), h.nx, h.ny, h.nz, i < 2 ? 1.25 : 0.85); }
    sim(10); });
  await shot('wb2-1');
  await page.evaluate(() => sim(200)); await shot('wb2-2');
};
