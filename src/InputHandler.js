import * as THREE from 'three';

class InputHandler {
    constructor(canvas) {
        this.held = new Set();     // 当前按住的键
        this.pressed = new Set();  // 按下过但还没被消费的键
        this.mouseDx = 0;
        this.mouseDy = 0;
        window.addEventListener('keydown', e => {
            if (e.code === 'Tab') e.preventDefault();
            // e.repeat 是按住不放时系统自动重复的事件，不算新的一次按下
            if (!e.repeat) this.pressed.add(e.code);
            this.held.add(e.code);
        });
        window.addEventListener('keyup', e => this.held.delete(e.code));
        // 切出窗口时收不到 keyup，不清空的话角色会一直走
        window.addEventListener('blur', () => this.held.clear());

        canvas.addEventListener('click', () => canvas.requestPointerLock());
        document.addEventListener('mousemove', e => {
            if (document.pointerLockElement !== canvas) return;
            this.mouseDx += e.movementX;
            this.mouseDy += e.movementY;
        });
    }

    isHeld(code) { return this.held.has(code); }

    consume(code) {
        const had = this.pressed.has(code);
        this.pressed.delete(code);
        return had;
    }

    takeMouseDelta() {
        const d = { x: this.mouseDx, y: this.mouseDy };
        this.mouseDx = this.mouseDy = 0;
        return d;
    }
}

export { InputHandler };