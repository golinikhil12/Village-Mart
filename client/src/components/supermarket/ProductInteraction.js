import * as THREE from 'three';
import { SECTIONS } from './SupermarketScene.js';

// Section navigation places the shopper about 5.5 units from the shelf front.
// Keep every shelf card within reach after a direct jump to an aisle.
const INTERACTION_DISTANCE = 7;
const HIGHLIGHT_COLOR = new THREE.Color(0xffee55);

export class ProductInteraction {
  constructor(camera, scene, products3D) {
    this.camera = camera;
    this.scene = scene;
    this.products3D = products3D; // array of {mesh, product, section}

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = INTERACTION_DISTANCE;

    this.hoveredProduct = null;
    this.selectedProduct = null;
    this.nearbyProducts = [];
    this.playerPosition = new THREE.Vector3();

    // Emissive highlight tracking
    this._originalEmissives = new Map();
  }

  setPlayerPosition(pos) {
    this.playerPosition.copy(pos);
  }

  update() {
    // Find products within interaction distance
    const nearby = this.products3D.filter(item => {
      const dist = this.playerPosition.distanceTo(item.mesh.position);
      return dist < INTERACTION_DISTANCE;
    });

    // Clear old highlights
    for (const item of this.products3D) {
      item.mesh.traverse(child => {
        const mat = child.material;
        if (mat && mat.emissive) mat.emissive.setHex(0x000000);
      });
    }

    // Sort by distance
    nearby.sort((a, b) => {
      return this.playerPosition.distanceTo(a.mesh.position) -
             this.playerPosition.distanceTo(b.mesh.position);
    });

    this.nearbyProducts = nearby;

    // Highlight closest
    if (nearby.length > 0) {
      const closest = nearby[0];
      closest.mesh.traverse(child => {
        const mat = child.material;
        if (mat && mat.emissive) mat.emissive.setHex(0x334422);
      });
      this.hoveredProduct = closest;
    } else {
      this.hoveredProduct = null;
    }
  }

  getHoveredProduct() {
    return this.hoveredProduct;
  }

  getNearbyProducts() {
    return this.nearbyProducts;
  }

  // Raycast on click/E press
  pickProduct(mouseX, mouseY) {
    const ndc = new THREE.Vector2(mouseX, mouseY);
    this.raycaster.setFromCamera(ndc, this.camera);
    const meshes = this.products3D.map(item => item.mesh);
    const hits = this.raycaster.intersectObjects(meshes, true);
    if (hits.length > 0) {
      const hitMesh = hits[0].object;
      const found = this.products3D.find(item => {
        let current = hitMesh;
        while (current) {
          if (current === item.mesh) return true;
          current = current.parent;
        }
        return false;
      });
      return found || null;
    }
    return this.hoveredProduct;
  }

  dispose() {
    for (const item of this.products3D) {
      item.mesh.traverse(child => {
        const mat = child.material;
        if (mat && mat.emissive) mat.emissive.setHex(0x000000);
      });
    }
  }
}

// Helper: get section for a product based on its category
export function getSectionForProduct(product) {
  const cat = (product.category_slug || product.category_name || '').toLowerCase();
  if (cat.includes('vegetable') || cat.includes('leafy')) return SECTIONS.find(s => s.id === 'vegetables');
  if (cat.includes('fruit')) return SECTIONS.find(s => s.id === 'fruits');
  if (cat.includes('dairy') || cat.includes('milk')) return SECTIONS.find(s => s.id === 'dairy');
  if (cat.includes('grain') || cat.includes('rice') || cat.includes('pulse') || cat.includes('spice')) return SECTIONS.find(s => s.id === 'grains');
  if (cat.includes('snack') || cat.includes('packaged')) return SECTIONS.find(s => s.id === 'snacks');
  if (cat.includes('beverage') || cat.includes('drink') || cat.includes('juice')) return SECTIONS.find(s => s.id === 'beverages');
  if (cat.includes('household') || cat.includes('clean')) return SECTIONS.find(s => s.id === 'household');
  if (cat.includes('organic') || cat.includes('farm')) return SECTIONS.find(s => s.id === 'organic');
  // Default: vegetables
  return SECTIONS.find(s => s.id === 'vegetables');
}
