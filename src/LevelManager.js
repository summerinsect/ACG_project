import * as THREE from 'three';
import { Platform } from './Platform.js'
import { Road } from './Road.js'
import { Door } from './Door.js'
import { PressurePlate } from './PressurePlate.js'
import { Key } from './Key.js'

class LevelManager {
    constructor(game/*, levelId*/) {
        this.game = game;
        this.levelRoot = new THREE.Group();
        this.game.scene.add(this.levelRoot);
        this.platforms = [];
        this.roads = [];
        this.doors = [];
        this.pressurePlates = [];
        this.keys = [];
    }

    loadLevelData() {
        // 先用固定数据，未来根据 levelId 从 json 加载

        // 坐标 (x, z) 必须是 5 的整数倍
        this.platformInfo = [
            { x: 0, z: 0 },
            { x: 0, z: -5 },
            { x: 0, z: -10 },
            { x: 0, z: -15 },
            { x: 5, z: 0 },
        ];

        // u 和 v 是 platform 的索引，要求 u 和 v 在 x 方向或 z 方向上坐标相同
        // c 是 road 数目，允许 1 或 2 两种取值（也许之后会增加）
        this.roadInfo = [
            { u: 0, v: 1, c: 1 },
            { u: 1, v: 2, c: 2 },
            { u: 2, v: 3, c: 1 },
            { u: 0, v: 4, c: 2 },
        ];

        // i 是 door 所在 road 的索引，d 是 door 在 road 的位置，p 是开门需要的 pressure plate
        // p = [-1] 表示这扇门需要用钥匙打开，其他情况 p 是非空非负整数数组（正常来说 length <= 2）
        this.doorInfo = [
            { i: 0, d: 0, p: [-1] },
            { i: 5, d: 0.5, p: [0] },
        ];

        // i 是 pressure plate 所在 platform 的索引，x 和 z 是其相对 platform 的坐标
        // 一个 pressure plate 可以对应多扇门（本质上允许 and 门，不允许 or 门）
        this.pressurePlateInfo = [
            { i: 0, x: 0, z: 0 },
            { i: 1, x: 1, z: 1 },
            { i: 2, x: -1, z: 0 },
        ];

        // i 是 key 所在 platform 的索引，相对坐标默认 (0, 2, 0)
        this.keyInfo = [
            { i: 0 },
        ];

        // this.levelData = {
        //     platformInfo: this.platformInfo,
        //     roadsInfo: this.roadsInfo,
        //     doorInfo: this.doorInfo,
        //     pressurePlateInfo: this.pressurePlateInfo
        // };
    }

    initLevel() {
        this.loadLevelData();
        this.initPlatforms();
        this.initRoads();
        this.initDoors();
        this.initPressurePlates();
        this.initKeys();
    }

    initPlatforms() {
        this.platformInfo.forEach((info, index) => {
            const platform = new Platform(this, index);
            this.platforms.push(platform);
        });
    }

    initRoads() {
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
    }

    initDoors() {
        this.doorInfo.forEach((info, index) => {
            const door = new Door(this, index);
            this.doors.push(door);
        })
    }

    initPressurePlates() {
        this.pressurePlateInfo.forEach((info, index) => {
            const pressurePlate = new PressurePlate(this, index);
            this.pressurePlates.push(pressurePlate);
        })
    }

    initKeys() {
        this.keyInfo.forEach((info, index) => {
            const key = new Key(this, index);
            this.keys.push(key);
        })
    }
}

export { LevelManager }; 