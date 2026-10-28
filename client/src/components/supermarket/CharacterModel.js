import * as THREE from 'three';

// Lightweight procedural human character with basket
export class CharacterModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'player_character';
    
    // Walk animation state
    this.walkPhase = 0;
    this.isWalking = false;
    this.bobAmount = 0;

    this._build();
    scene.add(this.group);
  }

  _color(hex) {
    return new THREE.MeshLambertMaterial({ color: hex });
  }

  _mesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = false;
    return m;
  }

  _build() {
    const skinColor = 0xf1c27d;
    const shirtColor = 0x2e7d32; // Village Mart green
    const pantsColor = 0x1a237e;
    const hairColor = 0x3e2723;
    const shoeColor = 0x212121;
    const basketColor = 0xc4a24a;

    // === HEAD ===
    this.head = this._mesh(
      new THREE.SphereGeometry(0.18, 12, 8),
      this._color(skinColor)
    );
    this.head.position.set(0, 1.68, 0);
    this.group.add(this.head);

    // Hair
    const hair = this._mesh(
      new THREE.SphereGeometry(0.185, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      this._color(hairColor)
    );
    hair.position.set(0, 1.68, 0);
    this.group.add(hair);

    // === TORSO (shirt) ===
    this.torso = this._mesh(
      new THREE.BoxGeometry(0.36, 0.5, 0.22),
      this._color(shirtColor)
    );
    this.torso.position.set(0, 1.22, 0);
    this.group.add(this.torso);

    // Logo on shirt
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, 64, 64);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('VM', 32, 42);
    const logoTex = new THREE.CanvasTexture(canvas);
    const logo = this._mesh(
      new THREE.PlaneGeometry(0.12, 0.1),
      new THREE.MeshBasicMaterial({ map: logoTex, transparent: true })
    );
    logo.position.set(0, 1.22, 0.115);
    this.group.add(logo);

    // === PELVIS ===
    const pelvis = this._mesh(
      new THREE.BoxGeometry(0.34, 0.15, 0.2),
      this._color(0x4caf50)
    );
    pelvis.position.set(0, 0.94, 0);
    this.group.add(pelvis);

    // === UPPER ARMS ===
    this.armL = new THREE.Group();
    this.armR = new THREE.Group();

    const upperArmGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.28, 8);
    const lowerArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8);
    const handGeo = new THREE.SphereGeometry(0.07, 8, 6);

    // Left arm
    const upperArmL = this._mesh(upperArmGeo, this._color(shirtColor));
    upperArmL.position.set(0, -0.14, 0);
    this.armL.add(upperArmL);

    const lowerArmL = this._mesh(lowerArmGeo, this._color(skinColor));
    lowerArmL.position.set(0, -0.4, 0);
    this.armL.add(lowerArmL);

    const handL = this._mesh(handGeo, this._color(skinColor));
    handL.position.set(0, -0.55, 0);
    this.armL.add(handL);

    this.armL.position.set(-0.22, 1.38, 0);
    this.armL.rotation.z = 0.3;
    this.group.add(this.armL);

    // Right arm (basket arm)
    const upperArmR = this._mesh(upperArmGeo, this._color(shirtColor));
    upperArmR.position.set(0, -0.14, 0);
    this.armR.add(upperArmR);

    const lowerArmR = this._mesh(lowerArmGeo, this._color(skinColor));
    lowerArmR.position.set(0, -0.4, 0);
    this.armR.add(lowerArmR);

    const handR = this._mesh(handGeo, this._color(skinColor));
    handR.position.set(0, -0.55, 0);
    this.armR.add(handR);

    this.armR.position.set(0.22, 1.38, 0);
    this.armR.rotation.z = -0.5;
    this.armR.rotation.x = 0.6;
    this.group.add(this.armR);

    // === LEGS ===
    this.legL = new THREE.Group();
    this.legR = new THREE.Group();

    const upperLegGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.35, 8);
    const lowerLegGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.32, 8);
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.22);

    // Left leg
    const upperLegL = this._mesh(upperLegGeo, this._color(pantsColor));
    upperLegL.position.set(0, -0.175, 0);
    this.legL.add(upperLegL);

    const lowerLegL = this._mesh(lowerLegGeo, this._color(pantsColor));
    lowerLegL.position.set(0, -0.51, 0);
    this.legL.add(lowerLegL);

    const shoeL = this._mesh(shoeGeo, this._color(shoeColor));
    shoeL.position.set(0, -0.7, 0.04);
    this.legL.add(shoeL);

    this.legL.position.set(-0.1, 0.87, 0);
    this.group.add(this.legL);

    // Right leg
    const upperLegR = this._mesh(upperLegGeo, this._color(pantsColor));
    upperLegR.position.set(0, -0.175, 0);
    this.legR.add(upperLegR);

    const lowerLegR = this._mesh(lowerLegGeo, this._color(pantsColor));
    lowerLegR.position.set(0, -0.51, 0);
    this.legR.add(lowerLegR);

    const shoeR = this._mesh(shoeGeo, this._color(shoeColor));
    shoeR.position.set(0, -0.7, 0.04);
    this.legR.add(shoeR);

    this.legR.position.set(0.1, 0.87, 0);
    this.group.add(this.legR);

    // === SHOPPING BASKET ===
    this._buildBasket(basketColor);
  }

  _buildBasket(color) {
    this.basketGroup = new THREE.Group();

    // Basket body (tapered box)
    const basketMat = new THREE.MeshLambertMaterial({ color, wireframe: false });
    const basketGeo = new THREE.BoxGeometry(0.28, 0.22, 0.20);
    const basket = new THREE.Mesh(basketGeo, basketMat);
    this.basketGroup.add(basket);

    // Basket rim
    const rimGeo = new THREE.TorusGeometry(0.16, 0.02, 6, 16);
    const rimMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    const rimH = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.02, 0.22), rimMat);
    rimH.position.y = 0.11;
    this.basketGroup.add(rimH);

    // Basket handle
    const handleGeo = new THREE.TorusGeometry(0.1, 0.015, 6, 16, Math.PI);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x6b5f20 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 0.18, 0);
    handle.rotation.x = Math.PI / 2;
    this.basketGroup.add(handle);

    // Weave pattern lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7a5a0f });
    for (let i = -2; i <= 2; i++) {
      const pts = [
        new THREE.Vector3(-0.14, -0.08 + i * 0.05, 0.101),
        new THREE.Vector3(0.14, -0.08 + i * 0.05, 0.101)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      this.basketGroup.add(new THREE.Line(lineGeo, lineMat));
    }

    // Item counter display (small canvas texture)
    this.itemCountCanvas = document.createElement('canvas');
    this.itemCountCanvas.width = 64; this.itemCountCanvas.height = 64;
    this.itemCountCtx = this.itemCountCanvas.getContext('2d');
    this.itemCountTex = new THREE.CanvasTexture(this.itemCountCanvas);
    
    const badge = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 16),
      new THREE.MeshBasicMaterial({ map: this.itemCountTex, transparent: true })
    );
    badge.position.set(0.1, 0.16, 0.101);
    this.basketGroup.add(badge);
    this._updateItemCountBadge(0);

    // Position basket in player's right hand
    this.basketGroup.position.set(0.22, -0.52, 0.05);
    this.basketGroup.rotation.x = 0.2;
    this.armR.add(this.basketGroup);

    this.basketGroup.name = 'shopping_basket';
  }

  _updateItemCountBadge(count) {
    const ctx = this.itemCountCtx;
    ctx.clearRect(0, 0, 64, 64);
    if (count > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count > 9 ? '9+' : count, 32, 34);
    }
    this.itemCountTex.needsUpdate = true;
  }

  updateCartCount(count) {
    this._updateItemCountBadge(count);
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setRotationY(angle) {
    this.group.rotation.y = angle;
  }

  update(dt, isMoving) {
    this.isWalking = isMoving;

    if (isMoving) {
      this.walkPhase += dt * 6;
    } else {
      // Ease back to rest
      this.walkPhase *= 0.9;
    }

    const swing = Math.sin(this.walkPhase);
    const swingAmt = isMoving ? 0.35 : 0;
    const bob = isMoving ? Math.abs(Math.sin(this.walkPhase)) * 0.03 : 0;

    // Leg swing
    if (this.legL) this.legL.rotation.x = swing * swingAmt;
    if (this.legR) this.legR.rotation.x = -swing * swingAmt;

    // Arm swing (opposite to legs)
    if (this.armL) this.armL.rotation.x = -swing * swingAmt * 0.5;
    // Right arm holds basket - minimal swing
    if (this.armR) {
      this.armR.rotation.x = 0.6 + swing * swingAmt * 0.15;
    }

    // Body bob
    if (this.torso) this.torso.position.y = 1.22 + bob;
    if (this.head) this.head.position.y = 1.68 + bob;
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}
