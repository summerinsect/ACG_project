const STORAGE_KEY = 'replay-game-progress'; 

export function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (data && Array.isArray(data.completed)) {
            return { completed: new Set(data.completed) };
        }
    } catch { }
    return { completed: new Set() };
}

export function saveProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...progress.completed] }));
    } catch { }
}

export function clearProgress(progress) {
    progress.completed.clear();
    saveProgress(progress);
}

export function isUnlocked(levels, index, progress) {
    return index == 0 || progress.completed.has(levels[index - 1].id);
}

