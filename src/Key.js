import * as THREE from 'three';
import { Layout, MeshAttributes, KeyMesh } from './constant.js'

const wrapAngle = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));

class Key{
    constructor(levelManager, index) {
        this.levelManager = levelManager;
        this.game = this.levelManager.game;
        this.loadModel();
        this.index = index;
        this.setToInitialPosition();
        this.rotationSpeed = Math.PI * 0.4; // 5 秒转一圈
        this.prevRotation = 0;
        this.currentRotation = 0;
        this.assignedAgent = -1;
        this.taken = false;
    }

    loadModel() {
        this.root = new THREE.Group();
        const mesh1 = new THREE.Mesh(KeyMesh.geometry1, KeyMesh.material);
        const mesh2 = new THREE.Mesh(KeyMesh.geometry2, KeyMesh.material);
        const mesh3 = new THREE.Mesh(KeyMesh.geometry3, KeyMesh.material);
        const mesh4 = new THREE.Mesh(KeyMesh.geometry3, KeyMesh.material);
        mesh1.position.set(0, 0.5, 0);
        mesh1.rotation.set(0, 0, Math.PI / 2);
        mesh2.position.set(0, 0.2, 0);
        mesh3.position.set(0, 0.2, 0.05);
        mesh4.position.set(0, 0.1, 0.05);
        this.root.add(mesh1, mesh2, mesh3, mesh4);
        this.levelManager.levelRoot.add(this.root);
    }

    setToInitialPosition() {
        const info = this.levelManager.keyInfo[this.index];
        this.root.position.set(
            this.levelManager.platformInfo[info.i].x + info.x,
            Layout.platformThickness / 2 + Layout.keyHeight,
            this.levelManager.platformInfo[info.i].z + info.z
        );
        this.root.rotation.y = 0;
    }

    prepareRound() {
        this.setToInitialPosition();
        this.assignedAgent = -1;
        this.taken = false;
        this.root.visible = true;
    }

    tick() {
        this.prevRotation = this.currentRotation;
        this.currentRotation += this.rotationSpeed * this.game.TICK;
    }

    update(alpha) {
        const rotation = this.prevRotation + wrapAngle(this.currentRotation - this.prevRotation) * alpha;
        this.root.rotation.y = rotation;
    }

    pickUpByPlayer() {
        console.log('try to pick up key');
        if (this.taken == true || this.assignedAgent != -1) return;
        const player = this.levelManager.player;
        const dist = Math.hypot(this.root.position.x - player.state.x, this.root.position.z - player.state.z); // 静态物体可以直接用世界坐标
        if (dist > Layout.keyPickDist) return;
        console.log(`Player successfully picked up key`);
        this.levelManager.player.keyCount++;
        this.taken = true;
        this.root.visible = false;
        this.levelManager.statesThisRound.pickUpKey.push({
            tick: this.levelManager.tickCount,
            index: this.index,
        });
    }

    pickUpByAgent() {
        this.root.visible = false;
    }
}

export { Key };