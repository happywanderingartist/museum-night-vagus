# A01 关于页完整场景候选
2026-10-30。依据 research/2026-10-30-motion-reset/REVIEW-AND-DECISION.md 的固定版本源码研究，不新增运行依赖。当前版本保留在 site-v4:4184，候选独立4190。

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 原画完整、标题与阅读入口 | R: 无需等待 | 真实作者介绍入口 | 不改人物和背景像素 |
| F1 | 画面轻微等比推进、人物旁一句话 | A: 台词与文字短入场；光影缓慢循环 | 入口始终可点 | 禁用拆肢、深度网格和拉伸 |
| F2 | 原画慢于正文移动，纸色阅读区接入 | S: 正常滚动，无锁屏 | 介绍立即进入视野 | 无人为额外滚动距离 |
| F3 | 正文、目录、作品入口 | R: 阅读内容静止 | 沿用现有真实内容和缺失材料说明 | 无虚构经历 |

shot_id: ABOUT-A01
source_art: site-v4/assets/about.webp，现有项目素材，不重新生成
layout_desktop: 原画大幅呈现，左侧标题；正文正常文档流
layout_mobile: 保留已有裁切与字级，关闭镜头位移
modern_gag: 原图中的名片，仅静态保留
auto_bubble: 看完展了，来认识一下作者？
trigger: 页面进入一次；普通滚动
transition_target_ms: 550
scroll_pin: false
implementation: 单一原生JS控制器 + CSS transform/opacity + WAAPI入场
reduced_motion: 原图原比例；不播放循环和入场
qa: 画框笔直；袖口连贯；文字无阻挡；往返滚动自然；关闭动态即时静止

验收：实际浏览器首屏、滚动正文、返回、开关、连续至少24秒；先1440级桌面。测试状态见VALIDATION.md，不以HTTP或单测替代视觉结论。
