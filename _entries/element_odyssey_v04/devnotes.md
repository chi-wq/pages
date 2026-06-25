---
title: 开发笔记
permalink: /entries/element-odyssey-v04/devnotes/
tags: [游戏, 开发笔记, Genshin-TS]
summary: "v0.04 技术难点与踩坑记录。"
description: "元素试炼：深渊回廊 v0.04 的开发笔记。Genshin-TS 约束、踩坑记录、技术难点的解决方案。"
wiki_key: element-odyssey-v04
wiki_order: 50
---

- 返回: [元素试炼：深渊回廊 v0.04]({{ '/entries/element-odyssey-v04/' | relative_url }})

> 本文档记录 v0.04 开发过程中遇到的技术难点、Genshin-TS 框架的约束和踩坑经验。

---

## 迂回方案总览

Genshin-TS 的本质是将 TypeScript 代码编译为千星奇域的节点图。但 **TypeScript 的世界观（变量、对象、函数调用）和节点图的世界观（引脚、连线、同构数据）存在根本差异**。这些差异导致了许多"在 TS 中理所当然、在节点图中行不通"的情况，整个项目中充满了各种迂回方案。

### 概念映射：JS/TS 习惯 → 千星奇域等效做法

在阅读迂回方案之前，先理解一个核心事实：**千星奇域的节点图不是图灵完备的通用编程环境**——它是用于编排游戏逻辑的可视化节点系统。Genshin-TS 试图用 TS 子集来生成节点图，但两者之间存在根本的概念鸿沟。

下面把 JS/TS 中熟悉的概念映射到千星奇域中的等效做法：

| JS/TS 中的习惯 | 千星奇域中应该用 | 说明 |
|---------------|-----------------|------|
| `{ key: value }` 对象/结构体 | **平行 list + 索引关联**（deriveConfig） | 千星奇域结构体无法在代码中使用，只能拆成多个 list |
| `arr[i]` 数组索引 | **`f.getCorrespondingValueFromList(list, idx)`** | 节点图没有内存随机访问，必须通过 getter 节点 |
| `if (cond) { ... } else { ... }` | **`f.doubleBranch(cond, 真, 假)`** | gsts 布尔对象在 JS `if` 里永远是 truthy |
| `a + b` 算术运算 | **`f.addition(a, b)` / `f.subtraction(a, b)`** | `+` 编译为 `f.addition()`，仅支持数值 |
| `a + b` 字符串拼接 | **在模块作用域预拼接** | `f.addition()` 不支持字符串 |
| `Math.random()` | **`f.getRandomInteger(min, max)` / `f.getRandom()`** | 顶层 `Math.random()` 在构建时就固定了 |
| `for (let i = 0; i < n; i++)` | **`f.finiteLoop(0, n-1, callback)`** | 节点图只支持有限循环 |
| `while (true)` | **`setInterval` 定时器循环** | `while(true)` 有执行上限 |
| `let x = 0; x++` 可变变量 | **graph 变量 `f.get()`/`f.set()`** | 节点图没有栈内存，变量就是图节点 |
| `const x = fn(arr[i])` | **`f.initLocalVariable` + `f.setLocalVariable`** | 回调体内无法直接读取 list 取出的值 |

| `Promise` / `async / await` | **不支持** | 节点图没有异步运行时 |
| 递归函数 | **不支持** | 节点图不能自我嵌套 |
| `JSON.parse` / `JSON.stringify` | **不支持，在模块作用域预计算** | 节点图作用域没有这些 API |
| `Object.keys()` / `Object.values()` | **不支持，在模块作用域预计算** | 同上 |
| `class` / `new` | **不支持** | 节点图作用域不能实例化对象 |
| `console.log(x)` | **`print(str(x))` 或 `console.log(x)`（限 1 个参数）** | `console.log` 被编译为 `print` |
| `import / require` | **仅在模块作用域可用** | 节点图内不能动态 import |
| `null / undefined` | **`entity(0)` 作占位符** | 节点图有类型系统，空用 0 值实体 |
| 事件监听 `addEventListener` | **`g.server({id}).on('事件名', callback)`** | 节点图事件绑定机制 |
| 消息传递 `emit / dispatch` | **`send('信号名')` + `onSignal()`** | 节点图间通过信号通信 |
| TypeScript 类型自动推断 | **`as unknown as bigint` 强制覆盖** | gsts 编译器有时推断错误类型 |
| `element.id = 5` 属性赋值 | **`orb.setCustomVariable('element', value)`** | 自定义变量是节点图的属性机制 |

