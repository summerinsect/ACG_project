import * as THREE from 'three';
import { Layout, MeshAttributes, PlayerMesh } from './constant.js'

const wrapAngle = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));

class Player {

    constructor(levelManager) {
        this.levelManager = levelManager;
        this.game = this.levelManager.game;
        this.load();
        this.velocity = 3;
        // 区分逻辑状态和渲染状态
        this.state = { x: 0, z: 0, facing: 0 }; 
        this.prevState = { x: 0, z: 0, facing: 0 };
        this.setToStartPoint();
        this.keyCount = 0;
    }

    load() {
        // 先用一个简单的模型代替
        this.root = new THREE.Group();
        const head = new THREE.Mesh(PlayerMesh.headGeometry, PlayerMesh.headMaterial);
        const body = new THREE.Mesh(PlayerMesh.bodyGeometry, PlayerMesh.bodyMaterial);
        const nose = new THREE.Mesh(PlayerMesh.noseGeometry, PlayerMesh.noseMaterial);
        this.root.position.y = Layout.platformThickness / 2;
        head.position.set(0, 0.67, 0);
        body.position.set(0, 0.3, 0);
        nose.position.set(0, 0.67, 0.17);
        this.root.add(head, body, nose);
        this.levelManager.levelRoot.add(this.root);
    }

    get target() {
        let target = new THREE.Vector3(this.root.position.x, 2, this.root.position.z);
        return target;
    }

    move(newX, newZ) {
        const pos1 = new THREE.Vector3(newX, 0, newZ);
        const pos2 = new THREE.Vector3(newX, 0, this.state.z);
        const pos3 = new THREE.Vector3(this.state.x, 0, newZ);
        if (this.levelManager.valid(pos1)) {
            this.state.x = newX;
            this.state.z = newZ;
        }
        else if (this.levelManager.valid(pos2)) {
            this.state.x = newX;
        }
        else if (this.levelManager.valid(pos3)) {
            this.state.z = newZ;
        }
    }

    setToStartPoint() {
        const startPoint = this.levelManager.startPoint[this.levelManager.round];
        this.state.x = startPoint.x + this.levelManager.platformInfo[startPoint.i].x;
        this.state.z = startPoint.z + this.levelManager.platformInfo[startPoint.i].z;
        this.state.facing = startPoint.facing;
        this.prevState = { ...this.state };
        this.update(0);
    }

    prepareRound() {
        this.setToStartPoint();
        this.keyCount = 0;
    }

    tick() {
        this.prevState = { ...this.state };
        const f = (this.game.inputHandler.isHeld('KeyW') ? 1 : 0) - (this.game.inputHandler.isHeld('KeyS') ? 1 : 0);
        const r = (this.game.inputHandler.isHeld('KeyD') ? 1 : 0) - (this.game.inputHandler.isHeld('KeyA') ? 1 : 0);

        const cameraYaw = this.game.followCamera.yaw;
        const fx = -Math.sin(cameraYaw), fz = -Math.cos(cameraYaw);
        const rx = Math.cos(cameraYaw), rz = -Math.sin(cameraYaw);
        let mx = fx * f + rx * r, mz = fz * f + rz * r;
        if (f != 0 || r != 0) {
            const len = Math.hypot(mx, mz);
            mx /= len; mz /= len;
        }

        const newX = this.state.x + mx * this.velocity * this.game.TICK;
        const newZ = this.state.z + mz * this.velocity * this.game.TICK;
        this.move(newX, newZ);

        this.levelManager.doorPlayerCollision(this);

        if (f != 0 || r != 0) {
            const targetFacing = Math.atan2(mx, mz);
            const diff = wrapAngle(targetFacing - this.state.facing);
            this.state.facing = wrapAngle(this.state.facing + Math.sign(diff) * Math.min(Math.abs(diff), 0.1));
        }

        this.levelManager.statesThisRound.playerStates.push({ ...this.state });
    }

    update(alpha) {
        const x = this.prevState.x * (1 - alpha) + this.state.x * alpha;
        const z = this.prevState.z * (1 - alpha) + this.state.z * alpha;
        const facing = this.prevState.facing + wrapAngle(this.state.facing - this.prevState.facing) * alpha;
        this.root.position.x = x;
        this.root.position.z = z;
        this.root.rotation.y = wrapAngle(facing);
    }
}

export { Player };