import * as THREE from 'three';
import { STORE } from './SupermarketScene.js';

const PLAYER_SPEED = 0.10;
const SPRINT_MULTIPLIER = 1.7;
const PLAYER_RADIUS = 0.5;
const PLAYER_HEIGHT = 1.75;
const CAM_HEIGHT_OFFSET = 1.6;
const LOOK_SENSITIVITY = 0.0018;

export class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Position (character feet) — start at entrance
    this.position = new THREE.Vector3(0, 0, STORE.depth / 2 - 4);
    this.velocity = new THREE.Vector3();

    // Camera yaw/pitch — yaw=0 => looking toward -Z (into store)
    this.yaw = 0;
    this.pitch = -0.08;

    // Keys held
    this.keys = {
      forward: false, backward: false,
      left: false, right: false,
      sprint: false
    };

    // Virtual joystick state (from D-pad buttons)
    this.virtualDir = { x: 0, y: 0 };

    // Pointer lock
    this.pointerLocked = false;

    // Collision objects
    this.solidObjects = [];

    // Track whether we're in an input field (to suppress key movement)
    this._inputFocused = false;

    // Init camera
    this._updateCamera();

    // Bind listeners
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocusIn = this._onFocusIn.bind(this);
    this._onFocusOut = this._onFocusOut.bind(this);

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    // Reset all keys when window loses focus (prevents stuck keys)
    window.addEventListener('blur', this._onBlur);
    document.addEventListener('focusin', this._onFocusIn);
    document.addEventListener('focusout', this._onFocusOut);
  }

  setSolidObjects(objs) {
    this.solidObjects = objs;
  }

  requestPointerLock() {
    if (!this._inputFocused) {
      this.domElement.requestPointerLock();
    }
  }

  _onBlur() {
    // Window lost focus — reset all keys immediately
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.sprint = false;
    this.virtualDir.x = 0;
    this.virtualDir.y = 0;
  }

  _onFocusIn(e) {
    const tag = e.target?.tagName?.toLowerCase();
    this._inputFocused = (tag === 'input' || tag === 'textarea' || tag === 'select');
    if (this._inputFocused) {
      // Clear movement keys when user is typing
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
    }
  }

  _onFocusOut(e) {
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      this._inputFocused = false;
    }
  }

  _onPointerLockChange() {
    const wasLocked = this.pointerLocked;
    this.pointerLocked = document.pointerLockElement === this.domElement;
    // If we just lost pointer lock, reset keys
    if (wasLocked && !this.pointerLocked) {
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
    }
  }

  _onKeyDown(e) {
    // Don't move if user is typing in an input
    if (this._inputFocused) return;
    // Don't capture if a modal/overlay is open
    if (e.target && e.target !== document.body && e.target !== document.documentElement) {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'button' || tag === 'select') return;
    }
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.keys.forward = true; break;
      case 'KeyS': case 'ArrowDown':  this.keys.backward = true; break;
      case 'KeyA': case 'ArrowLeft':  this.keys.left = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = true; break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.keys.forward = false; break;
      case 'KeyS': case 'ArrowDown':  this.keys.backward = false; break;
      case 'KeyA': case 'ArrowLeft':  this.keys.left = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
    }
  }

  _onMouseMove(e) {
    if (!this.pointerLocked) return;
    this.yaw -= e.movementX * LOOK_SENSITIVITY;
    this.pitch -= e.movementY * LOOK_SENSITIVITY;
    this.pitch = Math.max(-Math.PI / 3.5, Math.min(Math.PI / 3.5, this.pitch));
  }

  // For touch/drag camera rotation (when not pointer locked)
  rotateCameraBy(dx, dy) {
    this.yaw -= dx * LOOK_SENSITIVITY * 0.4;
    this.pitch -= dy * LOOK_SENSITIVITY * 0.4;
    this.pitch = Math.max(-Math.PI / 3.5, Math.min(Math.PI / 3.5, this.pitch));
  }

  // Virtual directional pad — called by UI buttons
  setVirtualDir(x, y) {
    this.virtualDir.x = x;
    this.virtualDir.y = y;
  }

  // Teleport to a position
  teleportTo(x, z) {
    this.position.set(x, 0, z);
    this._updateCamera();
  }

  // Get forward direction in XZ plane
  _getForwardDir() {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  _getRightDir() {
    return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }

  _tryMove(delta) {
    const newPos = this.position.clone().add(delta);

    // Boundary clamp
    const hw = STORE.width / 2 - 1;
    const hd = STORE.depth / 2 - 1;
    newPos.x = Math.max(-hw, Math.min(hw, newPos.x));
    newPos.z = Math.max(-hd, Math.min(hd, newPos.z));

    // Simple AABB collision with solid objects
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newPos.x - PLAYER_RADIUS, 0, newPos.z - PLAYER_RADIUS),
      new THREE.Vector3(newPos.x + PLAYER_RADIUS, PLAYER_HEIGHT, newPos.z + PLAYER_RADIUS)
    );

    for (const obj of this.solidObjects) {
      if (!obj.userData.isSolid) continue;
      const box = new THREE.Box3().setFromObject(obj);
      box.expandByScalar(0.08);
      if (playerBox.intersectsBox(box)) {
        // Try x-only slide
        const tryX = this.position.clone();
        tryX.x = newPos.x;
        const boxX = new THREE.Box3(
          new THREE.Vector3(tryX.x - PLAYER_RADIUS, 0, tryX.z - PLAYER_RADIUS),
          new THREE.Vector3(tryX.x + PLAYER_RADIUS, PLAYER_HEIGHT, tryX.z + PLAYER_RADIUS)
        );
        if (!boxX.intersectsBox(box)) {
          this.position.copy(tryX);
          return;
        }
        // Try z-only slide
        const tryZ = this.position.clone();
        tryZ.z = newPos.z;
        const boxZ = new THREE.Box3(
          new THREE.Vector3(tryZ.x - PLAYER_RADIUS, 0, tryZ.z - PLAYER_RADIUS),
          new THREE.Vector3(tryZ.x + PLAYER_RADIUS, PLAYER_HEIGHT, tryZ.z + PLAYER_RADIUS)
        );
        if (!boxZ.intersectsBox(box)) {
          this.position.copy(tryZ);
          return;
        }
        return; // fully blocked
      }
    }

    this.position.copy(newPos);
  }

  update(dt) {
    const speed = PLAYER_SPEED * (this.keys.sprint ? SPRINT_MULTIPLIER : 1);
    const fwd = this._getForwardDir();
    const right = this._getRightDir();

    let moveX = 0, moveZ = 0;

    // Keyboard movement (skip if user is typing)
    if (!this._inputFocused) {
      if (this.keys.forward)  { moveX += fwd.x; moveZ += fwd.z; }
      if (this.keys.backward) { moveX -= fwd.x; moveZ -= fwd.z; }
      if (this.keys.left)     { moveX -= right.x; moveZ -= right.z; }
      if (this.keys.right)    { moveX += right.x; moveZ += right.z; }
    }

    // Virtual D-pad
    if (this.virtualDir.y < -0.2) { moveX += fwd.x; moveZ += fwd.z; }
    if (this.virtualDir.y >  0.2) { moveX -= fwd.x; moveZ -= fwd.z; }
    if (this.virtualDir.x < -0.2) { moveX -= right.x; moveZ -= right.z; }
    if (this.virtualDir.x >  0.2) { moveX += right.x; moveZ += right.z; }

    const isMoving = (moveX !== 0 || moveZ !== 0);

    if (isMoving) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const delta = new THREE.Vector3(
        (moveX / len) * speed,
        0,
        (moveZ / len) * speed
      );
      this._tryMove(delta);
    }

    this._updateCamera();
    return isMoving;
  }

  _updateCamera() {
    this.camera.position.set(
      this.position.x,
      this.position.y + CAM_HEIGHT_OFFSET,
      this.position.z
    );
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  getCharacterRotation() {
    return this.yaw + Math.PI;
  }

  getMapPosition() {
    return { x: this.position.x, z: this.position.z };
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    window.removeEventListener('blur', this._onBlur);
    document.removeEventListener('focusin', this._onFocusIn);
    document.removeEventListener('focusout', this._onFocusOut);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
}