> 理解了这个映射，再看下面的具体迂回方案，就会清楚每一个迂回背后都是"JS 习惯 → 节点图现实"的翻译过程。

---

### 关键概念：预编译（模块作用域 vs 节点图作用域）

在深入具体迂回方案之前，必须先理解 Genshin-TS 中最重要的概念——**两个作用域的分离**：

```
┌────────────────────────────────────────────────────────┐
│  模块作用域（编译时 / Node.js 环境）                     │
│  - 在 npm run build 时执行                              │
│  - 可以使用完整的 JS/TS：import、JSON、Math、字符串拼接  │
│  - 最终产物是 gsts list / dict 等静态数据                │
│  - 示例：deriveConfig、安全位置预计算、常量定义           │
├────────────────────────────────────────────────────────┤
│  节点图作用域（运行时 / 千星奇域环境）                    │
│  - 在游戏内实际执行                                      │
│  - 只能用 gsts 支持的 TS 子集                            │
│  - 所有操作都被编译为节点图中的节点和连线                  │
│  - 示例：g.server().on(...) 内部、gstsServer* 函数内     │
└────────────────────────────────────────────────────────┘
```

**预编译**指的是：把那些节点图作用域做不到的事情（JSON 解析、复杂计算、字符串处理），在模块作用域提前做好，把结果作为静态数据传给节点图使用。

这种模式的典型例子：

```typescript
// === 模块作用域（编译时）=== 
// 这里可以用完整的 JS 能力
const safePositions: [number, number][] = []
for (let x = -10; x <= 10; x += 3) {
  for (let z = -10; z <= 10; z += 3) {
    if (!tooCloseToPlayer(x, z)) {
      safePositions.push([x, z])  // ✅ 完整 JS 语法
    }
  }
}
// 结果：44 个安全坐标，编译为静态 list
// 上述代码在 src/systems/orbSystem.ts 的模块顶层

// === 节点图作用域（运行时）===
g.server({ id: 1073741829 }).on('whenEnteringCollisionTrigger', (evt, f) => {
  // 这里只能用 gsts API
  const x = f.getCorrespondingValueFromList(list('int', safeXs), idx)  // ✅ 索引预计算好的数据
  // ❌ 不能在运行时做 Math.random() 或 for 循环遍历网格
})
```

这就是为什么概念映射表中很多条目写着"在模块作用域预计算"——**这是 Genshin-TS 提供的最大迂回通道**。每当在节点图作用域遇到无法实现的操作时，就退回到模块作用域完成计算，只把结果传入节点图。

> 简单记法：**"能提前算好的，绝不到运行时再算。"**

---

以下是按类型分类的全部迂回方案一览：

### 数据结构类

| 迂回 | 原因 | 解决方案 |
|------|------|---------|
| **`deriveConfig` + 展平数组 + offset**（`src/types/config.ts`） | 千星奇域结构体无法在代码中使用，节点图只认同构 list | 编译时将 JS 结构体数组拆成多个平行 list，运行时通过 `Starts`/`Counts` 偏移量索引 |
| **dict 无放回随机池**（`src/systems/orbSystem.ts`） | `f.insertValueIntoList` 等无法跨函数持久化 | 用 graph 变量 `dict(int, bool)` 做池，`f.getRandomInteger` 抽 key 后立即移除 |
| **模块作用域预计算安全位置**（`src/systems/orbSystem.ts`） | 节点图内不能做网格遍历和距离计算（只能用有限循环） | 编译时在顶层用 JS 计算 44 个安全坐标，运行时只索引 |

### 控制流类

| 迂回 | 原因 | 解决方案 |
|------|------|---------|
| **`f.doubleBranch()` 代替 `if`** | 比较 API 返回的是 gsts 布尔对象，在 JS `if()` 里永远是 truthy | 用 `f.doubleBranch(条件, 真分支, 假分支)` 编译为条件图节点 |
| **`f.addition()` 代替 `+`** | 回调体内 `+` 被编译为 `f.addition()`（仅支持数值），字符串会报错 | 回调体内所有算术用 `f.addition()`/`f.subtraction()`；字符串在模块作用域预拼接 |
| **`initLocalVariable` + `setLocalVariable` 包装** | `finiteLoop` 等 API 的回调体内无法直接读取从 list 取出的原始值 | 先用 `initLocalVariable` 创建局部变量包装器，再用 `setLocalVariable` 赋值，回调体内读 `.value` |

