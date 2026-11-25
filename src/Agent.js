import * as THREE from 'three';
import { Layout } from './constant.js'

const wrapAngle = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));

class Agent {
    constructor(levelManager, index) {
        this.levelManager = levelManager;
        this.game = this.levelManager.game;
        this.index = index;
        this.load();
        this.tickCount = 0; // agent 被创建以来的时间
        this.states = [];
        this.state = { x: 0, z: 0, facing: 0 };
        this.prevState = { x: 0, z: 0, facing: 0 };
        this.pickUpKey = [];
        this.openDoor = [];
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
        this.root.add(head, body, nose);
        this.levelManager.levelRoot.add(this.root);
        this.root.visible = false;
    }

    setToStartPoint() {
        console.log(`set agent ${this.index} to start point`);
        const startPoint = this.levelManager.startPoint[this.index];
        this.state.x = startPoint.x + this.levelManager.platformInfo[startPoint.i].x;
        this.state.z = startPoint.z + this.levelManager.platformInfo[startPoint.i].z;
        this.state.facing = startPoint.facing;
        this.prevState = { ...this.state };
        this.valid = true;
        this.update(0); // 临时设置为 true 做 update
        this.valid = false;
    }

    tick() {
        if (!this.valid) return;
        this.prevState = { ... this.state };
        if (this.tickCount < this.states.playerStates.length) {
            this.state = { ... this.states.playerStates[this.tickCount] };
            this.states.pickUpKey.forEach(info => {
                if (info.tick == this.tickCount) {
                    this.levelManager.keys[info.index].pickUpByAgent();
                }
            });
            this.states.openDoor.forEach(info => {
                if (info.tick == this.tickCount) {
                    this.levelManager.doors[info.index].openWithKeyByAgent();
                }
            });
            ++this.tickCount;
        }
        this.agentPlayerCollision(this.levelManager.player);
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

    prepareRound() {
        this.valid = false;
        this.root.visible = (this.index < this.levelManager.round);
        this.setToStartPoint();
        this.tickCount = 0;
        this.states = [];
        this.pickUpKey = [];
        this.openDoor = [];
    }

    setStates(recordedStates) {
        this.states = recordedStates;
        console.log(`Agent has ${this.states.playerStates.length} states`);
        this.states.pickUpKey.forEach(info => {
            this.levelManager.keys[info.index].assignedAgent = this.index;
        });
    }

    agentPlayerCollision(player) {
        const agentPos = new THREE.Vector3(this.state.x, 0, this.state.z);
        const playerPos = new THREE.Vector3(player.state.x, 0, player.state.z);
        const dist = Math.hypot(agentPos.x - playerPos.x, agentPos.z - playerPos.z);
        if (dist < Layout.agentRadius + Layout.playerRadius) {
            const dir = playerPos.clone().sub(agentPos).normalize();
            const overlap = Layout.agentRadius + Layout.playerRadius - dist;
            const newX = player.state.x + dir.x * overlap;
            const newZ = player.state.z + dir.z * overlap;
            player.move(newX, newZ);
        }
    }
}

export { Agent };