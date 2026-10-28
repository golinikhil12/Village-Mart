import * as THREE from 'three';

// ─── CONSTANTS ────────────────────────────────────────────────────
export const STORE = {
  width: 60,
  depth: 80,
  wallHeight: 7,
  floorY: 0,
  ceilingY: 7,
};

// Section definitions
export const SECTIONS = [
  { id: 'vegetables',  name: 'Vegetables',           x: -20, z: -30, color: 0x22c55e, icon: '🥦' },
  { id: 'fruits',      name: 'Fruits',               x: -20, z: -10, color: 0xf97316, icon: '🍎' },
  { id: 'dairy',       name: 'Dairy & Eggs',         x: -20, z:  10, color: 0xfbbf24, icon: '🥛' },
  { id: 'grains',      name: 'Grains & Pulses',      x: -20, z:  30, color: 0xa16207, icon: '🌾' },
  { id: 'snacks',      name: 'Snacks & Packaged',    x:   0, z: -30, color: 0xec4899, icon: '🍿' },
  { id: 'beverages',   name: 'Beverages',            x:   0, z: -10, color: 0x3b82f6, icon: '🥤' },
  { id: 'household',   name: 'Household',            x:   0, z:  10, color: 0x8b5cf6, icon: '🏠' },
  { id: 'organic',     name: 'Organic & Farm-Fresh', x:   0, z:  30, color: 0x10b981, icon: '🌿' },
  { id: 'offers',      name: 'Special Offers',       x:  20, z: -20, color: 0xef4444, icon: '🏷️' },
  { id: 'checkout',    name: 'Checkout',             x:  20, z:  20, color: 0x6b7280, icon: '🛒' },
];

// Product placement relative to section
export const SECTION_PRODUCT_SLOTS = [-2.5, 2.5].flatMap((rackOffset) =>
  [0.04, 1.37, 2.70].flatMap((shelfY) =>
    [-1.82, -1.09, -0.36, 0.36, 1.09, 1.82].map((columnOffset, columnIndex) => ({
      dx: rackOffset + columnOffset,
      dz: 0.5,
      shelfY,
      displayIndex: (rackOffset > 0 ? 18 : 0) + Math.round((shelfY - 0.04) / 1.33) * 6 + columnIndex,
    }))
  )
);

// ─── TEXTURE CANVAS HELPERS ───────────────────────────────────────
function makeCanvasTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  return new THREE.CanvasTexture(canvas);
}

function floorTexture() {
  return makeCanvasTexture(512, 512, (ctx, w, h) => {
    // Warm white tile base
    ctx.fillStyle = '#f4f0e8';
    ctx.fillRect(0, 0, w, h);
    // Tile grid
    ctx.strokeStyle = '#d8d0c0';
    ctx.lineWidth = 2;
    const tile = 64;
    for (let x = 0; x <= w; x += tile) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // Slight shadow on tile corners
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let x = 0; x < w; x += tile) {
      for (let y = 0; y < h; y += tile) {
        ctx.fillRect(x, y, 4, 4);
      }
    }
  });
}

function wallTexture() {
  return makeCanvasTexture(512, 512, (ctx, w, h) => {
    // Light cream wall
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, w, h);
    // Subtle brick lines
    ctx.strokeStyle = '#e4e0d8';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 8; row++) {
      const y = row * 64;
      const offset = (row % 2) * 32;
      for (let col = -1; col < 9; col++) {
        const x = col * 64 + offset;
        ctx.strokeRect(x + 3, y + 3, 58, 58);
      }
    }
  });
}

function shelfTexture() {
  return makeCanvasTexture(256, 64, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#d4a96a');
    grad.addColorStop(0.5, '#c49a5a');
    grad.addColorStop(1, '#b8864a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#a07040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);
    // Wood grain
    ctx.strokeStyle = 'rgba(100,60,20,0.15)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 12);
      ctx.lineTo(w, i * 12 + 4);
      ctx.stroke();
    }
  });
}

