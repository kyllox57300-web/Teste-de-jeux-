export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
  });
  const E = (c) => page.evaluate(c);
  await E(`D.weapons.give('rifle'); V(0.5, 3.5, 0.2, -0.02, 45)`);
  console.log(await E(`(()=>{ const T = D.debug.THREE, cam = D.camera, inv = cam.matrixWorld.clone().invert(), out = {};
    for (const s of ['R','L']) { const B = D.weapons.arms[s].B; const f = (b) => { const v = new T.Vector3().setFromMatrixPosition(b.matrixWorld).applyMatrix4(inv).multiplyScalar(1/0.12); return [+(v.x).toFixed(3), +(v.y).toFixed(3), +(v.z).toFixed(3)]; };
      out[s] = { shoulder: f(B.Arm), elbow: f(B.ForeArm), wrist: f(B.Hand), middle1: f(B.HandMiddle1), index1: f(B.HandIndex1), pinky1: f(B.HandPinky1), mid3: f(B.HandMiddle3), thumb2: f(B.HandThumb2) }; }
    const g = D.weapons.vm.rifle.g; out.gun = [g.position.x, g.position.y, g.position.z].map(v => +v.toFixed(3)); out.info = { grip: g.userData.grip, fore: g.userData.fore }; return JSON.stringify(out, null, 1); })()`));
  await E(`D.weapons.arms.R.holder.scale.setScalar(0.0001); V(0.5, 3.5, 0.2, -0.02, 2)`); await shot('82-left-only');
};
