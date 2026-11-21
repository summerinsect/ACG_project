import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'

class Key{
    constructor(levelManager, index) {
        const info = levelManager.keyInfo[index];
        const platform = levelManager.platforms[info.i];
        this.mesh = new THREE.Mesh(MeshAttributes.keyGeometry, MeshAttributes.keyMaterial);
        this.mesh.position.set(platform.mesh.position.x, Layout.platformThickness / 2 + Layout.keyHeight, platform.mesh.position.z);
        levelManager.levelRoot.add(this.mesh);
    }
}

export { Key };