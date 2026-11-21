import * as THREE from 'three';
import { MeshAttributes } from './constant.js'
import { PressurePlate } from './PressurePlate.js'

class Platform{
    constructor(levelManager, index) {
        this.mesh = new THREE.Mesh(MeshAttributes.platformGeometry, MeshAttributes.platformMaterial);
        this.mesh.position.set(levelManager.platformInfo[index].x, 0, levelManager.platformInfo[index].z);
        levelManager.levelRoot.add(this.mesh);
    }

    // loadTexture? 也许以后会有。
}

export { Platform };