function ceilingTexture() {
  return makeCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f8f8f6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e8e8e6';
    ctx.lineWidth = 1;
    const tile = 128;
    for (let x = 0; x <= w; x += tile) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  });
}

// ─── GEOMETRY BUILDERS ────────────────────────────────────────────

export function buildFloor(scene) {
  const geo = new THREE.PlaneGeometry(STORE.width, STORE.depth, 1, 1);
  const tex = floorTexture();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 10);
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, STORE.floorY, 0);
  mesh.receiveShadow = true;
  mesh.name = 'floor';
  scene.add(mesh);
  return mesh;
}

export function buildWalls(scene) {
  const tex = wallTexture();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const wallMat = new THREE.MeshLambertMaterial({ map: tex });

  // Back wall
  const back = new THREE.Mesh(new THREE.PlaneGeometry(STORE.width, STORE.wallHeight), wallMat);
  back.position.set(0, STORE.wallHeight / 2, -STORE.depth / 2);
  back.name = 'wall_back';
  scene.add(back);

  // Front wall with entrance gap
  const frontL = new THREE.Mesh(new THREE.PlaneGeometry((STORE.width - 8) / 2, STORE.wallHeight), wallMat);
  frontL.position.set(-(STORE.width / 4 + 2), STORE.wallHeight / 2, STORE.depth / 2);
  frontL.rotation.y = Math.PI;
  scene.add(frontL);

  const frontR = new THREE.Mesh(new THREE.PlaneGeometry((STORE.width - 8) / 2, STORE.wallHeight), wallMat);
  frontR.position.set((STORE.width / 4 + 2), STORE.wallHeight / 2, STORE.depth / 2);
  frontR.rotation.y = Math.PI;
  scene.add(frontR);

  // Left wall
  const left = new THREE.Mesh(new THREE.PlaneGeometry(STORE.depth, STORE.wallHeight), wallMat);
  left.position.set(-STORE.width / 2, STORE.wallHeight / 2, 0);
  left.rotation.y = Math.PI / 2;
  scene.add(left);

  // Right wall
  const right = left.clone();
  right.position.set(STORE.width / 2, STORE.wallHeight / 2, 0);
  right.rotation.y = -Math.PI / 2;
  scene.add(right);
}

export function buildCeiling(scene) {
  const geo = new THREE.PlaneGeometry(STORE.width, STORE.depth);
  const tex = ceilingTexture();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 8);
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(0, STORE.ceilingY, 0);
  scene.add(mesh);
}

export function buildLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xfffde0, 0.6);
  dir.position.set(5, 15, 5);
  dir.castShadow = false;
  scene.add(dir);

  // Ceiling strip lights
  const positions = [
    [-18, 6.5, -30], [-18, 6.5, -10], [-18, 6.5, 10], [-18, 6.5, 30],
    [0,   6.5, -30], [0,   6.5, -10], [0,   6.5, 10], [0,   6.5, 30],
    [18,  6.5, -15], [18,  6.5, 15],
  ];
  positions.forEach(([x, y, z]) => {
    const pt = new THREE.PointLight(0xfff8e7, 0.45, 28, 2);
    pt.position.set(x, y, z);
    scene.add(pt);
  });
}

