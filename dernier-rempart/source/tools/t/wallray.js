export default async (page) => {
  console.log(await page.evaluate(() => {
    const D = __DR, T = D.debug.THREE, out = [];
    const meshes = []; D.scene.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && o.visible) meshes.push(o); });
    const rc = new T.Raycaster(); rc.far = 5;
    for (const x of [6, 8, 9.0, 11, 13, 15]) {
      rc.set(new T.Vector3(x, 1.6, 1.0), new T.Vector3(0, 0, 1));
      const h = rc.intersectObjects(meshes, false)[0];
      const hs = rc.intersectObjects(meshes, false).slice(0, 3).map((h) => (h.object.material.name || h.object.material.type) + (h.object.material === D.mat.brick ? '[BRICK]' : '') + '@' + h.distance.toFixed(2)).join(' , '); out.push(`ray at x=${x}: ` + hs + ' | ' + (h ? `${h.object.material.type}/${h.object.material.name || ''} map=${!!h.object.material.map} dist ${h.distance.toFixed(2)} faceNormalZ ${h.face.normal.z.toFixed(2)}` : 'nothing'));
    }
    const brick = D.mat.brick; out.push('brick side ' + brick.side + ' transparent ' + brick.transparent + ' visible meshes with brick: ' + meshes.filter((m) => m.material === brick).length);
    return out.join('\n');
  }));
};