### 类型系统类

| 迂回 | 原因 | 解决方案 |
|------|------|---------|
| **`as unknown as bigint`**（`src/graphs/playerMain.ts`） | gsts 编译器将事件属性（如 `evt.selectionResultList`）错误推断为 `entity[]` | 用 `as unknown as bigint` 覆盖 TypeScript 类型，编译器 `getTypeAtLocation` 从而正确识别 |
| **`list('int', [...])` 显式类型化** | 空数组无法推断元素类型 | 使用 `list()` 全局函数显式指定类型，如 `list('int', [])` |

### 作用域与生命周期类

| 迂回 | 原因 | 解决方案 |
|------|------|---------|
| **模块作用域预计算** | 节点图运行时不能用 `Math.random()`、`JSON.*`、`Object.*`、字符串 `+` 拼接等 | 在模块顶层（编译时）完成所有需要这些 API 的计算，运行时只使用结果 |
| **`clearInterval` 通过 stage 标志位停止**（`src/systems/stageFlow.ts`） | 编译后 `clearInterval` 依赖回调内 `evt.timerName`，无法从外部清除 | 在回调内检查 stage 标志位，由回调自行 `clearInterval` |
| **`setTimeout` 延迟 10ms 做二段攻击**（`src/systems/elementSystem.ts` + `src/graphs/elementAttack.ts`） | 节点图没有"先 A 后 B"的执行顺序保证，需要用定时器人为制造时序 | 副元素附着（系数0）→ `setTimeout(10ms)` → 主元素一击（系数1） |

### 编辑器绑定类

| 迂回 | 原因 | 解决方案 |
|------|------|---------|
| **浮空交互页挂在 `playerMain`** | `whenFloatingInteractionPageIsTriggered` 挂场景实体上无法触发 | 事件必须挂在玩家实体（`playerMain.ts`），不能挂在场景实体（`stageMain.ts`） |
| **信号用 `defineSignal` 定义** | gsts 要求信号必须在 `// @gsts:signals` 标记的文件中定义，否则编译失败 | 在 `signals.ts` 中用 `defineSignal()` 声明每个信号的名称和参数类型 |
| **资源 ID 用 `CustomPrefab` 枚举** | gsts 从编辑器扫描到的预制体 ID 必须放在 `// @gsts:resources` 标记的文件中 | 自动生成的 `prefabs.ts` 中定义枚举，代码中通过 `CustomPrefab.Orb` 引用 |
| **消息队列的 struct 在编辑器中配**（`src/utils/stageUtils.ts` 的 `gstsServerSendNotificationMsg`） | 结构体无法在代码中拼装 | 消息队列的模板内容在编辑器中预配置，代码只通过 `send(Signal.UpdateNotificationMsgList)` 按 ID 触发 |
| **换行符用 `\\n` 而非 `\n`** | `\n` 会被 JS 编译为真正的换行符（ASCII 10），导致 UTF-8 编码报错 | 用 `\\n` 编译后保留字面量 `\n`（两个字符），编辑器正确解释为换行 |

### 命名约定类

| 迂回 | 原因 | 解决方案 |
|------|------|---------|
| **`gstsServer*` 前缀** | gsts 编译器要求所有调用 `send()` 或 gsts API 的顶层函数必须以 `gstsServer` 开头 | 所有工具函数和系统函数强制 `gstsServer` 前缀，且只能有尾部单 `return` |

---

## Genshin-TS 约束与注意事项

### 作用域分离

- **顶层（编译时）**：文件读取、npm 库使用、预计算均可。但此处**不要**调用 `g.server` 或 gsts 运行时 API。
- **节点图（运行时）**：仅可使用支持的 TS 子集。此处编写的逻辑将编译为节点图。

### 控制结构与 return

- `if/while/switch` 的条件必须是 `boolean`，必要时使用 `bool(...)`
- `gstsServer*` 函数**仅允许末尾单个 `return <expr>`**
- 节点图作用域不支持递归、`async/await`、Promise
- `while(true)` 有循环上限限制，使用定时器或显式计数器替代

### 数值与类型

