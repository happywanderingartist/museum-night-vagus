# Thinker Refinement Implementation Plan

> For agentic workers: superpowers:executing-plans inline, one final independent review.

**Goal:** 精修真实灰手并交原画尺度/镜头对位预览，不提前替换作品集。
**Architecture:** 新thinker-refinement-v2，沿用真实GLB/骨骼和本地Three；新建连续弧线指体、掌骨起伏与有厚度袖口，保留旧灰模和site-v2。独立对位模式使用原画局部干净底图与真实三维前景，明确仍是灰模。
**Tech:** 本机Blender4.5.15，Three0.186.1；无新依赖、无云生成。
**Spec:** designs/2026-10-25-vagus-3d-design-proposal.md；用户继续授权造型精修。

## Constraints and rulings
手机固定不露屏，仅食指5秒滑动、2秒停顿。实际全手/玻璃、完整底面/书页接触和实际腕面固定测试全部保留，不放宽容差。灰手未获艺术确认前不做最终纹理、不宣称原画融合或房间3D完成。原图/旧站/旧灰模不写入。当前Git无HEAD，用新目录隔离，不进行初始提交。用户继续沿用已选方案/inline执行，不重问方案与执行方式。

## Review focus
1. 平滑管体仍像机械手：检查掌部收口、虎口和卷指轮廓，不靠测试冒称美观。
2. 袖口是球形接头：改有开口厚度的布褶袖管，并检查腕部交叠。
3. 改形后指腹漂移：继承实际GLB全轮71时刻检查。
4. 原画与模型比例不合：同画幅并排/叠合，记录标定残差和实际遮挡，不称完整材质融合。
5. 导出/失败/取消回退：真实Chrome模型检查与WebGL失败后备。

## Task1 — Shape refinement
- [x] 增加真实袖口开口与腕部交叠检查，旧资产应失败；保留原有18项功能测试。
- [x] 连续曲线卷指、自然掌骨轮廓、布褶袖口；指甲细节留待最终雕形；离线校准指腹，导出Blender/GLB。
- [x] 全部几何测试通过，查看背侧/接触侧/多帧实际渲染，记录造型未验收。

## Task2 — Source registration and delivery
- [x] 本机4181对照页：精修灰模、原画对位模式，背壳/近景与显式接触审查视角。普通页面文字独立，图中无新UI。
- [x] Chrome真实动作录制、暂停/减少动态/失败/取消验证；检查解压可运行和原站哈希。
- [x] 一次独立审阅，修重要缺陷，交ZIP、可编辑Blender和验证边界。

## Research
实现前使用agent-reach GitHub CLI，gh无认证，转公开GitHub网页。检索Three.js真实蒙皮/GLTF与BlenderProc相机投影。Three.js由mrdoob及贡献者维护，MIT，网页约117k星仅作规模背景；提交页可见r186及9月维护记录，非本机运行上游全套测试。复用官方GLTFLoader/AnimationMixer优点，局限是加载与骨骼成功不能判断艺术解剖。BlenderProc由DLR-RM维护，GPL3、约3.8k星，有相机投影/深度/碰撞示例；只借验证思路，不安装或复制代码，局限是其合成训练数据管线对单手雕形过重。保持当前固定版本。
来源：https://github.com/mrdoob/three.js · https://github.com/mrdoob/three.js/commits/dev/ · https://github.com/mrdoob/three.js/tree/dev/test/unit · https://github.com/DLR-RM/BlenderProc