// ─── SHELF BUILDER ────────────────────────────────────────────────
function buildShelfUnit(scene, x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;

  const shelfW = 4.5, shelfD = 0.9, frameThick = 0.08;
  const height = 4;
  const levels = 3;
  const shelfTex = shelfTexture();

  // Back panel (darker wood)
  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(shelfW + frameThick * 2, height, frameThick),
    new THREE.MeshLambertMaterial({ color: 0x7a5215 })
  );
  backPanel.position.set(0, height / 2, -shelfD / 2);
  group.add(backPanel);

  // Vertical sides
  for (const sx of [-shelfW / 2 - frameThick / 2, shelfW / 2 + frameThick / 2]) {
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(frameThick, height, shelfD + frameThick),
      new THREE.MeshLambertMaterial({ color: 0x8B6914 })
    );
    side.position.set(sx, height / 2, 0);
    group.add(side);
  }

  // Horizontal shelves with texture
  const shelvesMat = new THREE.MeshLambertMaterial({ map: shelfTex });
  const shelfGeo = new THREE.BoxGeometry(shelfW, frameThick * 2, shelfD);
  for (let i = 0; i <= levels; i++) {
    const sy = i * (height / levels);
    const shelf = new THREE.Mesh(shelfGeo, shelvesMat);
    shelf.position.set(0, sy, 0);
    group.add(shelf);
  }

  group.name = 'shelf_unit';
  group.userData.isSolid = true;
  scene.add(group);
  return group;
}

// ─── SIGNBOARD BUILDER ────────────────────────────────────────────
const SECTION_PHOTOS = {
  vegetables: 'photo-1540420773420-3366772f4999',
  fruits: 'photo-1610832958506-aa56368176cf',
  dairy: 'photo-1550583724-b2692b85b150',
  grains: 'photo-1586201375761-83865001e31c',
  snacks: 'photo-1621939514649-280e2aa1f7b5',
  beverages: 'photo-1544145945-f90425340c7e',
  household: 'photo-1585421514284-efb74c2b69ba',
  organic: 'photo-1471193945509-9ad0617afabf',
  offers: 'photo-1542838132-92c53300491e',
  checkout: 'photo-1556742049-0cfed4f6a45d',
};

const SECTION_PRODUCT_IMAGES = {
  vegetables: ['photo-1592924357228-91a4daadcfea', 'photo-1618512496248-a07fe83aa8cf', 'photo-1518977676601-b53f82aba655', 'photo-1576045057995-568f588f82fb'],
  fruits: ['photo-1553279768-865429fa0078', 'photo-1571771894821-ce9b6c11b08e', 'photo-1619566636858-adf3ef46400b', 'photo-1610832958506-aa56368176cf'],
  dairy: ['photo-1528750997573-59b89d66f4f7', 'photo-1550583724-b2692b85b150'],
  grains: ['photo-1586201375761-83865001e31c', 'photo-1596040033229-a9821ebd058d', 'photo-1615485290382-441e4d049cb5'],
  snacks: ['photo-1621939514649-280e2aa1f7b5', 'photo-1558961363-fa8fdf82db35', 'photo-1515543237350-b3eea1ec8082'],
  beverages: ['photo-1544145945-f90425340c7e', 'photo-1513558161293-cdaf765edfd7'],
  household: ['photo-1585421514284-efb74c2b69ba', 'photo-1583947215259-38e31be8751f'],
  organic: ['photo-1471193945509-9ad0617afabf', 'photo-1542838132-92c53300491e', 'photo-1576045057995-568f588f82fb'],
  offers: ['photo-1542838132-92c53300491e', 'photo-1566385101042-1a0aa0c1268c'],
};
const GUARANTEED_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=420&h=420&fit=crop&auto=format&q=80';

