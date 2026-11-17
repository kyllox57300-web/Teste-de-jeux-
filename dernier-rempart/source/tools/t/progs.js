export default async (page) => {
  console.log(await page.evaluate(async () => {
    const D = __DR, R = D.renderer, out = [];
    const names = () => R.info.programs.map((p) => p.name + '#' + p.cacheKey.length);
    const before = new Set(names()); out.push('programs after loading+menu: ' + before.size);
    D.debug.setFree(true); D.debug.startGame(); D.debug.probe();
    const after = names().filter((n) => !before.has(n)); out.push('new at first game frame: ' + after.length + '  ' + after.slice(0, 30).join(' | '));
    const b2 = new Set(names()); const z = D.zombies.makeKind('m'); z.holder.visible = true; z.holder.position.set(0, 0, 2); D.debug.probe();
    out.push('new for a fresh m zombie: ' + names().filter((n) => !b2.has(n)).join(' | '));
    return out.join('\n');
  }));
};
