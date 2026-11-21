import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'

class PressurePlate{
    constructor(levelManager, index) {
        const info = levelManager.pressurePlateInfo[index];
        const platform = levelManager.platforms[info.i];
        this.mesh = new THREE.Mesh(MeshAttributes.pressurePlateGeometry, MeshAttributes.pressurePlateMaterial);
        this.mesh.position.set(platform.mesh.position.x + info.x, Layout.platformThickness / 2 + Layout.pressurePlateThickness / 2, platform.mesh.position.z + info.z);
        levelManager.levelRoot.add(this.mesh);
    }
}

export { PressurePlate };