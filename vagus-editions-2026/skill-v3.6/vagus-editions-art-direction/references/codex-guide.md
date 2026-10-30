# 安装与调用

3.1 背景调用：使用 $vagus-editions-art-direction，读取 background-art-direction.md，为本页填完整背景brief；先检查终帧、明暗结构、真实中文区域和素材缺口，给整幅无字母版与同源分层的制作合同及提示词。只写Skill／只分析时不运行生成。正式制作以后分别交UI关／开、边缘细节和关键滚动进度的审阅证据，不把几何夹具当美术完成。

3.0 目标效果调用示例：使用 $vagus-editions-art-direction 的效果重建模式；读取 asset-contract.md 与 effect-recipes.md。先给逐项效果矩阵和真实素材差距，再迁移包内参考时间线到现有技术栈。目标包括取景拉开、分层差速、巨字到说明、材料边界到正文和可逆恢复；保留 Vagus 文案／颜色约束。没有项目代码时仅验证包内夹具，不擅自建正式网站；正式实现须交可运行页面、同画幅关键帧、原生滚动与降级证据。不要把只做缩小淡出叫作同样效果。

本机目标 D:/AI-Data/Shared/skills/vagus-editions-art-direction，经已有 C:/Users/15049/.agents/skills 联接发现。ZIP 顶层目录下直接含 SKILL.md。更新前比较版本、备份，更新后核对哈希。文件已安装不等于运行中会话刷新；技能选择器应确认版本。

[官方创建说明](https://learn.chatgpt.com/docs/build-skills)与[管理说明](https://learn.chatgpt.com/docs/enterprise/skills)区分本地、工作区和插件。Codex 可 $ 调用，ChatGPT 桌面有可用入口时可 @ 选择；本机安装不自动同步网页版／手机。账户有 Skills 上传入口可上传 ZIP；无入口时上传完整 Markdown 当聊天／项目规则，不称原生 Skill 安装或自动触发。具体能力以账户实际入口为准。

```text
使用 $vagus-editions-art-direction。
先读真实原稿、项目约束与 visual-study.md。
为思想者选构图路线，解释命题、主次和裁切；不靠增加自然背景填空。
保留 AI行业观察、置顶品牌导航、竖排文字入口和自然段简介。
先交黑白视觉重量稿和字体对照；获准制作后交无字素材、独立 UI、预览和短分镜。
不编作品、数量或经历；按检查表分开报告结构、视觉、行为与用户接受。
```

只分析不生成；只要提示词不运行；推进视觉不顺便发布。实现前审阅 GitHub 成熟先例，记维护、许可证、活动、测试、用法、优势与局限；历史记录不能替代引入前当前兼容性检查。不强制安装三维或滚动依赖。

默认 Chrome，异常先看连接与页面，再新建受控会话验证；未经授权不清空资料、重装或换浏览器。调试横条只证明附加状态，须用截图与导航验证；仍超时就披露，不能宣称永久修复。

## 浏览器内核故障与固定视口采样

2026-10-30 的实际阻断是 Codex `node_repl`／Computer Use 在内核启动阶段报 `failed to write kernel assets: 系统找不到指定的路径 (os error 3)`，浏览器尚未进入控制阶段。排查确认：同类 `node_repl` 用全新进程可以启动，说明 Chrome 和页面不是根因；清理单个旧 `active_execs` 记录与当前会话服务进程仍未解除，完整修复需要重启 Codex 应用会话。不要在反复失败时假装已修复，也不要用系统截图替代可复现的页面状态。

在不改变用户既有 Chrome 会话的前提下，可启动独立用户目录的 Google Chrome，用 Playwright 连接系统安装的 `chrome.exe` 继续公开页面研究。必须使用 D 盘隔离 profile，记录视口、滚动输入、DOM、截图和失败边界；结束后关闭该实例。没有 Playwright 录屏依赖时，用关键滚动状态截图代替视频，不能声称记录了完整连续动画。

固定视口网站按 `p` 状态抽样：记录滚轮次数与间隔、可见标题、Canvas 尺寸、固定导航、截图；`window.scrollY` 为 0 不代表没有滚动。Lusion 以及部分 WebGL 场景可能在自动化冷启动时留下完成态画布的黑帧，先等待网络和 `is-ready`，只在确认加载包装层已完成宽度为 0 或 `display:none` 后隐藏其空白 Canvas，才能观察；此操作仅用于研究并须写进证据边界。
