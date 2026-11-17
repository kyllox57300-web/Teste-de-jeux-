export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.Zs = (list) => { D.zombies.clear(); for (const [x, z, type] of list) { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.type = type; q.speed = 0.001; q.t = 0; } };
  });
  const E = (c) => page.evaluate(c);
  await E(`D.weapons.give('rifle'); Zs([[-0.6,-1.2,0],[1.2,-2.5,0],[-2.4,-3,2]]); V(0.5, 3.5, 0.2, -0.02, 40); D.debug.input.fire = true; V(0.5,3.5,0.2,-0.02,1);`); await shot('40-fire-hip');
  await E(`D.debug.input.fire=false; D.debug.input.ads = true; V(0.5, 3.5, 0.2, -0.02, 40)`); await shot('41-ads');
  await E(`D.debug.input.ads=false; for (const z of D.zombies.list.slice()) D.zombies.kill(z, Math.random()<0.5, {x:0,y:0,z:-1}); V(0.5, 3.5, 0.2, -0.2, 70)`); await shot('42-dead');
  await E(`D.zombies.clear(); V(1.6, 4.1, -Math.PI/2, 0, 30)`); await shot('43-wallbuy');
  await E(`for (const d of D.world.doors) D.world.openDoor(d); D.player.points=5000; V(3.6, -11.6, 0, -0.25, 70); D.debug.input.usePressed = true; V(3.6,-11.6,0,-0.25,2); V(3.6, -11.6, 0, -0.25, 215)`); await shot('44-crate');
  await E(`V(-6.5, -7.2, -Math.PI/2 - 0.25, 0, 20)`); await shot('45-roomC');
  await E(`for (let i=0;i<5;i++) D.world.removePlank(D.world.windows[2]); D.game.between=0.01; D.game.round=4; V(1, 3.4, Math.PI, 0.0, 60*14)`); await shot('46-outside');
};
