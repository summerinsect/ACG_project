import * as THREE from 'three';

export const Layout = Object.freeze({
    platformSize: 3,
    platformInterval: 5,
    roadSize: 1,
    roadOffset: 0.8,
    roadThickness: 0.5,
    doorHeight: 2
});

export const MeshAttributes = Object.freeze({
    platformGeometry: new THREE.BoxGeometry(Layout.platformSize, 0.5, Layout.platformSize),
    platformMaterial: new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    roadGeometryX: new THREE.BoxGeometry(Layout.platformInterval - Layout.platformSize, Layout.roadThickness, Layout.roadSize),
    roadGeometryZ: new THREE.BoxGeometry(Layout.roadSize, Layout.roadThickness, Layout.platformInterval - Layout.platformSize),
    roadMaterial: new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
    doorGeometryZ: new THREE.BoxGeometry(Layout.roadSize / 2, Layout.doorHeight, 0.1),
    doorGeometryX: new THREE.BoxGeometry(0.1, Layout.doorHeight, Layout.roadSize / 2),
    doorMaterial: new THREE.MeshStandardMaterial({ color: 0x0000ff }),
})