function buildSignboard(scene, section) {
  const { name, x, z, color, icon } = section;

  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, `rgba(${Math.max(r-30,0)},${Math.max(g-30,0)},${Math.max(b-30,0)},0.95)`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},0.95)`);
  grad.addColorStop(1, `rgba(${Math.max(r-30,0)},${Math.max(g-30,0)},${Math.max(b-30,0)},0.95)`);
  ctx.fillStyle = grad;
  ctx.roundRect(4, 4, 504, 120, 20);
  ctx.fill();

  // White border
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.roundRect(4, 4, 504, 120, 20);
  ctx.stroke();

  // Keep the icon as an immediate fallback; replace it with a category photo
  // after it loads so the board never flashes blank or blocks scene setup.
  ctx.font = '52px serif';
  ctx.textAlign = 'left';
  ctx.fillText(icon, 18, 78);

  // Name
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText(name, 310, 78);

  const tex = new THREE.CanvasTexture(canvas);
  const photoId = SECTION_PHOTOS[section.id];
  if (photoId) {
    const photo = new Image();
    photo.crossOrigin = 'anonymous';
    photo.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(14, 14, 92, 100, 14);
      ctx.clip();
      const scale = Math.max(92 / photo.naturalWidth, 100 / photo.naturalHeight);
      const width = photo.naturalWidth * scale;
      const height = photo.naturalHeight * scale;
      ctx.drawImage(photo, 14 + (92 - width) / 2, 14 + (100 - height) / 2, width, height);
      ctx.restore();
      // Repaint the border over the image and refresh the existing texture.
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3;
      ctx.roundRect(14, 14, 92, 100, 14);
      ctx.stroke();
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.fillText(name, 310, 78);
      tex.needsUpdate = true;
    };
    photo.onerror = () => {}; // Leave the emoji fallback intact on network errors.
    photo.src = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=240&h=260&q=75`;
  }
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.3),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  sign.position.set(x, 5.6, z);
  sign.name = `sign_${section.id}`;
  scene.add(sign);
}

// ─── PRODUCT BOX with REAL IMAGE ─────────────────────────────────
const productImageSources = new Map();
const imageTextureCache = new Map();
const pendingImageTextures = new Map();

function loadImageSource(url) {
  if (!url) return Promise.resolve(null);
  if (!productImageSources.has(url)) {
    productImageSources.set(url, new Promise(resolve => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = url;
    }));
  }
  return productImageSources.get(url);
}

function buildWallPhotoPanels(scene) {
  const wallDisplays = [
    { side: -1, z: -24, section: SECTIONS[0], caption: 'FRESH FROM LOCAL FARMS' },
    { side: -1, z: 0, section: SECTIONS[1], caption: 'SEASONAL FRUIT PICKS' },
    { side: -1, z: 24, section: SECTIONS[7], caption: 'GROWN WITH CARE' },
    { side: 1, z: -24, section: SECTIONS[2], caption: 'QUALITY YOU CAN TRUST' },
    { side: 1, z: 0, section: SECTIONS[3], caption: 'PANTRY ESSENTIALS' },
    { side: 1, z: 24, section: SECTIONS[5], caption: 'A LITTLE REFRESHMENT' },
  ];

  wallDisplays.forEach(({ side, z, section, caption }) => {
    const x = side * (STORE.width / 2 - 0.18);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.8, 8.6),
      new THREE.MeshStandardMaterial({ color: 0x704a24, roughness: 0.68 })
    );
    frame.position.set(x, 4.25, z);
    frame.name = `wall_frame_${section.id}`;
    scene.add(frame);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#244b2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(caption, 400, 258);
    const texture = new THREE.CanvasTexture(canvas);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(8.25, 2.55),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    panel.position.set(x - side * 0.105, 4.25, z);
    panel.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    panel.name = `wall_photo_${section.id}`;
    scene.add(panel);

    const photoId = SECTION_PHOTOS[section.id];
    void loadImageSource(`https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1000&h=420&q=85`).then(image => {
      if (!image) return;
      ctx.fillStyle = '#244b2b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const photoHeight = 220;
      const scale = Math.max(canvas.width / image.naturalWidth, photoHeight / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, photoHeight);
      ctx.clip();
      ctx.drawImage(image, (canvas.width - width) / 2, (photoHeight - height) / 2, width, height);
      ctx.restore();
      ctx.fillStyle = '#244b2b';
      ctx.fillRect(0, photoHeight, canvas.width, canvas.height - photoHeight);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(caption, 400, 258);
      texture.needsUpdate = true;
    });
  });
}

