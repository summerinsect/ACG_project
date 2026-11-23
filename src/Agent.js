import * as THREE from 'three';
import { Layout } from './constant.js'

const wrapAngle = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));

class Agent {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.game = this.levelManager.game;
        this.load();
        this.tickCount = 0; // agent 被创建以来的时间
        this.states = [];
        this.state = { x: 0, z: 0, facing: 0 };
        this.prevState = { x: 0, z: 0, facing: 0 };
        this.valid = false;
    }

    load() {
        // 先用一个简单的模型代替
        this.root = new THREE.Group();
        const headGeometry = new THREE.SphereGeometry(0.12, 32, 32);
        const bodyGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const noseGeometry = new THREE.CapsuleGeometry(0.02, 0.06, 10, 20, 1);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        this.root.position.y = Layout.platformThickness / 2;
        head.position.set(0, 0.48, 0);
        body.position.set(0, 0.2, 0);
        nose.position.set(0, 0.5, 0.1);
        nose.rotation.set(Math.PI / 2, 0, 0);
        this.root.add(head);
        this.root.add(body);
        this.root.add(nose);
        this.levelManager.levelRoot.add(this.root);
        this.root.visible = false;
    }

    setToStartPoint() {
        const startPoint = this.levelManager.startPoint;
        this.state.x = startPoint.x + this.levelManager.platformInfo[startPoint.i].x;
        this.state.z = startPoint.z + this.levelManager.platformInfo[startPoint.i].z;
        this.state.facing = startPoint.facing;
        this.prevState = { ...this.state };
        this.update(0);
    }

    tick() {
        if (!this.valid) return;
        this.prevState = { ... this.state };
        if (this.tickCount < this.states.length - 1) {
            this.state = this.states[this.tickCount];
            ++this.tickCount;
        }
    }

    update(alpha) {
        if (!this.valid) return;
        const x = this.prevState.x * (1 - alpha) + this.state.x * alpha;
        const z = this.prevState.z * (1 - alpha) + this.state.z * alpha;
        const facing = this.prevState.facing + wrapAngle(this.state.facing - this.prevState.facing) * alpha;
        this.root.position.x = x;
        this.root.position.z = z;
        this.root.rotation.y = wrapAngle(facing);
    }

    setStates(recordedStates) {
        this.states = recordedStates;
        console.log(`Agent has ${this.states.length} states`);
    }

    startRound() {
        this.tickCount = 0;
        this.valid = true;
        this.root.visible = true;
    }

    endRound() {
        this.valid = false;
        this.root.visible = false;
    }
}

export { Agent };