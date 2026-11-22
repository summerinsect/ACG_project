// import './style.css'
import * as THREE from 'three'
import { LevelManager } from './LevelManager.js'
import { FollowCamera } from './FollowCamera.js'
import { InputHandler } from './InputHandler.js'

class Game {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.followCamera = new FollowCamera();
        this.camera = this.followCamera.camera;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xaaaaaa);

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight();
        light.position.set(0.2, 1, 1);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        this.renderer.setAnimationLoop(this.render.bind(this));

        window.addEventListener('resize', this.resize.bind(this));

        this.inputHandler = new InputHandler(this.renderer.domElement);

        this.TICK = 1 / 60;
        this.lastTime = null;
        this.accumulation = 0;
        this.tickCount = 0;

        this.levelManager = new LevelManager(this, 2);
        this.levelManager.initLevel();
    }

    resize() {
        this.followCamera.resize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(time) {
        if (this.lastTime == null) this.lastTime = time;
        const frameDt = Math.min((time - this.lastTime) / 1000, 0.25);
        this.lastTime = time;

        this.accumulation += frameDt;
        while (this.accumulation >= this.TICK) {
            this.accumulation -= this.TICK;
            this.levelManager.tick();
            this.tickCount++;
        }

        const alpha = this.accumulation / this.TICK;
        this.levelManager.update(alpha);

        const mouse = this.inputHandler.takeMouseDelta();
        const target = this.levelManager.player.target;
        this.followCamera.update(frameDt, mouse, target);

        this.renderer.render(this.scene, this.camera);
    }
}

export { Game };