function loadProductTexture(imageUrl, sectionColor, label, icon, callback, fallbackUrl = null) {
  const cacheKey = `${imageUrl || ''}|${fallbackUrl || ''}|${sectionColor}|${label}|${icon}`;
  if (imageTextureCache.has(cacheKey)) {
    callback(imageTextureCache.get(cacheKey));
    return;
  }
  if (pendingImageTextures.has(cacheKey)) {
    pendingImageTextures.get(cacheKey).then(callback);
    return;
  }

  const task = (async () => {
    let image = await loadImageSource(imageUrl);
    if (!image && fallbackUrl && fallbackUrl !== imageUrl) image = await loadImageSource(fallbackUrl);
    if (!image && fallbackUrl !== GUARANTEED_PRODUCT_IMAGE && imageUrl !== GUARANTEED_PRODUCT_IMAGE) {
      image = await loadImageSource(GUARANTEED_PRODUCT_IMAGE);
    }
    if (!image) return buildProductLabelTexture(sectionColor, label, icon);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const r = (sectionColor >> 16) & 0xff;
    const g = (sectionColor >> 8) & 0xff;
    const b = sectionColor & 0xff;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 256, 256);
    const imageBox = { x: 10, y: 10, width: 236, height: 188 };
    const scale = Math.max(imageBox.width / image.naturalWidth, imageBox.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imageBox.x, imageBox.y, imageBox.width, imageBox.height, 12);
    ctx.clip();
    ctx.drawImage(image, imageBox.x + (imageBox.width - width) / 2, imageBox.y + (imageBox.height - height) / 2, width, height);
    ctx.restore();
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 204, 256, 52);
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 3;
    const shortLabel = label.length > 17 ? `${label.substring(0, 16)}…` : label;
    ctx.fillText(shortLabel, 128, 237);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  })();

  pendingImageTextures.set(cacheKey, task);
  task.then(texture => {
    imageTextureCache.set(cacheKey, texture);
    pendingImageTextures.delete(cacheKey);
    callback(texture);
  });
}

const CATEGORY_ICONS = {
  vegetables: ['🥦', '🥕', '🍅', '🌽', '🥒', '🧅', '🥔', '🫑'],
  fruits:     ['🍎', '🍌', '🥭', '🍇', '🍊', '🍋', '🍑', '🍓'],
  dairy:      ['🥛', '🧈', '🥚', '🧀', '🍶', '🫙', '🧆', '🍯'],
  grains:     ['🌾', '🌽', '🥜', '🫘', '🌰', '🍞', '🥐', '🫙'],
  snacks:     ['🍿', '🍪', '🥐', '🍫', '🍬', '🥨', '🍩', '🍘'],
  beverages:  ['🥤', '🧃', '☕', '🍵', '🧋', '🍶', '🫖', '🍹'],
  household:  ['🧼', '🧴', '🪥', '🧽', '🫧', '🧹', '🪣', '🫙'],
  organic:    ['🌿', '🍃', '🌱', '🌾', '🥬', '🌵', '🫚', '🫛'],
  offers:     ['🏷️', '💎', '⭐', '🎁', '🏅', '✨', '💫', '🎀'],
  checkout:   ['🛒', '💳', '🧾', '💰', '📦', '✅', '🏪', '👋'],
};

