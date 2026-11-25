import * as THREE from 'three';
import { Layout } from './constant.js';

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
        const rodGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const plateGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        this.rod = new THREE.Mesh(rodGeometry, material);
        this.plate = new THREE.Mesh(plateGeometry, material);
        this.rod.position.set(0, 0.15, 0);
        this.plate.position.set(0, 0.45, 0);
        this.root.add(this.rod);
        this.root.add(this.plate);
        this.levelManager.levelRoot.add(this.root);
    }
}

export { EndPointSign };