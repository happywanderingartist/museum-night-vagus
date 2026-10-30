# VAGUS 项目协作规则

## 自动调用项目 Skills

- 处理本项目的艺术指导、作品集视觉、分镜、动效、Remotion、素材制作、前端实现、响应式、无障碍、性能或验收工作时，先从 `.agents/skills/` 识别并调用所有与当前任务直接相关的 Skill，再开始实质工作。无需等用户再次点名 Skill。
- 调用前完整读取相关 `SKILL.md`；如其中引用了完成当前任务所必需的项目内参考文件，也一并读取。多项 Skill 互补时组合使用；不加载与任务无关的 Skill。
- 分镜与名画首屏设计优先调用 `vagus-storyboard`。涉及 Remotion 时先调用 `remotion-best-practices` 路由，再按任务调用 `remotion-create`、`remotion-markup`、`remotion-studio`、`remotion-render` 等具体 Skill。
- 如果项目 Skill 缺失、无法读取或当前 Codex 会话尚未发现它，先说明具体限制；在可访问的情况下直接读取项目中的 Skill 文件继续工作，不要因此静默跳过。

## 项目范围

- 先遵守项目中的最新 VAGUS 设计方案、真实作品证据与素材授权状态。
- 分镜、艺术指导、评审和安装 Skills 不等于获准开发网站、生成图像或制作动画；这些仍按用户当前请求的范围执行。
- 不编造作品、经历、项目数据或已完成状态。真实作品阅读、快速导航、无障碍降级和减少动态偏好不得被动效阻塞。