function buildProductLabelTexture(sectionColor, label, icon) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const r = (sectionColor >> 16) & 0xff;
  const g = (sectionColor >> 8) & 0xff;
  const b = sectionColor & 0xff;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},1)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},1)`);
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, 256, 256, 16);
  ctx.fill();

  // White card area
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.roundRect(8, 8, 240, 180, 12);
  ctx.fill();

  // Large emoji icon
  ctx.font = '100px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 128, 100);

  // Label bar
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 200, 256, 56);

  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  const shortLabel = label.length > 13 ? label.substring(0, 12) + '…' : label;
  ctx.fillText(shortLabel, 128, 238);

  return new THREE.CanvasTexture(canvas);
}

export function buildProductOnShelf(scene, section, slot, productData = null) {
  const icons = CATEGORY_ICONS[section.id] || ['📦'];
  const icon = icons[(slot.displayIndex || 0) % icons.length];
  const label = productData?.name || 'Add products';

  const sx = section.x + slot.dx;
  const sy = slot.shelfY || 1.2;
  const sz = section.z + slot.dz;
  const display = new THREE.Group();
  display.position.set(sx, sy, sz);
  display.name = `product_${productData?.id || `${section.id}_${slot.displayIndex}`}`;
  display.userData.productData = productData;
  display.userData.sectionId = section.id;
  display.userData.isProduct = Boolean(productData);
  const sectionImages = SECTION_PRODUCT_IMAGES[section.id] || SECTION_PRODUCT_IMAGES.vegetables;
  const fallbackImageUrl = `https://images.unsplash.com/${sectionImages[(slot.displayIndex || 0) % sectionImages.length]}?auto=format&fit=crop&w=420&h=420&q=80`;
  const imageUrl = productData?.primary_image || fallbackImageUrl;

  // A slim frame keeps the photograph upright on the shelf without the old toy-like models.
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.78, 0.14),
    new THREE.MeshStandardMaterial({ color: section.color, roughness: 0.82 })
  );
  frame.position.y = 0.39;
  frame.castShadow = true;
  display.add(frame);

  const fallbackTexture = buildProductLabelTexture(section.color, label, icon);
  const photoSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.68),
    new THREE.MeshBasicMaterial({ map: fallbackTexture, toneMapped: false })
  );
  photoSurface.position.set(0, 0.39, 0.076);
  photoSurface.name = `product_photo_${productData?.id || slot.displayIndex}`;
  display.add(photoSurface);
  scene.add(display);

  loadProductTexture(imageUrl, section.color, label, icon, (texture) => {
    photoSurface.material.map = texture;
    photoSurface.material.needsUpdate = true;
  }, productData?.primary_image ? fallbackImageUrl : null);

  // Add price tag floating above box
  if (productData?.price) {
    const priceCanvas = document.createElement('canvas');
    priceCanvas.width = 128; priceCanvas.height = 48;
    const pCtx = priceCanvas.getContext('2d');
    pCtx.fillStyle = '#ef4444';
    pCtx.roundRect(2, 2, 124, 44, 8);
    pCtx.fill();
    pCtx.font = 'bold 26px Arial';
    pCtx.fillStyle = 'white';
    pCtx.textAlign = 'center';
    pCtx.fillText(`₹${productData.price}`, 64, 33);
    const priceTex = new THREE.CanvasTexture(priceCanvas);
    const priceTag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.15),
      new THREE.MeshBasicMaterial({ map: priceTex, transparent: true })
    );
    priceTag.position.set(sx, sy + 0.52, sz + 0.34);
    priceTag.name = `price_tag_${productData.id}`;
    scene.add(priceTag);
  }

  return display;
}

