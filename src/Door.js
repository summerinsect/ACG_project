import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'

class Door{
	constructor(levelManager, index) {
		const info = levelManager.doorInfo[index];
		const road = levelManager.roads[info.i];
		if (road.direction == 'z') {
			this.leftDoorRoot = new THREE.Group();
			levelManager.levelRoot.add(this.leftDoorRoot);
			this.leftDoorRoot.position.set(road.mesh.position.x - Layout.roadOffset / 2, Layout.doorHeight / 2 - Layout.platformThickness / 2, road.mesh.position.z + info.d * (Layout.platformInterval - Layout.platformSize) / 2);
			this.leftDoor = new THREE.Mesh(MeshAttributes.doorGeometryZ, MeshAttributes.doorMaterial);
			this.leftDoorRoot.add(this.leftDoor);
			this.leftDoor.position.set(Layout.roadOffset / 4, 0, 0);
			this.rightDoorRoot = new THREE.Group();
			levelManager.levelRoot.add(this.rightDoorRoot);
			this.rightDoorRoot.position.set(road.mesh.position.x + Layout.roadOffset / 2, Layout.doorHeight / 2 - Layout.platformThickness / 2, road.mesh.position.z + info.d * (Layout.platformInterval - Layout.platformSize) / 2);
			this.rightDoor = new THREE.Mesh(MeshAttributes.doorGeometryZ, MeshAttributes.doorMaterial);
			this.rightDoorRoot.add(this.rightDoor);
			this.rightDoor.position.set(-Layout.roadOffset / 4, 0, 0);
		}
		else { // road.direction == 'x'
			this.leftDoorRoot = new THREE.Group();
			levelManager.levelRoot.add(this.leftDoorRoot);
			this.leftDoorRoot.position.set(road.mesh.position.x + info.d * (Layout.platformInterval - Layout.platformSize) / 2, Layout.doorHeight / 2 - Layout.platformThickness / 2, road.mesh.position.z - Layout.roadOffset / 2);
			this.leftDoor = new THREE.Mesh(MeshAttributes.doorGeometryX, MeshAttributes.doorMaterial);
			this.leftDoorRoot.add(this.leftDoor);
			this.leftDoor.position.set(0, 0, Layout.roadOffset / 4);
			this.rightDoorRoot = new THREE.Group();
			levelManager.levelRoot.add(this.rightDoorRoot);
			this.rightDoorRoot.position.set(road.mesh.position.x + info.d * (Layout.platformInterval - Layout.platformSize) / 2, Layout.doorHeight / 2 - Layout.platformThickness / 2, road.mesh.position.z + Layout.roadOffset / 2);
			this.rightDoor = new THREE.Mesh(MeshAttributes.doorGeometryX, MeshAttributes.doorMaterial);
			this.rightDoorRoot.add(this.rightDoor);
			this.rightDoor.position.set(0, 0, -Layout.roadOffset / 4);
		}
	}
}

export { Door };