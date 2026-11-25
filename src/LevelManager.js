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
        this.recordedStates = [];
        this.statesThisRound = {
            playerStates: [],
            openDoor: [],
            pickUpKey: [],
        };
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
            const agent = new Agent(this, i);
            this.agents.push(agent);
        }
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
            this.keys.forEach(key => { key.tick(); });
            this.winCheck();
        }
    }

    update(alpha) {
        this.player.update(alpha);
        this.doors.forEach(door => { door.update(alpha); });
        this.agents.forEach(agent => { agent.update(alpha); });
        this.keys.forEach(key => { key.update(alpha); });
    }


    prepareRound(round) {
        if (this.recordedStates.length < round) {
            // 不管如何进入这一轮，都必须有足够的录像
            console.log(`invalid round ${round}, only ${this.recordedStates.length} recorded states available`);
        }
        this.round = round;
        this.recording = false;
        this.tickCount = 0;
        this.statesThisRound = {
            playerStates: [],
            openDoor: [],
            pickUpKey: [],
        };
        while (this.recordedStates.length > this.round) {
            this.recordedStates.pop();
        }
        // 设置场景中所有物体的静态状态
        this.player.prepareRound();
        this.doors.forEach(door => { door.prepareRound(); });
        this.pressurePlates.forEach(pressurePlate => { pressurePlate.prepareRound(); });
        this.keys.forEach(key => { key.prepareRound(); });
        this.agents.forEach(agent => { agent.prepareRound(); });
        // 设置 agent 的录像
        for (let i = 0; i < this.round; i++) {
            this.agents[i].setStates(this.recordedStates[i]);
        }
    }

    resetLevel() {
        this.prepareRound(0);
    }

    retryThisRound() {
        if (this.recording == false) return;
        this.recording = false;
        this.prepareRound(this.round);
    }

    cancelLastRound() {
        if (this.recording == true || this.round <= 0) return;
        this.recording = true;
        this.prepareRound(this.round - 1);
    }

    startRound() {
        if (this.recording) return;
        console.log(`Starting round ${this.round + 1}`);
        this.recording = true;
        for (let i = 0; i < this.round; i++) {
            this.agents[i].valid = true;
        }
    }

    endRound() {
        if (!this.recording) return;
        console.log(`Ending round ${this.round + 1}`);
        this.recording = false;
        this.recordedStates.push(this.statesThisRound);
        if (this.round == this.maxAgent) {
            this.game.setState('lose');
            return;
        }
        this.prepareRound(this.round + 1);
    }

    winCheck() {
        const playerPos = new THREE.Vector3(this.player.state.x, 0, this.player.state.z);
        const targetPos = new THREE.Vector3(this.endPoint.x + this.platformInfo[this.endPoint.i].x, 0, this.endPoint.z + this.platformInfo[this.endPoint.i].z);
        const dist = Math.hypot(playerPos.x - targetPos.x, playerPos.z - targetPos.z);
        if (dist < 0.3) {
            // 获胜时保留视觉状态，但清空所有逻辑状态
            this.recording = false;
            this.round = 0;
            this.tickCount = 0;
            this.recordedStates = [];
            this.statesThisRound = {
                playerStates: [],
                openDoor: [],
                pickUpKey: [],
            };
            this.game.setState('win');
        }
    }

    valid(pos) {
        let valid = false;
        this.platforms.forEach(platform => { valid |= platform.valid(pos); });
        this.roads.forEach(road => { valid |= road.valid(pos); });
        return valid;
    }

    doorPlayerCollision(player) {
        this.doors.forEach(door => { door.doorPlayerCollision(player);});
    }

    doorOpen(index, state) {
        this.doors.forEach(door => {
            if (door.pressurePlateIndex == index) {
                door.opening = state;
            }
        });
    }

    interactWithDoorAndKey() {
        this.doors.forEach(door => { door.openWithKeyByPlayer(); });
        this.keys.forEach(key => { key.pickUpByPlayer(); });
    }
}

export { LevelManager }; 