// ─── CHECKOUT COUNTER + BILLING COMPUTER ─────────────────────────
export function buildCheckoutCounter(scene, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Counter base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(7, 1.1, 2.2),
    new THREE.MeshLambertMaterial({ color: 0x1a5c2a })
  );
  base.position.set(0, 0.55, 0);
  group.add(base);

  // Counter top (white marble)
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(7.1, 0.12, 2.3),
    new THREE.MeshLambertMaterial({ color: 0xf5f5f0 })
  );
  top.position.set(0, 1.12, 0);
  group.add(top);

  // ─── BILLING COMPUTER on counter ────────
  // Monitor base/stand
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 0.4, 8),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  stand.position.set(0, 1.52, -0.3);
  group.add(stand);

  // Monitor neck
  const neck = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.35, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  neck.position.set(0, 1.87, -0.3);
  group.add(neck);

  // Monitor screen bezel
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.1, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x222222 })
  );
  bezel.position.set(0, 2.2, -0.3);
  group.add(bezel);

  // Monitor screen (with billing UI texture)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512; screenCanvas.height = 360;
  const sCtx = screenCanvas.getContext('2d');

  // Screen background - billing UI
  sCtx.fillStyle = '#0f172a';
  sCtx.fillRect(0, 0, 512, 360);

  // Header bar
  sCtx.fillStyle = '#1a5c2a';
  sCtx.fillRect(0, 0, 512, 64);
  sCtx.font = 'bold 28px Arial';
  sCtx.fillStyle = '#ffffff';
  sCtx.textAlign = 'center';
  sCtx.fillText('🏪 VILLAGE MART — BILLING', 256, 42);

  // Receipt lines
  const receiptLines = [
    { label: 'Customer ID:', val: '#VM-2024' },
    { label: 'Date:', val: new Date().toLocaleDateString() },
    { label: '', val: '─────────────────────' },
    { label: 'Subtotal:', val: '₹ 0.00' },
    { label: 'GST (5%):', val: '₹ 0.00' },
    { label: 'Delivery:', val: 'FREE' },
    { label: '', val: '─────────────────────' },
    { label: 'TOTAL:', val: '₹ 0.00' },
  ];
  receiptLines.forEach((line, i) => {
    sCtx.font = i === 7 ? 'bold 22px Arial' : '18px Arial';
    sCtx.fillStyle = i === 7 ? '#4ade80' : (i === 2 || i === 6 ? '#475569' : '#e2e8f0');
    sCtx.textAlign = 'left';
    sCtx.fillText(line.label, 30, 100 + i * 30);
    sCtx.textAlign = 'right';
    sCtx.fillText(line.val, 490, 100 + i * 30);
  });

  // Checkout button
  sCtx.fillStyle = '#16a34a';
  sCtx.roundRect(60, 290, 390, 50, 10);
  sCtx.fill();
  sCtx.font = 'bold 24px Arial';
  sCtx.fillStyle = 'white';
  sCtx.textAlign = 'center';
  sCtx.fillText('✅ CONFIRM & PAY', 256, 323);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.05),
    new THREE.MeshBasicMaterial({ map: screenTex })
  );
  screen.position.set(0, 2.2, -0.25);
  screen.name = 'billing_screen';
  screen.userData.isBillingComputer = true;
  group.add(screen);

  // Keyboard
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.04, 0.3),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  keyboard.position.set(0, 1.14, 0.3);
  group.add(keyboard);

  // Barcode scanner
  const scanner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.25, 8),
    new THREE.MeshLambertMaterial({ color: 0x1a1a2e })
  );
  scanner.position.set(1.5, 1.25, 0);
  scanner.rotation.z = 0.3;
  group.add(scanner);

  // Checkout sign above
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512; signCanvas.height = 96;
  const signCtx = signCanvas.getContext('2d');
  const grad = signCtx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#1a5c2a');
  grad.addColorStop(0.5, '#2e7d32');
  grad.addColorStop(1, '#1a5c2a');
  signCtx.fillStyle = grad;
  signCtx.roundRect(4, 4, 504, 88, 16);
  signCtx.fill();
  signCtx.strokeStyle = 'rgba(255,255,255,0.4)';
  signCtx.lineWidth = 2;
  signCtx.roundRect(4, 4, 504, 88, 16);
  signCtx.stroke();
  signCtx.font = 'bold 38px Arial';
  signCtx.fillStyle = '#ffffff';
  signCtx.textAlign = 'center';
  signCtx.fillText('🛒 CHECKOUT & PAY', 256, 60);

  const signTex = new THREE.CanvasTexture(signCanvas);
  const checkoutSign = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 0.9),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  checkoutSign.position.set(0, 3.5, -0.5);
  checkoutSign.name = 'checkout_sign';
  checkoutSign.userData.isBillingComputer = true;
  group.add(checkoutSign);

  group.name = 'checkout_counter';
  group.userData.isSolid = true;
  group.userData.isCheckout = true;
  scene.add(group);
  return group;
}

