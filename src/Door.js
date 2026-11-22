import * as THREE from 'three';
import { Layout, MeshAttributes } from './constant.js'

class Door{
	constructor(levelManager, index) {
		this.game = levelManager.game;
		const info = levelManager.doorInfo[index];
		const road = levelManager.roads[info.i];
		{
			if (road.direction == 'z') {
				this.leftDoorRoot = new THREE.Group();
				levelManager.levelRoot.add(this.leftDoorRoot);
				this.leftDoorRoot.position.set(
					road.mesh.position.x - Layout.roadSize / 2,
					Layout.doorHeight / 2 + Layout.platformThickness / 2,
					road.mesh.position.z + info.d * (Layout.platformInterval - Layout.platformSize) / 2
				);
				this.leftDoor = new THREE.Mesh(MeshAttributes.doorGeometryZ, MeshAttributes.doorMaterial);
				this.leftDoorRoot.add(this.leftDoor);
				this.leftDoor.position.set(Layout.roadSize / 4, 0, 0);
				this.rightDoorRoot = new THREE.Group();
				levelManager.levelRoot.add(this.rightDoorRoot);
				this.rightDoorRoot.position.set(
					road.mesh.position.x + Layout.roadSize / 2,
					Layout.doorHeight / 2 + Layout.platformThickness / 2,
					road.mesh.position.z + info.d * (Layout.platformInterval - Layout.platformSize) / 2
				);
				this.rightDoor = new THREE.Mesh(MeshAttributes.doorGeometryZ, MeshAttributes.doorMaterial);
				this.rightDoorRoot.add(this.rightDoor);
				this.rightDoor.position.set(-Layout.roadSize / 4, 0, 0);
			}
			else { // road.direction == 'x'
				this.leftDoorRoot = new THREE.Group();
				levelManager.levelRoot.add(this.leftDoorRoot);
				this.leftDoorRoot.position.set(
					road.mesh.position.x + info.d * (Layout.platformInterval - Layout.platformSize) / 2,
					Layout.doorHeight / 2 + Layout.platformThickness / 2,
					road.mesh.position.z - Layout.roadSize / 2
				);
				this.leftDoor = new THREE.Mesh(MeshAttributes.doorGeometryX, MeshAttributes.doorMaterial);
				this.leftDoorRoot.add(this.leftDoor);
				this.leftDoor.position.set(0, 0, Layout.roadSize / 4);
				this.rightDoorRoot = new THREE.Group();
				levelManager.levelRoot.add(this.rightDoorRoot);
				this.rightDoorRoot.position.set(
					road.mesh.position.x + info.d * (Layout.platformInterval - Layout.platformSize) / 2,
					Layout.doorHeight / 2 + Layout.platformThickness / 2,
					road.mesh.position.z + Layout.roadSize / 2
				);
				this.rightDoor = new THREE.Mesh(MeshAttributes.doorGeometryX, MeshAttributes.doorMaterial);
				this.rightDoorRoot.add(this.rightDoor);
				this.rightDoor.position.set(0, 0, -Layout.roadSize / 4);
			}
		} // 创建门板
		this.opening = false;
		this.rotateSpeed = Math.PI / 6;
		this.prevAngle = 0;
		this.currentAngle = 0;
		// 路的方向是 z，门垂直于路，门的方向就是 x
        this.dirVec = (road.direction == 'z' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1));
		{
			const ox = this.dirVec.z, oz = -this.dirVec.x;
			const roadPos = road.mesh.position, doorPos = this.leftDoorRoot.position;
            this.angleSign = (ox * (roadPos.x - doorPos.x) + oz * (roadPos.z - doorPos.z) > 0 ? 1 : -1);
		}

		this.pressurePlateIndex = info.p;
	}

	tick() {
		this.prevAngle = this.currentAngle;
		if (this.opening) {
			this.currentAngle += this.rotateSpeed * this.game.TICK;
		}
		else {
			this.currentAngle -= this.rotateSpeed * this.game.TICK;
		}
		if (this.currentAngle >= Math.PI / 2) {
			this.currentAngle = Math.PI / 2;
		}
		if (this.currentAngle <= 0) {
			this.currentAngle = 0;
		}
		this.doorCheck(this.game.levelManager.player);

	}

	update(alpha) {
		const angle = this.prevAngle + (this.currentAngle - this.prevAngle) * alpha;
		this.leftDoorRoot.rotation.y = angle * this.angleSign;
		this.rightDoorRoot.rotation.y = -angle * this.angleSign;
	}

	get leftAngle() { return this.currentAngle * this.angleSign; }
    get rightAngle() { return this.currentAngle * -this.angleSign; }

	doorCheck(player) {
		function distToSegment(p, a, b) { // p, a, b: Vector3
            const px = p.x, pz = p.z, ax = a.x, az = a.z, bx = b.x, bz = b.z;
			const abx = bx - ax, abz = bz - az;
			const s = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / (abx * abx + abz * abz)));
			const qx = ax + s * abx, qz = az + s * abz;   // 线段上离 P 最近的点
			return {
				dist: Math.hypot(px - qx, pz - qz),
				point: new THREE.Vector3(qx, 0, qz)
			};
		}

		const thickness = Layout.doorThickness;
		const width = Layout.roadSize / 2;
		const leftRotDirVec = this.dirVec.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.leftAngle);
        const rightRotDirVec = this.dirVec.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rightAngle);
		const la = new THREE.Vector3(), ra = new THREE.Vector3();
		this.leftDoorRoot.getWorldPosition(la); // 门轴静止所以直接取世界坐标
        const lb = new THREE.Vector3(la.x + width * leftRotDirVec.x, la.y, la.z + width * leftRotDirVec.z);
		this.rightDoorRoot.getWorldPosition(ra);
		const rb = new THREE.Vector3(ra.x - width * rightRotDirVec.x, ra.y, ra.z - width * rightRotDirVec.z);
		const pr = Layout.playerRadius;
		let ppos = new THREE.Vector3(player.state.x, 0, player.state.z);
        let newX = ppos.x, newZ = ppos.z;
		const distToLeftDoor = distToSegment(ppos, la, lb);
		if (distToLeftDoor.dist + 1e-6 <= thickness / 2 + pr) {
			const overlap = thickness / 2 + pr - distToLeftDoor.dist;
			const dx = ppos.x - distToLeftDoor.point.x, dz = ppos.z - distToLeftDoor.point.z;
			newX += dx / distToLeftDoor.dist * overlap;
			newZ += dz / distToLeftDoor.dist * overlap;
		}
		ppos = new THREE.Vector3(newX, 0, newZ);
		const distToRightDoor = distToSegment(ppos, ra, rb);
		if (distToRightDoor.dist + 1e-6 <= thickness / 2 + pr) {
			const overlap = thickness / 2 + pr - distToRightDoor.dist;
			const dx = ppos.x - distToRightDoor.point.x , dz = ppos.z - distToRightDoor.point.z;
			newX += dx / distToRightDoor.dist * overlap;
			newZ += dz / distToRightDoor.dist * overlap;
		}
		player.move(newX, newZ);
	}
}

export { Door };