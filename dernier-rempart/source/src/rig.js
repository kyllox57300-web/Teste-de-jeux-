import * as THREE from 'three';
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _bq = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _id = new THREE.Quaternion();

// Rotate `bone` (world space, shortest arc) so that the bone->child direction points along `dir`.
export function aimBone(bone, child, dir, weight = 1) {
  _a.setFromMatrixPosition(bone.matrixWorld); _b.setFromMatrixPosition(child.matrixWorld).sub(_a).normalize();
  _q.setFromUnitVectors(_b, dir); if (weight < 1) { _q2.copy(_id).slerp(_q, weight); _q.copy(_q2); }
  bone.getWorldQuaternion(_bq); _bq.premultiply(_q);
  bone.parent.getWorldQuaternion(_pq); bone.quaternion.copy(_pq.invert().multiply(_bq));
  bone.updateMatrixWorld(true);
}
export function turnBone(bone, axis, angle) {
  _q.setFromAxisAngle(axis, angle); bone.getWorldQuaternion(_bq); _bq.premultiply(_q);
  bone.parent.getWorldQuaternion(_pq); bone.quaternion.copy(_pq.invert().multiply(_bq));
  bone.updateMatrixWorld(true);
}
export function setWorldQuat(bone, q) { bone.parent.getWorldQuaternion(_pq); bone.quaternion.copy(_pq.invert().multiply(q)); bone.updateMatrixWorld(true); }
