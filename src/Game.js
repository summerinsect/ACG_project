import * as THREE from 'three'
import { LevelManager } from './LevelManager.js'
import { FollowCamera } from './FollowCamera.js'
import { InputHandler } from './InputHandler.js'
import { UI } from './UI.js'
import { loadProgress, saveProgress, clearProgress } from './ProgressManager.js';

const levelModules = import.meta.glob('./Levels/Level*.js', { eager: true, import: 'default' });
const levels = Object.entries(levelModules).map(([path, data]) => ({
    id: Number(path.match(/Level(\d+)\.js$/)[1]),
    name: data.levelName,
    data,
})).sort((a, b) => a.id - b.id);

class Game {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.followCamera = new FollowCamera();
        this.camera = this.followCamera.camera;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xaaaaaa);

        const ambient = new THREE.HemisphereLight(0xffffff, 0x8899aa, 2);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(5, 10, 7);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.canvas = this.renderer.domElement;
        container.appendChild(this.canvas);

        this.renderer.setAnimationLoop(this.render.bind(this));

        window.addEventListener('resize', this.resize.bind(this));

        this.inputHandler = new InputHandler(this);

        this.TICK = 1 / 60;
        this.lastTime = null;
        this.accumulator = 0;
        this.tickCount = 0;

        this.levels = levels;
        this.progress = loadProgress();
        this.initUI();

        this.currentIndex = null;
        this.levelManager = null;
    }

    initUI() {
        this.UI = new UI({
            selectLevel: () => {
                this.UI.refreshLevelSelect(levels, this.progress);
                this.setState('levelSelect');
            },
            backToMenu: () => {
                this.setState('menu');
            },
            clearProgress: () => {
                clearProgress(this.progress);
                this.UI.refreshLevelSelect(levels, this.progress);
            },
            startLevel: index => {
                this.currentIndex = index;
                if (this.levelManager) this.scene.remove(this.levelManager.levelRoot);
                this.levelManager = new LevelManager(this, index);
                this.levelManager.initLevel();
                this.setState('playing');
            },
            restart: () => {
                this.UI.actions.startLevel(this.currentIndex);
            },
            nextLevel: () => {
                this.UI.actions.startLevel(this.currentIndex + 1);
            },
            win: () => {
                this.progress.completed.add(this.levels[this.currentIndex].id);
                saveProgress(this.progress);
                this.UI.setNextLevelAvailable(this.currentIndex + 1 < this.levels.length);
                this.setState('win');
            },
            lose: () => {
                this.setState('lose');
            },
            retry: () => {
                this.levelManager.retryThisRound();
                this.setState('playing');
            },
            cancel: () => { this.levelManager.cancelLastRound(); this.setState('playing'); },
            resume: () => { this.setState('playing'); },
            quit: () => { this.levelManager.prepareRound(0); this.setState('menu'); },
        });
        this.state = 'menu';
        this.UI.show(this.state);
    }

    loadNewLevel(levelId) {
        if (this.levelManager) this.scene.remove(this.levelManager.levelRoot);
        this.levelManager = new LevelManager(this, levelId);
        this.levelManager.initLevel();
    }

    reset() {
        this.levelManager.resetLevel();
    }

    // 界面状态机
    setState(next) {
        this.state = next;
        this.UI.show(next);

        this.inputHandler.reset();
        this.accumulator = 0;

        if (next == 'menu' || next == 'levelSelect') {
            if (this.levelManager) this.scene.remove(this.levelManager.levelRoot);
            this.levelManager = null;
        }

        if (document.pointerLockElement == this.canvas) {
            document.exitPointerLock();
        }
    }

    resize() {
        this.followCamera.resize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(time) {
        if (this.lastTime == null) this.lastTime = time;
        const frameDt = Math.min((time - this.lastTime) / 1000, 0.25);
        this.lastTime = time;

        this.inputHandler.consumeCode();

        if (this.state == 'playing') {
            this.accumulator += frameDt;
            while (this.accumulator >= this.TICK) {
                this.accumulator -= this.TICK;
                    this.levelManager.tick();
                this.tickCount++;
            }

            const alpha = this.accumulator / this.TICK;
            this.levelManager.update(alpha);

            const mouse = this.inputHandler.takeMouseDelta();
            const target = this.levelManager.player.target;
            this.followCamera.update(frameDt, mouse, target);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

export { Game };