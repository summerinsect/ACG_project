import * as THREE from 'three';

class Agent {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.game = this.levelManager.game;
        this.load();
        this.tickCount = 0;
        this.states = [];
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
    }

    tick() {

    }
}