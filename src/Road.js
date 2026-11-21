import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'

class Road{

    constructor(levelManager, index, offset) {
        // offset = 0: c = 1 的路；offset = -1 / 1：c = 2 的路的第一条 / 第二条
        const info = levelManager.roadInfo[index];
        const pu = levelManager.platformInfo[info.u];
        const pv = levelManager.platformInfo[info.v];
        if (pu.x == pv.x) {
            this.direction = 'z';
            this.mesh = new THREE.Mesh(MeshAttributes.roadGeometryZ, MeshAttributes.roadMaterial);
            this.mesh.position.set(pu.x + offset * Layout.roadOffset, 0, (pu.z + pv.z) / 2);
        }
        else if (pu.z == pv.z) {
            this.direction = 'x';
            this.mesh = new THREE.Mesh(MeshAttributes.roadGeometryX, MeshAttributes.roadMaterial);
            this.mesh.position.set((pu.x + pv.x) / 2, 0, pu.z + offset * Layout.roadOffset);
        }
        else {
            console.error(`Road ${index} is not aligned with x or z axis.`);
        }
        levelManager.levelRoot.add(this.mesh);
    }

    // loadTexture? 也许以后会有。
}

export { Road };