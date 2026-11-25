import * as THREE from 'three';

export const Layout = Object.freeze({
    platformSize: 3,
    platformInterval: 5,
    platformThickness: 0.5,
    roadSize: 1,
    roadOffset: 0.8,
    doorHeight: 1.2,
    doorThickness: 0.05,
    doorOpenDist: 0.5,
    pressurePlateRadius: 0.4,
    pressurePlateThickness: 0.1,
    keyHeight: 0.2,
    keyPickDist: 0.5,
    playerRadius: 0.2,
    agentRadius: 0.2,
});

export const color = Object.freeze({
    background: 0xdfe7ee,
    platform: 0xd8cbb3,
    road: 0xa89880,
    player: 0xffffff,
    agent: 0xa8d8ff,
    endPointSign: 0x1a1a1a,
    key: 0xffc90e, // also used for door opened with key 
    pressurePlate: [
        0xe53935,
        0x1e88e5,
        0x43a047,
        0x8e24aa,
        0x00acc1,
        0x8d6e63,
    ], // also used for corresponding door
});

export const MeshAttributes = Object.freeze({
    platformGeometry: new THREE.BoxGeometry(Layout.platformSize, Layout.platformThickness, Layout.platformSize),
    platformMaterial: new THREE.MeshStandardMaterial({ color: color.platform }),
    roadGeometryX: new THREE.BoxGeometry(Layout.platformInterval - Layout.platformSize, Layout.platformThickness, Layout.roadSize),
    roadGeometryZ: new THREE.BoxGeometry(Layout.roadSize, Layout.platformThickness, Layout.platformInterval - Layout.platformSize),
    roadMaterial: new THREE.MeshStandardMaterial({ color: color.road }),
    doorGeometryZ: new THREE.BoxGeometry(Layout.roadSize / 2, Layout.doorHeight, Layout.doorThickness),
    doorGeometryX: new THREE.BoxGeometry(Layout.doorThickness, Layout.doorHeight, Layout.roadSize / 2),
    keyMaterial: new THREE.MeshStandardMaterial({ color: color.key }),
    pressurePlateGeometry: new THREE.CylinderGeometry(Layout.pressurePlateRadius, Layout.pressurePlateRadius, Layout.pressurePlateThickness),
    pressurePlateMaterials: [
        new THREE.MeshStandardMaterial({ color: color.pressurePlate[0] }),
        new THREE.MeshStandardMaterial({ color: color.pressurePlate[1] }),
        new THREE.MeshStandardMaterial({ color: color.pressurePlate[2] }),
        new THREE.MeshStandardMaterial({ color: color.pressurePlate[3] }),
        new THREE.MeshStandardMaterial({ color: color.pressurePlate[4] }),
        new THREE.MeshStandardMaterial({ color: color.pressurePlate[5] }),
    ],
});

export const PlayerMesh = Object.freeze({
    headGeometry: new THREE.SphereGeometry(0.15, 32, 32),
    bodyGeometry: new THREE.CylinderGeometry(0.1, 0.2, 0.6, 32),
    noseGeometry: new THREE.BoxGeometry(0.05, 0.05, 0.05),
    headMaterial: new THREE.MeshStandardMaterial({ color: color.player }),
    bodyMaterial: new THREE.MeshStandardMaterial({ color: color.player }),
    noseMaterial: new THREE.MeshStandardMaterial({ color: 0xff0000 }),
});

export const AgentMesh = Object.freeze({
    headGeometry: new THREE.SphereGeometry(0.12, 32, 32),
    bodyGeometry: new THREE.SphereGeometry(0.2, 32, 32),
    noseGeometry: new THREE.CapsuleGeometry(0.02, 0.06, 10, 20, 1),
    headMaterial: new THREE.MeshStandardMaterial({ color: color.agent }),
    bodyMaterial: new THREE.MeshStandardMaterial({ color: color.agent }),
    noseMaterial: new THREE.MeshStandardMaterial({ color: 0xff0000 }),
});

export const EndPointSignMesh = Object.freeze({
    rodGeometry: new THREE.BoxGeometry(0.1, 0.3, 0.1),
    plateGeometry: new THREE.BoxGeometry(0.1, 0.3, 0.5),
    material: new THREE.MeshStandardMaterial({ color: color.endPointSign }),
});

export const KeyMesh = Object.freeze({
    geometry1: new THREE.CylinderGeometry(0.15, 0.15, 0.05),
    geometry2: new THREE.BoxGeometry(0.05, 0.4, 0.05),
    geometry3: new THREE.BoxGeometry(0.05, 0.05, 0.05),
    material: new THREE.MeshBasicMaterial({ color: 0xffc90e }),
});