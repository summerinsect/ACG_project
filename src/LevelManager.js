import * as THREE from 'three';

class LevelManager {
    constructor(game) {
        this.game = game;
    }

    initLevel() {
        const geometry = new THREE.BoxGeometry();
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        // this.platforms = [];
        // this.roads = [];

        const platformSize = 3;

        // (x, z) 是坐标，必须是 5 的整数倍，y 是高度，暂时固定为 0
        const platformPositions = [
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: -5 },
            { x: 0, y: 0, z: -10 },
            { x: 0, y: 0, z: -15 },
            { x: 5, y: 0, z: 0 },
        ];

        const roadSize = 0.6;
        const roadOffset = 0.7;

        // u 和 v 是 platform 的索引，c 是道路的数目
        // 要求 u 和 v 在某个方向上相邻
        // c 暂时只有 1 或 2 两种取值
        const roadsInfo = [
            { u: 0, v: 1, c: 1 },
            { u: 1, v: 2, c: 2 },
            { u: 2, v: 3, c: 1 },
            { u: 0, v: 4, c: 2 },
        ];

        platformPositions.forEach(pos => {
            const platform = new THREE.Mesh(geometry, platformMaterial);
            platform.position.set(pos.x, pos.y, pos.z);
            platform.scale.set(platformSize, 0.3, platformSize);
            // this.platforms.push(platform);
            this.game.scene.add(platform);
        });

        roadsInfo.forEach(edge => {
            const pu = platformPositions[edge.u];
            const pv = platformPositions[edge.v];
            if (pu.x == pv.x) {
                // c = 1 时，直接连接中心线
                if (edge.c == 1) {
                    const road = new THREE.Mesh(geometry, roadMaterial);
                    road.position.set(pu.x, pu.y, (pu.z + pv.z) / 2);
                    road.scale.set(roadSize, 0.1, Math.abs(pu.z - pv.z));
                    this.game.scene.add(road);
                }
                // c = 2 时，连接两条平行线
                else if (edge.c == 2) {
                    const r1 = new THREE.Mesh(geometry, roadMaterial);
                    const r2 = new THREE.Mesh(geometry, roadMaterial);
                    r1.position.set(pu.x - roadOffset, pu.y, (pu.z + pv.z) / 2);
                    r2.position.set(pu.x + roadOffset, pu.y, (pu.z + pv.z) / 2);
                    r1.scale.set(roadSize, 0.1, Math.abs(pu.z - pv.z));
                    r2.scale.set(roadSize, 0.1, Math.abs(pu.z - pv.z));
                    this.game.scene.add(r1);
                    this.game.scene.add(r2);
                }
                else {
                    console.error(`Invalid road number ${edge.c} between platforms ${edge.u} and ${edge.v}`);
                }
            }
            else if (pu.z == pv.z) {
                if (edge.c == 1) {
                    const road = new THREE.Mesh(geometry, roadMaterial);
                    road.position.set((pu.x + pv.x) / 2, pu.y, pu.z);
                    road.scale.set(Math.abs(pu.x - pv.x), 0.1, roadSize);
                    this.game.scene.add(road);
                }
                else if (edge.c == 2) {
                    const r1 = new THREE.Mesh(geometry, roadMaterial);
                    const r2 = new THREE.Mesh(geometry, roadMaterial);
                    r1.position.set((pu.x + pv.x) / 2, pu.y, pu.z - roadOffset);
                    r2.position.set((pu.x + pv.x) / 2, pu.y, pu.z + roadOffset);
                    r1.scale.set(Math.abs(pu.x - pv.x), 0.1, roadSize);
                    r2.scale.set(Math.abs(pu.x - pv.x), 0.1, roadSize);
                    this.game.scene.add(r1);
                    this.game.scene.add(r2);
                }
                else {
                    console.error(`Invalid road number ${edge.c} between platforms ${edge.u} and ${edge.v}`);
                }
            }
            else {
                console.error(`Invalid road between platforms ${edge.u} and ${edge.v}`);
            }
        });
    }
}

export { LevelManager }; 