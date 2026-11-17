// Shared game context (singleton) — every module reads/writes through G.
export const G = {
  scene: null, camera: null, renderer: null,
  img: {}, tex: {}, mat: {},
  state: 'loading', time: 0, maxAniso: 4,
  settings: { sens: 1, volume: 0.8, quality: 'auto' },
};
