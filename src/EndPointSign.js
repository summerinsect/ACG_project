import * as THREE from 'three';
import { Layout, EndPointSignMesh } from './constant.js';

class EndPointSign {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.loadModel();
        this.root.position.set(
            this.levelManager.platformInfo[this.levelManager.endPoint.i].x + this.levelManager.endPoint.x,
            Layout.platformThickness / 2,
            this.levelManager.platformInfo[this.levelManager.endPoint.i].z + this.levelManager.endPoint.z
        );
        this.root.rotation.y = this.levelManager.endPoint.facing;
    }

    loadModel() {
        this.root = new THREE.Group();
        const rod = new THREE.Mesh(EndPointSignMesh.rodGeometry, EndPointSignMesh.material);
        const plate = new THREE.Mesh(EndPointSignMesh.plateGeometry, EndPointSignMesh.material);
        rod.position.set(0, 0.15, 0);
        plate.position.set(0, 0.45, 0);
        this.root.add(rod);
        this.root.add(plate);
        this.levelManager.levelRoot.add(this.root);
    }
}

export { EndPointSign };