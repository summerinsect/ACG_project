// claude opus 5.5
import { Layout, color } from './constant.js';

const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isInt = v => Number.isInteger(v);

export function checkLevelData(data, name = 'level') {
    const errors = [];
    const warnings = [];
    const err = msg => errors.push(msg);
    const warn = msg => warnings.push(msg);

    // ---------- 1. 顶层字段 ----------
    if (typeof data.levelName !== 'string') err('levelName 缺失或不是字符串');
    if (!isInt(data.maxAgent) || data.maxAgent < 0) err('maxAgent 必须是非负整数');
    if (!isNum(data.maxRoundTime) || data.maxRoundTime <= 0) err('maxRoundTime 必须是正数');
    for (const key of ['platformInfo', 'roadInfo', 'doorInfo', 'pressurePlateInfo', 'keyInfo', 'startPoint']) {
        if (!Array.isArray(data[key])) err(`${key} 必须是数组`);
    }
    if (errors.length) return report(name, errors, warnings);   // 结构都不对，后面没法检查

    const P = data.platformInfo, R = data.roadInfo, D = data.doorInfo;
    const PP = data.pressurePlateInfo, K = data.keyInfo;
    const half = Layout.platformSize / 2;
    const validPlatform = i => isInt(i) && i >= 0 && i < P.length;

    // 检查“平台上的一个点”：平台下标合法，并且离平台边缘至少 margin
    const checkPointOnPlatform = (pt, where, margin) => {
        if (!validPlatform(pt.i)) { err(`${where}.i = ${pt.i} 不是合法的平台下标`); return; }
        if (!isNum(pt.x) || !isNum(pt.z)) { err(`${where} 缺少 x 或 z`); return; }
        if (Math.abs(pt.x) > half - margin || Math.abs(pt.z) > half - margin) {
            err(`${where} 的坐标 (${pt.x}, ${pt.z}) 超出平台范围`);
        }
    };
    const worldPos = pt => ({ x: P[pt.i].x + pt.x, z: P[pt.i].z + pt.z });

    // ---------- 2. 平台 ----------
    const seen = new Set();
    P.forEach((p, k) => {
        if (!isNum(p.x) || !isNum(p.z)) { err(`platformInfo[${k}] 缺少 x 或 z`); return; }
        if (p.x % Layout.platformInterval || p.z % Layout.platformInterval) {
            err(`platformInfo[${k}] 的坐标不是 ${Layout.platformInterval} 的整数倍`);
        }
        const id = `${p.x},${p.z}`;
        if (seen.has(id)) err(`platformInfo[${k}] 和其他平台位置重复`);
        seen.add(id);
    });

    // ---------- 3. 道路，同时按 Road.js 的规则展开 ----------
    const lanes = [];   // 展开后的每一条车道：{ dir, cx, cz }，下标就是门的 i
    R.forEach((r, k) => {
        const where = `roadInfo[${k}]`;
        if (!validPlatform(r.u) || !validPlatform(r.v) || r.u === r.v) {
            err(`${where} 的 u、v 不合法`); return;
        }
        const pu = P[r.u], pv = P[r.v];
        const dx = Math.abs(pu.x - pv.x), dz = Math.abs(pu.z - pv.z);
        let dir;
        if (dx === 0 && dz === Layout.platformInterval) dir = 'z';
        else if (dz === 0 && dx === Layout.platformInterval) dir = 'x';
        else { err(`${where} 连接的两个平台不相邻`); return; }   // 道路长度是固定的，只能连相邻平台
        if (r.c !== 1 && r.c !== 2) { err(`${where}.c = ${r.c}，只允许 1 或 2`); return; }

        const cx = (pu.x + pv.x) / 2, cz = (pu.z + pv.z) / 2;
        const offsets = r.c === 1 ? [0] : [-1, 1];
        for (const o of offsets) {
            lanes.push(dir === 'z'
                ? { dir, cx: cx + o * Layout.roadOffset, cz }
                : { dir, cx, cz: cz + o * Layout.roadOffset });
        }
    });

    // ---------- 4. 压力板 ----------
    PP.forEach((pp, k) => checkPointOnPlatform(pp, `pressurePlateInfo[${k}]`, Layout.pressurePlateRadius));
    if (PP.length > color.pressurePlate.length) {
        err(`压力板有 ${PP.length} 块，但只定义了 ${color.pressurePlate.length} 种颜色`);
    }

    // ---------- 5. 门 ----------
    const plateUsed = new Array(PP.length).fill(false);
    const lockDoorPos = [];
    D.forEach((d, k) => {
        const where = `doorInfo[${k}]`;
        if (!isInt(d.i) || d.i < 0 || d.i >= lanes.length) {
            err(`${where}.i = ${d.i} 超出展开后的道路数量 ${lanes.length}`); return;
        }
        if (!isNum(d.d) || d.d < -1 || d.d > 1) err(`${where}.d 必须在 [-1, 1] 内`);
        if (d.p === -1) {
            const lane = lanes[d.i], s = d.d * (Layout.platformInterval - Layout.platformSize) / 2;
            lockDoorPos.push({ k, x: lane.cx + (lane.dir === 'x' ? s : 0), z: lane.cz + (lane.dir === 'z' ? s : 0) });
        } else if (isInt(d.p) && d.p >= 0 && d.p < PP.length) {
            plateUsed[d.p] = true;
        } else {
            err(`${where}.p = ${d.p} 既不是 -1，也不是合法的压力板下标`);
        }
    });
    plateUsed.forEach((used, k) => { if (!used) warn(`pressurePlateInfo[${k}] 没有控制任何门`); });

    // ---------- 6. 钥匙 ----------
    K.forEach((key, k) => checkPointOnPlatform(key, `keyInfo[${k}]`, 0));
    if (lockDoorPos.length > 0 && K.length === 0) warn('有锁门但没有钥匙');
    if (K.length > lockDoorPos.length) warn(`钥匙 ${K.length} 把，锁门只有 ${lockDoorPos.length} 扇`);

    // 钥匙和锁门离得太近时，按一次 F 可能同时触发两者
    const minGap = Layout.keyPickDist + Layout.doorOpenDist;
    K.forEach((key, k) => {
        if (!validPlatform(key.i)) return;
        const kp = worldPos(key);
        lockDoorPos.forEach(door => {
            if (Math.hypot(kp.x - door.x, kp.z - door.z) < minGap) {
                warn(`keyInfo[${k}] 离 doorInfo[${door.k}] 太近，交互可能冲突`);
            }
        });
    });

    // ---------- 7. 出生点和终点 ----------
    const S = data.startPoint;
    if (S.length < data.maxAgent + 1) {
        err(`startPoint 只有 ${S.length} 个，至少需要 maxAgent + 1 = ${data.maxAgent + 1} 个`);
    }
    S.forEach((s, k) => {
        checkPointOnPlatform(s, `startPoint[${k}]`, Layout.playerRadius);
        if (!isNum(s.facing)) err(`startPoint[${k}] 缺少 facing`);
    });
    const minSlotGap = Layout.playerRadius + Layout.agentRadius;
    for (let a = 0; a < S.length; a++) {
        for (let b = a + 1; b < S.length; b++) {
            if (!validPlatform(S[a].i) || !validPlatform(S[b].i)) continue;
            const pa = worldPos(S[a]), pb = worldPos(S[b]);
            if (Math.hypot(pa.x - pb.x, pa.z - pb.z) < minSlotGap) {
                err(`startPoint[${a}] 和 startPoint[${b}] 距离小于 ${minSlotGap}，雪人出生时会和玩家重叠`);
            }
        }
    }
    if (!data.endPoint) err('endPoint 缺失');
    else {
        checkPointOnPlatform(data.endPoint, 'endPoint', 0);
        if (!isNum(data.endPoint.facing)) err('endPoint 缺少 facing');
    }

    return report(name, errors, warnings);
}

function report(name, errors, warnings) {
    warnings.forEach(w => console.warn(`[${name}] ${w}`));
    if (errors.length) {
        throw new Error(`[${name}] 关卡数据有 ${errors.length} 处错误：\n- ${errors.join('\n- ')}`);
        return false;
    }
    console.log(`[${name}] 关卡数据检查通过，${warnings.length} 处警告`);
    return true;
}