- `number` 是 **float**，`bigint` 是 **int**
- 取模/位运算请使用 `bigint`
- List/dict 必须是同类元素（homogeneous），混合类型会导致失败
- 空数组可能无法推断类型，放入类型化占位符或使用 `list(...)`
- 优先使用 `int`、`float`、`vec3`、`configId`、`prefabId`、`entity` 等显式辅助函数

---

## 踩坑记录

### 1. 编译时 `Math.random()` 无用

模块顶层的 `Math.random()` 在 `npm run build` 时执行一次，值就固定在编译产物里了。每次游戏运行都是同一组"随机"数。

**解决方案**：所有随机逻辑必须在节点图运行时通过 `f.*` API 调用：
```typescript
// ✅ 正确的运行时随机
f.getRandomInteger(int(0), int(3))
f.getRandom()

// ❌ 无意义的编译时随机
const x = Math.random()  // 值在构建时固定
```

### 2. 运行时无放回随机池（dict 方案）（`src/systems/orbSystem.ts`）

gsts 的 `f.emptyList` / `f.insertValueIntoList` / `f.removeValueFromList` 在同一个函数内可用，但无法跨函数持久化。

**解决方案**：使用 dict 作为持久化池：
1. 声明 graph 变量：`orbPool: dict('int', 'bool', null)`
2. 填充：`f.setOrAddKeyValuePairsToDictionary(dict, key, value)`
3. 取 keys：`f.getListOfKeysFromDictionary(dict)` → 运行时 keys 列表
4. 移除：`f.removeKeyValuePairsFromDictionaryByKey(dict, key)`

### 3. 回调体内不能用 `if` 判断

`f.lessThan`、`f.greaterThanOrEqualTo` 等比较 API 返回的是 gsts 布尔对象，在 JavaScript `if()` 里永远是 truthy。

```typescript
// ❌ 错误：if 对 gsts 布尔对象永远是 truthy
if (f.lessThan(y, float(2.5))) { ... }

// ✅ 正确：用 doubleBranch 编译为条件图节点
f.doubleBranch(
  f.greaterThanOrEqualTo(y, float(2.5)),
  () => { /* 条件为真时 */ },
  () => { /* 条件为假时 */ }
)
```

### 4. 回调体内算术不能用 `+`/`-` 运算符

gsts 编译器将 `+` 编译为 `f.addition()`（仅支持数值），传字符串会报错。

```typescript
// ❌ 错误：回调体内 + 被编译为 f.addition()
const result = a + b

// ✅ 正确：回调体内用 API 方法
const result = f.addition(a, b)

// ❌ 错误：回调体内拼接字符串
const msg = '使用了' + itemName + '道具'

// ✅ 正确：在模块作用域预拼接
const msg = '使用了【' + itemName + '】道具'  // 模块作用域的 + 是 JS 原生运算
```

### 5. 类型推断错误用 `as unknown as bigint` 修复（`src/graphs/playerMain.ts`）

当 gsts 编译器将事件属性的元素错误推断为 `"entity"` 时：
```typescript
// 事件属性中的 selectionResultList 被错误推断为 entity[]
const result = evt.selectionResultList as unknown as bigint[]
const selectedCard = f.getCorrespondingValueFromList(result, int(0)) as unknown as bigint
```

`as` 断言会影响 `env.checker.getTypeAtLocation(decl.name)` 的结果，让编译器正确推断类型。

### 6. 字符串中的换行写法

```typescript
// ❌ \n 会被编译为真正的换行符（ASCII 10），导致 UTF-8 编码报错
str('第一行\n第二行')

// ✅ 使用 \\n 编译后保留字面量 \n，编辑器正确解释为换行
str('第一行\\n第二行')
```

### 7. 悬浮交互页必须挂在玩家实体上

`whenFloatingInteractionPageIsTriggered` 事件必须挂在玩家实体（`playerMain.ts`）上，不能挂在场景实体（`stageMain.ts`），否则按钮点击无法触发。

### 8. 定时器注意

- `setInterval` 返回值类型是 `string`（定时器句柄名），不是 `bigint`
- 编译后 `clearInterval` 依赖回调内 `evt.timerName`，无法通过 `stage.get` 中转后再从外部清除
- 需要从外部停止 interval 的推荐做法：在回调内检查 stage 标志位，由回调自行 `clearInterval`（见 `src/systems/stageFlow.ts` 中 `gstsServerStartStageIntervalTimer` 的实现）

