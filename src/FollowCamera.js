import * as THREE from 'three';

class FollowCamera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.yaw = 0; // 偏航角，绕 y 轴旋转的角度
        this.pitch = 0.5; // 俯仰角，相机和角色连线与水平的夹角
        this.distance = 7;
        this.smoothTarget = new THREE.Vector3();
        this.initialized = false;
        this.mouseSensitivity = 0.002; // 每像素鼠标对应的弧度，即灵敏度
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    update(frameDt, mouse, target) {
        this.yaw -= mouse.x * this.mouseSensitivity;
        this.pitch = THREE.MathUtils.clamp(this.pitch + mouse.y * this.mouseSensitivity, 0.1, 1.3);

        if (!this.initialized) {
            this.smoothTarget.copy(target);
            this.initialized = true;
        }

        this.smoothTarget.lerp(target, 1 - Math.exp(-frameDt * 12)); // 指数平滑

        const cp = Math.cos(this.pitch);
        this.camera.position.set(
            this.smoothTarget.x + this.distance * cp * Math.sin(this.yaw),
            this.smoothTarget.y + this.distance * Math.sin(this.pitch),
            this.smoothTarget.z + this.distance * cp * Math.cos(this.yaw),
        );
        this.camera.lookAt(this.smoothTarget);
    }
}

export { FollowCamera };