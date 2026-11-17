// Bakes the soldier's clips onto another humanoid skeleton.
// Both rigs are first put in the same reference pose (the target's bones are aimed along the source's bind-pose bones),
// then every frame applies the source's world-space rotation offsets from that reference to the target.
import * as THREE from 'three';
import { aimBone, setWorldQuat } from './rig.js';

const ORDER = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
  'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'];
const CHILD = { Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head', Head: 'HeadTop_End', LeftShoulder: 'LeftArm', LeftArm: 'LeftForeArm', LeftForeArm: 'LeftHand', LeftHand: 'LeftHandMiddle1',
  RightShoulder: 'RightArm', RightArm: 'RightForeArm', RightForeArm: 'RightHand', RightHand: 'RightHandMiddle1', LeftUpLeg: 'LeftLeg', LeftLeg: 'LeftFoot', LeftFoot: 'LeftToeBase', LeftToeBase: 'LeftToe_End',
  RightUpLeg: 'RightLeg', RightLeg: 'RightFoot', RightFoot: 'RightToeBase', RightToeBase: 'RightToe_End' };
export const boneKey = (n) => n.replace('mixamorig', '').replace(':', '');
export function boneMap(root) { const B = {}; root.traverse((o) => { if (o.isBone) B[boneKey(o.name)] = o; }); return B; }
// rest pose = the node transforms the file was loaded with (saved the first time, restored afterwards)
const REST = new WeakMap();
export function bindPose(root) {
  root.traverse((o) => { if (!o.isBone) return; const r = REST.get(o); if (!r) REST.set(o, [o.position.clone(), o.quaternion.clone(), o.scale.clone()]); else { o.position.copy(r[0]); o.quaternion.copy(r[1]); o.scale.copy(r[2]); } });
  root.updateMatrixWorld(true);
}

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _qi = new THREE.Quaternion();
export function retargetClips(src, srcClips, tgt, fps = 30) {
  // src / tgt: Object3D roots already placed so both face +Z at the origin, at their final scale
  const S = boneMap(src), T = boneMap(tgt), keys = ORDER.filter((k) => S[k] && T[k]);
  bindPose(src); bindPose(tgt);
  const S0 = {}, T0 = {};
  for (const k of keys) S0[k] = S[k].getWorldQuaternion(new THREE.Quaternion());
  // bring the target into the source's reference pose
  for (const k of keys) {
    const c = CHILD[k];
    if (k !== 'Hips' && c && S[c] && T[c]) { _v.setFromMatrixPosition(S[c].matrixWorld).sub(_w.setFromMatrixPosition(S[k].matrixWorld)).normalize(); aimBone(T[k], T[c], _v.clone()); }
  }
  for (const k of keys) T0[k] = T[k].getWorldQuaternion(new THREE.Quaternion());
  const sHip = new THREE.Vector3().setFromMatrixPosition(S.Hips.matrixWorld), tHip = new THREE.Vector3().setFromMatrixPosition(T.Hips.matrixWorld), ratio = tHip.y / sHip.y;
  const mixer = new THREE.AnimationMixer(src), out = {};
  for (const clip of srcClips) {
    mixer.stopAllAction(); const act = mixer.clipAction(clip); act.reset().play();
    const n = Math.max(2, Math.round(clip.duration * fps) + 1), times = new Float32Array(n), qv = {}, pv = new Float32Array(n * 3);
    for (const k of keys) qv[k] = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      const t = Math.min(clip.duration, i / fps); times[i] = t; mixer.setTime(t); src.updateMatrixWorld(true);
      for (const k of keys) {
        S[k].getWorldQuaternion(_q); _q.multiply(_qi.copy(S0[k]).invert()).multiply(T0[k]); setWorldQuat(T[k], _q);
        T[k].quaternion.toArray(qv[k], i * 4);
      }
      _v.setFromMatrixPosition(S.Hips.matrixWorld); _v.multiplyScalar(ratio); T.Hips.parent.worldToLocal(_v); _v.toArray(pv, i * 3);
    }
    const tracks = keys.map((k) => new THREE.QuaternionKeyframeTrack(`${T[k].name}.quaternion`, times, qv[k]));
    tracks.push(new THREE.VectorKeyframeTrack(`${T.Hips.name}.position`, times, pv));
    out[clip.name] = new THREE.AnimationClip(clip.name, clip.duration, tracks);
    act.stop();
  }
  mixer.stopAllAction(); bindPose(src); bindPose(tgt);
  return out;
}
