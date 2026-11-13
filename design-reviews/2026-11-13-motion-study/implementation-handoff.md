# 下一轮设计交接

先读同目录 `2026-11-13-vagus-product-motion-prompt-v2.md`、`DESIGN.md` 与 `design-contract.md`，随后核对现有 Figma `ar9JyK99MdbQgLsZEsxLiT` 和网站审稿副本。

先交付三组可核对的设计成果。蒙娜丽莎到展厅制作五帧，标出眼睛测量点、近远层、遮挡、目录出现与稳定终态。START 与 HUG 各制作一张 390 × 844 核心屏及对应桌面、手机产品详情排布，所有主要控件独立可编辑。

配色、字体语气、产品阶段、动作和状态按 v2 提示词。390px 手机基准、进入距离、分段、幅度与时间均为提案，随第一轮画面校准。原画的有效像素、人物视角、清底与接触关系先列资产审计结果。

GSAP 3.15.1 核心与 ScrollTrigger、Anime.js 4.5.0 位于 `D:/Downloads/vagus-motion-kit-2026-11-13`，来源和指纹见 `manifest.json`。资料包完成下载与文件检查，接入与实际画面另行验证。

进入实现时先检查 `gallery-entry.mjs`、`chapter-motion.mjs`、`scene-motion.mjs`、`character-motion.mjs` 与 `product-demo.mjs` 的属性归属。连续滚动采用一个进度源，元素采用一个动画负责人。局部试验与现有审稿页面分别记录结果。

首轮画面应证明停住可读、推进连贯、项目完整可达、手机比例正确、状态与返回清楚。核对普通进入、停止、反向、连续操作、键盘、减少动态和素材失败，再逐步补齐后续状态。
