import * as THREE from 'three';
import './UI.css'

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
                el('h1', { textContent: '门' }),
                el('button', { textContent: '开始游戏', onclick: actions.start }),
                el('p', { textContent: '走到告示牌就算通关' }),
            ]),
            paused: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '已暂停' }),
                el('button', { textContent: '继续', onclick: actions.resume }),
                el('button', { textContent: '撤销上一轮', onclick: actions.cancel }),
                el('button', { textContent: '重试本轮', onclick: actions.retry }),
                el('button', { textContent: '返回主菜单', onclick: actions.quit }),
            ]),
            win: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '通关！' }),
                el('button', { textContent: '再玩一次', onclick: actions.start }),
                el('button', { textContent: '返回主菜单', onclick: actions.quit }),
            ]),
            lose: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '失败！' }),
                el('button', { textContent: '重试最后一轮', onclick: actions.retry }),
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