import * as THREE from 'three';
import { Platform } from './Platform.js'
import { Road } from './Road.js'
import { Door } from './Door.js'
import { PressurePlate } from './PressurePlate.js'
import { Key } from './Key.js'
import { Player } from './Player.js'

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
    }

    loadLevelData(levelId) {
        this.levelData = getLevelData(levelId);
        this.levelName = this.levelData.levelName;
        this.maxAgent = this.levelData.maxAgent;
        this.platformInfo = this.levelData.platformInfo;
        this.roadInfo = this.levelData.roadInfo;
        this.doorInfo = this.levelData.doorInfo;
        this.pressurePlateInfo = this.levelData.pressurePlateInfo;
        this.keyInfo = this.levelData.keyInfo;
        this.startPoint = this.levelData.startPoint;
        this.endPoint = this.levelData.endPoint;
    }

    initLevel() {
        // init player
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
        this.player = new Player(this);
        this.doorInfo.forEach((info, index) => {
            const door = new Door(this, index);
            this.doors.push(door);
        })
        this.pressurePlateInfo.forEach((info, index) => {
            const pressurePlate = new PressurePlate(this, index);
            this.pressurePlates.push(pressurePlate);
        })
        this.keyInfo.forEach((info, index) => {
            const key = new Key(this, index);
            this.keys.push(key);
        })
    }

    tick() {
        this.player.tick();
        this.doors.forEach(door => { door.tick(); });
        this.pressurePlates.forEach(pressurePlate => { pressurePlate.tick(); });
    }

    update(alpha) {
        this.player.update(alpha);
        this.doors.forEach(door => { door.update(alpha); });
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