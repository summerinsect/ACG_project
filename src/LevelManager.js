import * as THREE from 'three';
import { Platform } from './Platform.js'
import { Road } from './Road.js'
import { Door } from './Door.js'
import { PressurePlate } from './PressurePlate.js'
import { Key } from './Key.js'
import { Player } from './Player.js'
import { Agent } from './Agent.js'
import { EndPointSign } from './EndPointSign.js'

const levelModules = import.meta.glob('./Levels/Level*.js', { eager: true, import: 'default' });
function getLevelData(id) {
    const data = levelModules[`./Levels/Level${id}.js`];
    if (!data) throw new Error(`找不到关卡 ${id}`);
    return data;
}

class LevelManager {
    constructor(game, levelId) {
        this.game = game;
        this.levelId = levelId;
        this.levelRoot = new THREE.Group();
        this.game.scene.add(this.levelRoot);
        this.platforms = [];
        this.roads = [];
        this.doors = [];
        this.pressurePlates = [];
        this.keys = [];
        this.agents = [];
        this.recording = false;
        this.recordStates = [];
        this.round = 0;
        this.tickCount = 0; // 本轮录制开始以来的时间
    }

    loadLevelData(levelId) {
        this.levelData = getLevelData(levelId);
        this.levelName = this.levelData.levelName;
        this.maxAgent = this.levelData.maxAgent;
        this.maxRoundTime = this.levelData.maxRoundTime;
        this.platformInfo = this.levelData.platformInfo;
        this.roadInfo = this.levelData.roadInfo;
        this.doorInfo = this.levelData.doorInfo;
        this.pressurePlateInfo = this.levelData.pressurePlateInfo;
        this.keyInfo = this.levelData.keyInfo;
        this.startPoint = this.levelData.startPoint;
        this.endPoint = this.levelData.endPoint;
    }

    initLevel() {
        this.loadLevelData(this.levelId);
        this.platformInfo.forEach((info, index) => {
            const platform = new Platform(this, index);
            this.platforms.push(platform);
        });
        this.roadInfo.forEach((info, index) => {
            if (info.c == 1) {
                const road = new Road(this, index, 0);
                this.roads.push(road);
            }
            else if (info.c == 2) {
                const r1 = new Road(this, index, -1);
                const r2 = new Road(this, index, 1);
                this.roads.push(r1, r2);
            }
            else {
                console.error(`Road ${index} has invalid c value: ${info.c}`);
            }
        });
        this.endPointSign = new EndPointSign(this);
        this.player = new Player(this);
        this.doorInfo.forEach((info, index) => {
            const door = new Door(this, index);
            this.doors.push(door);
        });
        this.pressurePlateInfo.forEach((info, index) => {
            const pressurePlate = new PressurePlate(this, index);
            this.pressurePlates.push(pressurePlate);
        });
        this.keyInfo.forEach((info, index) => {
            const key = new Key(this, index);
            this.keys.push(key);
        });
        for (let i = 0; i < this.maxAgent; i++) {
            const agent = new Agent(this);
            this.agents.push(agent);
        }
    }

    resetLevel() {
        this.player.setToStartPoint();
        this.doors.forEach(door => { door.reset(); });
        this.pressurePlates.forEach(pressurePlate => { pressurePlate.reset(); });
        this.agents.forEach(agent => { agent.reset(); });
        this.recording = false;
        this.recordStates = [];
        this.round = 0;
    }

    tick() {
        if (this.recording) {
            this.tickCount++;
            const remainingTime = this.maxRoundTime * 60 - this.tickCount;
            this.game.UI.setHudText(`${Math.floor(remainingTime / 60)}:${Math.floor(remainingTime % 60 / 60 * 100)}`);
            if (this.tickCount > this.maxRoundTime * 60) {
                this.endRound();
                return;
            }
            this.player.tick();
            this.doors.forEach(door => { door.tick(); });
            this.agents.forEach(agent => { agent.tick(); });
            this.pressurePlates.forEach(pressurePlate => { pressurePlate.tick(); });
            this.recordStates.push({ ...this.player.state });
            this.winCheck();
        }
    }

    update(alpha) {
        this.player.update(alpha);
        this.doors.forEach(door => { door.update(alpha); });
        this.agents.forEach(agent => { agent.update(alpha); });
    }

    startRound() {
        if (this.recording == true) return;
        console.log(`Starting round ${this.round + 1}`);
        this.tickCount = 0;
        this.recording = true;
        for (let i = 0; i < this.round; i++) {
            this.agents[i].startRound();
        }
    }

    endRound() {
        if (this.recording == false) return;
        console.log(`Ending round ${this.round + 1}`);
        for (let i = 0; i < this.round; i++) {
            this.agents[i].endRound();
        }
        this.recording = false;
        if (this.round == this.maxAgent) {
            this.game.setState('lose');
            return;
        }
        this.agents[this.round].setStates(this.recordStates);
        this.recordStates = [];
        this.round++;
        this.player.setToStartPoint();
        this.doors.forEach(door => { door.reset(); });
        this.pressurePlates.forEach(pressurePlate => { pressurePlate.reset(); });
    }

    winCheck() {
        const playerPos = new THREE.Vector3(this.player.state.x, 0, this.player.state.z);
        const targetPos = new THREE.Vector3(this.endPoint.x + this.platformInfo[this.endPoint.i].x, 0, this.endPoint.z + this.platformInfo[this.endPoint.i].z);
        const dist = Math.hypot(playerPos.x - targetPos.x, playerPos.z - targetPos.z);
        if (dist < 0.3) {
            this.recording = false;
            this.game.setState('win');
        }
    }

    valid(pos) {
        let valid = false;
        this.platforms.forEach(platform => { valid |= platform.valid(pos); });
        this.roads.forEach(road => { valid |= road.valid(pos); });
        return valid;
    }

    doorCheck(player) {
        this.doors.forEach(door => {door.doorCheck(player);});
    }

    doorOpen(index, state) {
        this.doors.forEach(door => {
            if (door.pressurePlateIndex == index) {
                door.opening = state;
            }
        });
    }
}

export { LevelManager }; 