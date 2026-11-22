import * as THREE from 'three';
import { PressurePlate } from './PressurePlate';

export const Layout = Object.freeze({
    platformSize: 3,
    platformInterval: 5,
    platformThickness: 0.5,
    roadSize: 1,
    roadOffset: 0.8,
    doorHeight: 1.2,
    doorThickness: 0.05,
    pressurePlateRadius: 0.4,
    pressurePlateThickness: 0.1,
    keyRadius: 0.2,
    keyHeight: 1,
    playerRadius: 0.2,
});

export const MeshAttributes = Object.freeze({
    platformGeometry: new THREE.BoxGeometry(Layout.platformSize, 0.5, Layout.platformSize),
    platformMaterial: new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    roadGeometryX: new THREE.BoxGeometry(Layout.platformInterval - Layout.platformSize, Layout.platformThickness, Layout.roadSize),
    roadGeometryZ: new THREE.BoxGeometry(Layout.roadSize, Layout.platformThickness, Layout.platformInterval - Layout.platformSize),
    roadMaterial: new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
    doorGeometryZ: new THREE.BoxGeometry(Layout.roadSize / 2, Layout.doorHeight, Layout.doorThickness),
    doorGeometryX: new THREE.BoxGeometry(Layout.doorThickness, Layout.doorHeight, Layout.roadSize / 2),
    doorMaterial: new THREE.MeshStandardMaterial({ color: 0x0000ff }),
    pressurePlateGeometry: new THREE.CylinderGeometry(Layout.pressurePlateRadius, Layout.pressurePlateRadius, Layout.pressurePlateThickness),
    pressurePlateMaterial: new THREE.MeshStandardMaterial({ color: 0xffff00 }),
    keyGeometry: new THREE.SphereGeometry(Layout.keyRadius, 32, 32),
    keyMaterial: new THREE.MeshStandardMaterial({ color: 0xff00ff }),
})