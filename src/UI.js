import * as THREE from 'three';
import './ui.css'

function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const child of children) node.append(child);
    return node;
}

class UI {
    constructor(actions) {
        this.screens = {
            menu: el('div', { className: 'overlay' }, [
                el('h1', { textContent: '时间分身' }),
                el('button', { textContent: '开始游戏', onclick: actions.start }),
                el('p', { textContent: '走到绿色方块就算通关' }),
            ]),
            paused: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '已暂停' }),
                el('button', { textContent: '继续', onclick: actions.resume }),
                el('button', { textContent: '返回主菜单', onclick: actions.quit }),
            ]),
            end: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '通关！' }),
                // el('button', { textContent: '再玩一次', onclick: actions.start }),
                el('button', { textContent: '返回主菜单', onclick: actions.quit }),
            ]),
            playing: el('div', { className: 'hud' }),
        };

        for (const screen of Object.values(this.screens)) {
            document.body.append(screen);
        }
    }

    show(state) {
        for (const [name, screen] of Object.entries(this.screens)) {
            screen.classList.toggle('hidden', name !== state);
        }
    }

    setHudText(text) {
        this.screens.playing.textContent = text;
    }
} 

export { UI };