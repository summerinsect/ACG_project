import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'
import { PressurePlate } from './PressurePlate.js'

class Platform{
    constructor(levelManager, index) {
        this.mesh = new THREE.Mesh(MeshAttributes.platformGeometry, MeshAttributes.platformMaterial);
        this.mesh.position.set(levelManager.platformInfo[index].x, 0, levelManager.platformInfo[index].z);
        levelManager.levelRoot.add(this.mesh);
    }

    valid(pos) {
        const plat = this.mesh.position;
        const size = Layout.platformSize / 2;
        const pr = Layout.playerRadius;
        return (
            pos.x >= plat.x - size + pr && pos.x <= plat.x + size - pr &&
            pos.z >= plat.z - size + pr && pos.z <= plat.z + size - pr
        );
    }

    // loadTexture? 也许以后会有。
}

export { Platform };