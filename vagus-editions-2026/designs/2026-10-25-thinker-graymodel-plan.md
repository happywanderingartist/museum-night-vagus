# Thinker Gray Model Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline, test-driven steps and one fresh final review. No per-task implementation agents.

**Goal:** 按已确认设计先交思想者三维灰模，核对手/手机/古书/桌面的真实体积、骨骼动作和遮挡，再进入美术材质阶段。

**Architecture:** 独立gray-model-lab；本地Blender构建连续手部网格、指节骨骼、静态手机/书/桌面和7秒导出动画。现有Three.js加载真实GLB播放；检查页面有完整/近景/辅助接触视角和关键帧，默认背壳视角不露屏。现有site-v2与free-motion-lab不修改。

**Tech Stack:** 已有Blender4.5.15 LTS、Three0.186.1、Node测试及隔离Google Chrome；不安装、不云端生成、不使用付费服务。

**Spec:** designs/2026-10-25-vagus-3d-design-proposal.md；用户“按计划进行”确认该路线。阶段1灰模先接受，再推进材质与其他章节。

## Global Constraints

- 默认及构图/近景视角只见背壳/侧边，不转手机、不露屏；显式“接触检查”可查看另一侧，仅用于审阅，不是网站镜头。
- 手机与书静止，只有食指5秒内约3次短上划及回位，5–7秒固定，再循环；腕部、前臂、其余手指固定。
- 手是有厚度的真实网格并由骨骼驱动，不再拉伸原画；灰模造型尚需用户艺术接受，不冒称完成雕刻。
- 必须核验手机底部与书页有实际接触，指腹贴玻璃而不穿壳；不仅检查单个锚点。
- 保留原站、母版和历史包；新文件在D盘同项目gray-model-lab。Git无HEAD，目录隔离，无擅自初始提交/清理。
- 系统减少动态优先；离屏/后台暂停；所有控制和参考图可在WebGL失败时阅读。

## Review Focus

1. 导出GLB与Blender内不同：测试实际skinning和动画，不只测轨迹公式。
2. 指尖正确但指腹/关节穿壳：采样真实变形网格的表面和接触距离。
3. 手机固定却悬空：用实际手机底部和书表面比较承托距离。
4. “不露屏”与检查视角混淆：默认/近景保持背侧，接触检查清楚标为审核视角。
5. 暂停/系统减少动态/后台恢复：有效时钟不追赶，自动与关键帧模式区分。

## Task 1 — Motion contract and actual asset tests

Files: gray-model-lab/motion.mjs、tests/motion.test.mjs、tests/asset.test.mjs。
Interfaces: sampleMotion(seconds,{reduced}) -> {time,phase,stroke}; ActiveClock沿用已验证实现；测试GLTFLoader实际加载assets/thinker-gray.glb并求动画后顶点。

- [x] 先写5+2、固定手机/腕、默认观察方向、实际有厚度/绑定、书页承托和真实变形指腹距离检查；运行观察缺资产/模块失败。
- [x] 实现motion模块；沿用既有7秒三次上划时间合同；运行时序检查通过。

## Task 2 — Build Blender gray assembly

Files: scripts/build-gray.py、assets/thinker-gray.blend、assets/thinker-gray.glb、assets/model-audit.json、evidence/gray-overview.png。
Interfaces: GLB节点Phone、Screen、HandMesh、HandRig、WristAnchor、Book、BookSupport、SleeveSocket、Table；单一7秒clip。

- [x] 创建连续体积手网格：掌部/前臂/弯曲指体合并平滑，食指三节真实骨骼与权重；不复用旧球体代理作为成品。
- [x] 建立玻璃面上的接触目标，以两节骨解算和固定末节朝向满足食指上划；原始/导出实际网格分别检查，不用网页逐点修补手面。
- [x] 建立书页承托、手机后壳、桌面和袖口定位；导出GLB及可编辑blend。
- [x] 运行真实资产全套测试与Blender静态检查；查看完整和近景，有问题先修几何再贴材质。

## Task 3 — Local review and delivery

Files: index.html、style.css、app.mjs、server.cjs、scripts/browser-review.cjs、README.md、VALIDATION.md、SOURCES.md及ZIP。
Interfaces: createStage(canvas,{signal}) -> render(seconds),setView(name),dispose；用户模式live/0/1/2.6/5.5/8秒，暂停恢复与系统减少动态。

- [x] 做独立本机检查页，默认无鼠标绕拍；显式近景/接触侧面审阅；保留已有作品链接和原画参照。
- [x] 测试固定时钟、HTTP白名单、静态/失败降级；隔离Chrome实际逐帧近景与完整7秒以上录像，明确关键帧不是实时录制。
- [x] 一次独立代码/几何审阅，修重要问题；记录可运行、几何检查、视觉待接受三种边界；导出白名单便携包并解压复测。

Research: 实现前核查Three.js官方SkinnedMesh/GLTFLoader与测试组织（mrdoob及贡献者、MIT、公开约117k星仅作背景），复用成熟骨骼/GLB加载优势，局限是加载成功不说明手的解剖或美术正确。参考DLR-RM/BlenderProc（GPL3、约3.8k星）的模型/相机/灯光/碰撞分开验证方法；不安装或复制其代码，避免为单一手部引入整套数据合成管线。官方网页个别测试/IK文档抓取失败，记录而不视为已运行；依赖使用本机固定版本。
