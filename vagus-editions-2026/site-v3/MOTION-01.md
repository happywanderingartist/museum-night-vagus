# 页面动效第一轮 · 2026-10-27

范围：完成可见的二维页面入场、滚动交接与局部环境光；不制作3D，不模拟手指或重新生成被否定的两张图。所有正文和链接默认可读，动画没有播放门槛。

## 开发前参照

agent-reach GitHub CLI 搜索 scroll animation 因未登录失败；改用网页检索 Motion 与 AOS 官方仓库。Motion 仓库显示约34.6k星，MIT，维护组织motiondivision、近期历史页可见2026-09-11提交与mattgperry；README说明自动化测试及原生JS用法。AOS约28.1k星、MIT，有Cypress与demo；星数仅作筛选，不代表质量保证。可复用优势：视口触发只播一次、滚动进度直接映射、动画中断保持阅读。局限：库不能产生缺失的透明人物/手机接触帧；为现有原生页面引入库没有必要。代码自行按现有结构实现，不复制项目代码。

来源：https://github.com/motiondivision/motion ；https://github.com/motiondivision/motion/commits/main/ ；https://github.com/michalsnik/aos ；https://github.com/michalsnik/aos/blob/next/package.json 。提交页为检索快照，不声称最新提交日期。

## 四帧

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 原图、标题、正文、入口 | R：默认完整显示 | 现有标题与真实材料状态 | 脚本失效不空白 |
| F1 | 镜头取景进入、标题与人物旁白 | A/S：入视口一次，主图650ms，首页1100ms，文字450ms、间隔60ms | 入口始终可点 | 整图运镜，非人物肢体动画 |
| F2 | 主图与文字分速交接 | S：正常滚动直接映射，无锁滚动；START路线绘制、Hug环境微光 | 阅读区保持正常文档流 | 快速滚动及hash跳转取消入场，停滚即停运镜 |
| F3 | 项目正文 | R：稳定阅读 | 仍按实际材料接入状态呈现 | 不对长文做隐藏揭示 |

```yaml
shot_id: SITE-MOTION-01
source_art: site-v3/assets existing AI-assisted artwork, untouched
layout_desktop: preserve current full / partial scene heights
layout_mobile: preserve layout, no scroll camera transform
modern_gag: existing art only; character articulation unavailable
auto_bubble: existing character quote at entry
trigger: entry once; normal scroll
transition: artwork camera + title stagger + environment highlight
transition_target_ms: 650
scroll_pin: false
click_required: [Explore, Quick Browse, Resume, enable audio]
real_content_visible_in_f3: [existing article titles, documented project content, honest missing material states]
media_assets: [existing flat WebP masters; no transparent character layers]
implementation: [WAAPI entry, rAF scroll mapping, CSS ambient light]
reduced_motion: static full content; system preference overrides manual toggle
qa: [entry once, cancellation on focus/hash/fast scroll, disabled means fully static, hidden tab pauses, no URL or input interception]
```

验证边界：先执行状态和控制器回归、全部现有测试、HTTP资源检查。浏览器视觉检查此前被自动审批账户用量限制挡住；未有解除证据前不以其他浏览器或工具绕过。代码测试不等于已在Chrome看到效果。

## 实施与验证结果

共享 scene-motion.mjs 负责所有主图运镜和一次性短标题入场；移除app.js对主图transform/标题opacity的重复控制。chapter-motion.mjs在页面首次加载时挂载，不需要先点击。新CSS由生成器加入全部10页，AI目录与作品目录也有动态开关。主图进入1100/650ms，短文字450ms、错峰60ms；阅读正文、入口、音频与导航不会被动画拦截。START路线随进入视口进度绘制；Hug循环微光仅在可见前台运行；文学节灯光只做一次入场。

21项Node回归全部通过，包括真实模块的边界替身执行、初始自动启动、只播一次、关闭取消、系统优先、后台暂停、快速滚动/hash/键盘跳过、迟到图片/失败降级、URL与服务资源。运行中的4182端口确认scene-motion.mjs返回200及JavaScript MIME。10页HTML结构审计通过。此处不是浏览器或渲染测试。原始WebP母图没有修改。

| Before | After | Why |
|---|---|---|
| 多个模块控制主图，三幕强制固定 | 共享单一主图控制器 | 避免互相覆盖transform |
| 动态开关不管画廊放大 | 手动关闭及系统减少动态都取消变换 | 动态偏好一致 |
| 新挂载误入按钮事件 | 首次加载即挂载；增加失败后通过的回归 | 保证自动播放 |
| 旁白旧观察器与新入场重复 | 移除旧观察器，新旁白保持最终可见 | 不反复消失 |

源代码审查：本轮控制逻辑与降级检查通过；视觉观感、实际Chrome播放、性能及触屏设备仍未验证，不能据代码批准最终动效品质。人物手指滑动、递票、耳机等肢体和道具动作未制作，不能用整图运镜宣称这些已完成。旧静态ZIP保留，不代表本次动效版。