// ─── VILLAGE MART BRANDING SIGN ────────────────────────────────────
export function buildBrandingSign(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#1a5c2a');
  grad.addColorStop(0.5, '#2e7d32');
  grad.addColorStop(1, '#1a5c2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  ctx.font = 'bold 76px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.fillText('🏪 VILLAGE MART', 512, 120);

  ctx.font = '34px Arial';
  ctx.fillStyle = '#a5d6a7';
  ctx.shadowBlur = 0;
  ctx.fillText('Fresh from Farm to Your Basket', 512, 178);

  ctx.font = '26px Arial';
  ctx.fillStyle = '#c8e6c9';
  ctx.fillText('✦ Direct from Farmers · No Middlemen · 100% Natural ✦', 512, 228);

  const tex = new THREE.CanvasTexture(canvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  sign.position.set(0, 5.5, -STORE.depth / 2 + 0.2);
  sign.name = 'branding_sign';
  scene.add(sign);
}

// ─── ENTRANCE ARCH ────────────────────────────────────────────────
export function buildEntrance(scene) {
  // Arch pillars
  for (const sx of [-4, 4]) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, STORE.wallHeight, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x1a5c2a })
    );
    pillar.position.set(sx, STORE.wallHeight / 2, STORE.depth / 2);
    scene.add(pillar);
  }

  // Arch top
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.6, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x1a5c2a })
  );
  top.position.set(0, STORE.wallHeight - 0.3, STORE.depth / 2);
  scene.add(top);

  // Welcome sign
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#2e7d32');
  grad.addColorStop(1, '#1a5c2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);
  ctx.font = 'bold 38px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText('WELCOME TO VILLAGE MART', 256, 56);
  ctx.font = '26px Arial';
  ctx.fillStyle = '#a5d6a7';
  ctx.shadowBlur = 0;
  ctx.fillText('🌿 Fresh · Farm · Natural 🌿', 256, 100);

  const tex = new THREE.CanvasTexture(canvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  sign.position.set(0, STORE.wallHeight - 1.5, STORE.depth / 2 - 0.1);
  sign.rotation.y = Math.PI;
  scene.add(sign);
}

// ─── FULL STORE LAYOUT ────────────────────────────────────────────
export function buildStoreLayout(scene) {
  const solidObjects = [];

  buildFloor(scene);
  buildWalls(scene);
  buildCeiling(scene);
  buildLights(scene);
  buildBrandingSign(scene);
  buildEntrance(scene);
  buildWallPhotoPanels(scene);

  // Build sections with shelves and signboards
  SECTIONS.forEach((section) => {
    buildSignboard(scene, section);

    if (section.id === 'checkout') {
      const counter = buildCheckoutCounter(scene, section.x, section.z);
      solidObjects.push(counter);
      return;
    }

    // 2 shelf units per section
    const offsets = [{ dx: -2.5, dz: 0 }, { dx: 2.5, dz: 0 }];
    offsets.forEach((off) => {
      const shelf = buildShelfUnit(scene, section.x + off.dx, section.z + off.dz, 0);
      solidObjects.push(shelf);
    });
  });

  // Decorative column pillars
  const pillarPositions = [
    [-12, -25], [-12, 0], [-12, 25],
    [8, -25], [8, 0], [8, 25],
  ];
  pillarPositions.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, STORE.wallHeight, 10),
      new THREE.MeshLambertMaterial({ color: 0xccc8be })
    );
    pillar.position.set(px, STORE.wallHeight / 2, pz);
    pillar.userData.isSolid = true;
    scene.add(pillar);
    solidObjects.push(pillar);
  });

  return solidObjects;
}
