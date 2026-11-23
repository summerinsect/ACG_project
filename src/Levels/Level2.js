export default {
    name: "测试关卡 2",
    maxAgent: 2,
    maxRoundTime: 30,
    // 坐标 (x, z) 必须是 5 的整数倍
    platformInfo: [
        { x: 0, z: 0 },
        { x: 0, z: -5 },
        { x: 5, z: -5 },
        { x: 5, z: 0},
    ],
    // u 和 v 是 platform 的索引，要求 u 和 v 在 x 方向或 z 方向上坐标相同
    // c 是 road 数目，允许 1 或 2 两种取值（也许之后会增加）
    roadInfo: [
        { u: 0, v: 1, c: 1 },
        { u: 1, v: 2, c: 1 },
        { u: 2, v: 3, c: 1 },
    ],
    // i 是 door 所在 road 的索引（注意索引展开），d 是 door 在 road 的位置 [-1, 1]，
    // p 是开门需要的 pressure plate，p = -1 表示这扇门需要用钥匙打开，其他情况 p 是非负整数
    doorInfo: [
        { i: 0, d: 0, p: 0 },
        { i: 1, d: 0, p: 1 },
        { i: 2, d: 0, p: 2 },
    ],
    // i 是 pressure plate 所在 platform 的索引，x 和 z 是其相对 platform 的坐标
    // 一个 pressure plate 可以对应多扇门（本质上允许 and 门，不允许 or 门）
    pressurePlateInfo: [
        { i: 0, x: 0, z: -1 },
        { i: 1, x: 1, z: -0.5 },
        { i: 1, x: 1, z: 0.5 },
    ],
    // i 是 key 所在 platform 的索引，x 和 z 是其相对 platform 的坐标，y 默认为 1
    keyInfo: [],
    // i 是出生点/终点所在 platform 的索引，x 和 z 是其相对 platform 的坐标
    startPoint: { i: 0, x: 0, z: 1 },
    endPoint: { i: 3, x: 0, z: 0 },
};