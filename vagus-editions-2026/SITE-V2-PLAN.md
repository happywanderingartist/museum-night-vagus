# 固定手机与 START / Hug 页面实施计划

> **For agentic workers:** Use superpowers:executing-plans. Preserve the existing work; execute this confirmed continuation inline, with tests before behavior changes.

**Goal:** 手机完全固定，仅手指5秒滑动/2秒停顿；继续已确认的START与Hug分镜，接成首页可达的两个独立项目页面。

**Spec:** 最新用户修改优先；既有VAGUS-v5.3-source.md、第06章、VAGUS-storyboard-confirmation-v1.md与batch-01/DELIVERY.md。颜色和人物/水面母版不重画。用户已多轮确认并要求制作，本轮不是重新探索概念，不重复要求选择执行方式。

**Architecture:** free-motion-lab先修固定手机；新建site-v2，复用prototype-v1首页/导航与已验证的原生滚动实现，接入固定手机的局部Three场景；START/Hug增加独立HTML详情，正常页面与原生CSS/SVG交接，无新运行时依赖。

**Research:** 使用agent-reach的GitHub/gh入口搜索，CLI未登录，改查公开官方仓库。Motion的Jest/Cypress/Playwright结构证明应把纯状态与真实浏览器分开；复用其进入/退出与状态分离思想，不复制源码、不为轻量交接引入完整依赖。局限是库不提供人物资产或真实作品；公开issue还表明滚动效果必须实测跨浏览器。维护者/许可/历史星标以既有SOURCE-REVIEW记录为背景，不报未经刷新数字。Three沿用已锁定0.186.1 MIT包。

## Global Constraints

- 最新手机规则替代首次露屏：任何时间、复访、检查模式均不旋转手机。
- 首页、AI、START、Hug连通；标题单行，全部作品入口不丢。新的两个详情有独立URL并可回首页/互相切换。
- START：酒红#512333/靛紫#322332/票白#f4eae3，人物左、标题右；Hug：雾白#edf0e5/鼠尾草#e7eddf/墨绿#233e32/少量珊瑚色#d77a5d，宽景与安静阅读；AI保留墨绿，不交换粉蓝配方。
- 字体沿用华文中宋展示标题、等线细无衬线正文；不复制字体文件，不压扁字形。
- 不借生成地图/花园冒充真实产品；没有的截图、原型、本人职责与成果清楚待接，不臆造数据。
- 普通滚动/直接链接立即可用；关闭动态、减少动态、脚本/素材失败可阅读；不发布、不上传、不充值。
- 仅新建site-v2及修正free-motion-lab；prototype-v1和母版保留。Git未有HEAD，目录隔离并保留备份，不擅自创建初始提交或分支。

## Review Focus

手机矩阵全程不变而指尖有真实上划；AI局部场景未加载时仍保留图像/作品链接；直接访问start.html/hug.html和hash可达；关闭动态及后台/离屏暂停；没有把缺失真实案例包装为已完成产品。

### Task 1：固定手机

Files: free-motion-lab/motion.mjs、hand-contact.mjs、app.mjs、index.html及tests。

- [x] 先将旧首次露屏断言改为最新禁止露屏，增加真实手机矩阵始终不变（包括peek=1输入）且指尖仍移动的测试，观察失败。
- [x] 取消所有手机转向与首次标记，保留7秒周期和接触约束，更新检查控件文案。
- [x] 运行完整试稿测试，保留源图hash。

### Task 2：连续开场与两个项目页

Files: site-v2/index.html、app.js、state.js、style.css复用现有；新chapter-pages.css、chapter-motion.mjs、three-bridge.mjs、start.html、hug.html；固定手机模块与必要vendor/资产。

- [x] 先写chapterFrame(kind,progress,reduced)的端态/反向/无动态测试、白名单服务器多页面与模块响应测试，观察缺实现失败。
- [x] 新目录复制允许文件；首页与AI原有阅读/导航完整，START与Hug各有真实HTML详情和互链。
- [x] START票面意象→路线线条→稳定说明，Hug水面局部光带→浅绿阅读面；不把整图摇晃声称人物动画。
- [x] 案例内容只来自已确认方案，缺真实截图/职责明确留空。首页作品目录可直达两页。

### Task 3：验证与交付

- [x] 原型16项、固定手机与接触检查、新站状态/HTTP/链接资产检查完整运行；不以单元测试代替画面审阅。
- [ ] 使用当前可用Computer Use在Google Chrome检查首页→AI→START→Hug、详情跳转、固定手机、真实滚动及关闭动态；不静默换Edge/IAB。
- [x] 独立代码审查一次，修复重要问题；记录局部角色/真实内容与设备验证缺口；导出D盘便携包。

浏览器执行变更：Computer Use日常Chrome窗口授权超时，未完成这一原生窗口条目。改用已安装Google Chrome的D盘独立测试资料目录，完成真实页面19类检查与截图；不读取用户会话，不将隔离自动化冒称日常窗口或实机验收。两者的证据和边界分别记录。
