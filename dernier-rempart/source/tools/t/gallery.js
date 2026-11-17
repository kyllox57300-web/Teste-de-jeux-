export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.Zs = (list) => { D.zombies.clear(); for (const [x, z, type] of list) { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.type = type; q.speed = type === 2 ? 3.6 : 1.2; q.t = 0; } };
  });
  const E = (c) => page.evaluate(c);
  await E(`D=__DR; D.weapons.give('rifle'); V(0.5, 3.5, 0.2, 0, 40)`); await shot('30-rifle-hip');
  await E(`D.debug.input.ads = true; V(0.5, 3.5, 0.2, 0, 40)`); await shot('31-rifle-ads');
  await E(`Zs([[-0.6,-1.2,0],[1.2,-2.5,0],[-2.4,-3,2]]); D.zombies.list.forEach(z=>z.speed=0.001); V(0.5, 3.5, 0.2, -0.02, 30); D.debug.input.fire = true; V(0.5,3.5,0.2,-0.02,2);`); await shot('32-rifle-fire');
  await E(`D.debug.input.fire=false; D.debug.input.ads=false; D.zombies.clear(); D.weapons.give('shotgun'); V(3.0, 3.0, -Math.PI/2+0.5, 0, 40)`); await shot('33-shotgun-wallbuy');
  await E(`for (const d of D.world.doors) D.world.openDoor(d); V(5.5, -1, -Math.PI/2 - 0.3, 0, 70)`); await shot('34-roomB');
  await E(`V(-6.5, -7.2, -Math.PI/2 - 0.25, 0, 20)`); await shot('35-roomC');
  await E(`D.weapons.switchWeapon(); V(-1, 2, Math.PI, 0.05, 50); D.world.removePlank(D.world.windows[2]); D.world.removePlank(D.world.windows[2]); D.world.removePlank(D.world.windows[2]); D.world.removePlank(D.world.windows[2]); D.world.removePlank(D.world.windows[2]); V(1, 3.2, Math.PI, 0.02, 60)`); await shot('36-window-out');
  console.log(await E(`JSON.stringify(D.renderer.info.render) + ' prog ' + D.renderer.info.programs.length + ' geo ' + D.renderer.info.memory.geometries + ' tex ' + D.renderer.info.memory.textures`));
};
