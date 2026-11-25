import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'

class PressurePlate{
    constructor(levelManager, index) {
        this.levelManager = levelManager;
        this.player = levelManager.player;
        this.index = index;
        const info = levelManager.pressurePlateInfo[index];
        const platform = levelManager.platforms[info.i];
        this.mesh = new THREE.Mesh(MeshAttributes.pressurePlateGeometry, MeshAttributes.pressurePlateMaterial);
        this.mesh.position.set(platform.mesh.position.x + info.x, Layout.platformThickness / 2 + Layout.pressurePlateThickness / 2, platform.mesh.position.z + info.z);
        levelManager.levelRoot.add(this.mesh);
        this.worldPos = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
        this.pressing = false;
    }

    prepareRound() {
        this.pressing = false;
        // 后续可能会做一些动画？
    }

    tick() {
        const worldPos = this.worldPos;
        function checkPressure(playerPos) {
            const dist = Math.hypot(playerPos.x - worldPos.x, playerPos.z - worldPos.z);
            return dist <= Layout.pressurePlateRadius;
        }
        let pressed = false;
        pressed |= checkPressure(new THREE.Vector3(this.player.state.x, 0, this.player.state.z));
        this.levelManager.agents.forEach(agent => {
            if (agent.valid) {
                pressed |= checkPressure(new THREE.Vector3(agent.state.x, 0, agent.state.z));
            }
        });
        if (pressed == true && this.pressing == false) {
            this.pressing = true;
            this.levelManager.doorOpen(this.index, true);
        }
        if (pressed == false && this.pressing == true) {
            this.pressing = false;
            this.levelManager.doorOpen(this.index, false);
        }
    }

    update() {

    }
}

export { PressurePlate };