### 9. 字典 (dict) 限制

顶层 `dict(pairs)` 创建的 `ReadonlyDict` 不能作为字面量传入 `f.queryDictionaryValueByKey()` — gsts IR 不支持序列化字典为内联值。

字典的正确用法：运行时 `f.assemblyDictionary()`、图变量声明、或空占位 `dict('str','float',null)`。

### 10. `gstsServer*` 函数前缀规则

任何调用 `send()` 或 gsts API 的顶层函数**必须**以 `gstsServer` 开头，否则编译器报错。

函数只能有一个尾部 `return`，不能在 `if`/`loop`/`switch` 内部使用 `return`。

---

## 结构体（Struct）API 限制

千星奇域支持自定义结构体（在编辑器中定义字段，如 `Msg: string`），每个结构体类型有一个 `configId`。

Genshin-TS 提供了三个相关 API：
- `f.assembleStructure()` — 拼装结构体
- `f.splitStructure()` — 拆分结构体
- `f.modifyStructure()` — 修改结构体

**但这些 API 无法在 Genshin-TS 代码中完整使用**，原因如下：

1. **无法指定结构体类型**：`assembleStructure` 等 API 编译后生成的是空模板节点（节点 ID 300002~300004，无输入/输出引脚），TypeScript 侧无法传入结构体的 `configId`
2. **类型绑定必须在编辑器中操作**：注入 GIA 后，需要在千星奇域编辑器中手动找到这些节点，选择结构体类型，编辑器才会自动生成对应的引脚
3. **字段赋值也在编辑器中完成**：结构体的字段值不能在代码中赋值，需要在编辑器的节点面板中手动填写

**实际做法**：
- 结构体的类型绑定和字段赋值全部在千星奇域编辑器中手动完成
- Genshin-TS 只负责触发——例如 `f.refreshNotificationQueue(queueIndex, itemId)` 接受 `itemId: int`，结构体内容在编辑器的消息队列模板中预配置，代码只按 ID 触发显示
- 本项目中的消息队列通知（`gstsServerSendNotificationMsg`）就是这种模式：结构体在编辑器中配好，代码只发信号和 ID

> 总结：结构体是编辑器侧的功能，Genshin-TS 无法替代编辑器的可视化操作。如果需要使用结构体，必须注入后在编辑器中手动配置。

---

## deriveConfig 使用注意（`src/types/config.ts`）

### 模块作用域提取标量

```typescript
// ✅ 正确：在模块作用域提取，编译为数值常量
confirmConfig.Type1  // → int(1)

// ❌ 错误：在图回调内直接索引普通 JS 数组
confirmConfig.type[0]  // → 编译为 f.getCorrespondingValueFromList() 但数据不是 gsts list
```

### keyField 主键标量

```typescript
// 按字段值生成命名标量，不依赖数组索引位置
const confirmConfig = deriveConfig(data, {}, undefined, 'type')
// → confirmConfig.Type1, confirmConfig.Type2, ...
```

---

## NodeGraph ID 对照

| 图名 | v0.03 ID | v0.04 ID | 变化 |
|------|---------|---------|------|
| StageMain | 1073741828 | 1073741854 | ✅ 变更 |
| ElementAttack | 1073741853 | 1073741853 | 不变 |
| GetOrb | 1073741829 | 1073741829 | 不变 |
| PlayerMain | 1073741837 | 1073741837 | 不变 |
| EnemyElementAttack | — | 1073741855 | 🆕 新增 |
| ScanTagReady | — | 1073741856 | 🆕 新增 |

### 注入配置

```typescript
// v0.04 gsts.config.ts
{
  gameRegion: 'China',
  playerId: 344728135,       // 注意：与 v0.03 的 873740275 不同
  mapId: 1073741826          // 注意：与 v0.03 的 1073741825 不同
}
```

---

## 构建与部署

```bash
npm install          # 安装依赖
npm run dev          # 增量编译（自动注入）
npm run build        # 完整编译
npm run maps         # 列出最近保存的地图
npm run backup       # 创建回滚备份
```

### 编译流程

```
TS 源码 → .gs.ts（节点函数调用形式）→ IR .json（节点和连接）→ .gia（可注入输出）
```

调试时若遇到问题，优先对比 `.gs.ts` 和 `.json` 文件来定位差异。
