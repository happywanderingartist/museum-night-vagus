# Thinker Free Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 配好免费Blender与Three.js，交付一幕可运行、可暂停和可审阅的思想者局部动作试稿。

**Architecture:** 原图不覆盖，新建独立试制目录。无框架HTML保留真实文字，纯时间线模块控制Three.js和Blender导出的GLB，开发服务器只监听127.0.0.1。

**Tech Stack:** Node内置测试/HTTP、Three.js 0.186.1（MIT）、Blender 4.5.15 LTS免安装包、原生CSS。

**Spec:** DESIGN.md；最新用户动作确认优先于旧Skill示例。当前请求“帮我搞定”授权直接执行该免费试制，不再次询问执行方式。

## Global Constraints

- 只新增free-motion-lab和toolchain内本任务文件；原型、原图和授权目录不覆盖，不充值、不上传。
- 滑动5秒，停顿2秒；首次露屏只一次，2.6秒内回位；后续循环不再露屏。
- 页面隐藏、离屏、阅读状态、减少动态均不持续运行；恢复不追赶失去的时间。
- 原画不是完整三维人物，作品原文未接入不能编造；静态后备和导航不依赖WebGL。

## Review Focus

- 首次动作未结束就离开：回来不重新露屏，也不发生时间快进。
- 字体/模型迟到、WebGL失败：文字仍可用，没有空白等待屏。
- 200%文字与窄窗口：入口不被画面或控制条遮挡。
- 真实GLB含动画而非只改背景；5–7秒动作应保持不变。
- 文件服务器拒绝目录穿越、凭据目录和任意本机文件。

### Task 1: 免费环境与模型

Files: toolchain/Blender免安装文件；scripts/build-thinker.py；assets/gesture.glb；assets/asset-audit.json；tests/assets.test.mjs。

Interface: GLB节点PhoneBody、Screen、Wrist、IndexTip；动画通道覆盖0–7秒。asset-audit.json记录工具版本、来源hash、真实几何与静止段，不伪造通过状态。

- [x] 校验官方SHA256后解压，运行版本和后台渲染冒烟；不改系统PATH。
- [x] 先写资产合同测试并观察缺失资产失败，再制作模型和动画。
- [x] 生成.blend、GLB、静态预览，读取GLB结构并核对动画变化/停顿。

### Task 2: 动作时间线与网页

Files: motion.mjs、scene.mjs、app.mjs、index.html、style.css、tests/motion.test.mjs。

Interface: sampleMotion(seconds,{introSeen,reduced})返回phase、cycleTime、peek、stroke、lift；ActiveClock.setRunning(bool,now)/tick(now)/skipIntro()控制有效可见时间。

- [x] 先写首次/回位/循环/停顿/暂停/减少动态测试，观察真实行为失败。
- [x] 实现纯时间线，所有测试转绿。
- [x] 接入真实GLB与分层原画，真实HTML入口可用，失败保留原图。
- [x] Chrome已核对首次/停顿/第二轮关键帧、自然播放状态、暂停/恢复及阅读离屏暂停；关键帧与自然播放分开标注。
- [ ] 完整首次7秒动作录屏、系统减少动态与真实设备组合验收留待下一阶段，不伪称覆盖。

### Task 3: 交付与回归

Files: server.cjs、tests/server.test.cjs、README.md、VALIDATION.md、SOURCE-REVIEW.md、progress.md。

- [x] 先写服务器边界测试，再实现限定目录的静态服务器。
- [x] 运行原型原有测试16/16与本试制全部测试19/19；socket检查在允许本机连接的权限下重跑通过。
- [x] 核对原图hash、后备代码与模型数据；独立审阅修复重要问题。真实无WebGL设备未验收。
- [x] 保存可核对证据、运行说明和完成/待审边界，打开Chrome预览。

交付裁定：免费工具管线及单幕动作试制已跑通；不把整个网站、完整三维人物或最终美术验收标为完成。代理手模型不及原画，默认2.5D手部是真实记录的范围修订，见DESIGN.md。

R2纠错以CONTACT-FIX.md和VALIDATION.md为准：补上屏幕接触与真实上划的位置验证，恢复单行标题和全部作品链接。本轮23/23及原站16/16通过；初版19项通过不代表当时的接触关系成立。旧ZIP和本轮改动前的源码备份均保留，新增R2便携包。
