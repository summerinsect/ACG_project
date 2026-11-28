import * as THREE from 'three';
import './UI.css'
import { isUnlocked } from './ProgressManager.js'

function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const child of children) node.append(child);
    return node;
}

class UI {
    constructor(actions) {
        this.actions = actions;
        this.levelGrid = el('div', { className: 'level-grid' });
        this.screens = {
            menu: el('div', { className: 'overlay' }, [
                el('h1', { textContent: '门' }),
                el('button', { textContent: '开始游戏', onclick: actions.selectLevel }),
                el('p', { textContent: '走到告示牌就算通关' }),
            ]),
            levelSelect: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '选择关卡' }),
                this.levelGrid,
                el('div', { className: 'row' }, [
                    el('button', { className: 'secondary', textContent: '返回', onclick: actions.backToMenu }),
                    el('button', { className: 'secondary', textContent: '清除进度', onclick: actions.clearProgress }),
                ]),
            ]),
            paused: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '已暂停' }),
                el('button', { textContent: '继续', onclick: actions.resume }),
                el('button', { textContent: '撤销上一轮', onclick: actions.cancel }),
                el('button', { textContent: '重试本轮', onclick: actions.retry }),
                el('button', { textContent: '返回选关', onclick: actions.selectLevel }),
            ]),
            win: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '通关！' }),
                el('button', { textContent: '再玩一次', onclick: actions.restart }),
                this.nextButton = el('button', { textContent: '下一关', onclick: actions.nextLevel }),
                el('button', { textContent: '返回选关', onclick: actions.selectLevel }),
            ]),
            lose: el('div', { className: 'overlay' }, [
                el('h2', { textContent: '失败！' }),
                el('button', { textContent: '重试最后一轮', onclick: actions.retry }),
                el('button', { textContent: '返回选关', onclick: actions.selectLevel }),
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

    refreshLevelSelect(levels, progress) {
        const buttons = levels.map((level, index) => {
            const unlocked = isUnlocked(levels, index, progress);
            const completed = progress.completed.has(level.id);
            const button = el('button', {
                className: 'level-button' + (completed ? ' completed' : ''),
                disabled: !unlocked,
                title: unlocked ? level.name : '通关前一关后解锁',
                onclick: () => this.actions.startLevel(index),
            }, [
                el('span', { className: 'level-number', textContent: String(index + 1) }),
                el('span', { className: 'level-name', textContent: unlocked ? level.name : '未解锁' }),
            ]);
            if (completed) {
                button.append(el('span', { className: 'level-badge', textContent: '√' }));
            }
            return button;
        });
        this.levelGrid.replaceChildren(...buttons);
    }

    setNextLevelAvailable(available) {
        this.nextButton.classList.toggle('hidden', !available);
    }

    setHudText(text) {
        this.screens.playing.textContent = text;
    }
} 

export { UI };