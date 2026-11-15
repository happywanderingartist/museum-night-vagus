> 状态更新：2026-10-31 用户视觉未通过。预览改动原界面且横向换画缺乏连续探索感；此目录仅保留失败记录，不作为后续基线。见 [动效方向纠正](../docs/superpowers/specs/2026-10-31-vagus-motion-direction-correction.md)。

# Vagus 首页—AI空间预览 01
2026-10-31。用户明确要求先做一版连续效果。隔离试制，不替换site-v4，不接旧控制器。沿用docs/superpowers/specs/2026-10-31-vagus-design-review.md；本预览把框体前沿加深到.14W、后退平台提高到约1.35W，以便判断空间感，参数未定稿。演示约4.8秒，正式滚动不锁时长。

开工前GitHub搜索：three.js portal gallery camera（无匹配）；three.js in:name stars:>10000定位mrdoob/three.js。官方仓库由mrdoob/Three.js Authors维护，MIT，查询时117269星，pushed_at=2026-10-30；星标只说明使用规模。已读官方webgl_portal.html（相机/框口、裁切与渲染流程）、PerspectiveCamera.tests.js（QUnit投影矩阵测试）及package.json测试入口。优势：成熟透视与真实遮挡能让边框成为空间证据。局限：官方portal涉及多次渲染且不提供本项目绘画分层；不用其传送门递归、球体/房间或OrbitControls。复用现有r186与其MIT许可，不下载依赖，不复制示例代码。drei另核得MIT/10085星/pushed=2026-10-21，但依赖React，不引入。上游测试只阅读，未在本地运行。

来源：
- https://github.com/mrdoob/three.js
- https://github.com/mrdoob/three.js/blob/dev/examples/webgl_portal.html
- https://github.com/mrdoob/three.js/blob/dev/test/unit/src/cameras/PerspectiveCamera.tests.js
- https://github.com/mrdoob/three.js/blob/dev/package.json
- https://github.com/pmndrs/drei

先验证确定性相机端点、正反向、数值安全及阅读显隐；再制作实体框/绘画背板与HTML，最后用连接Chrome检查播放、反向、拖动与滚动。所有美术仅引用现有home.webp和ai.webp，不伪造alpha分层、补底、人物动作。保留猫杯桌、手机古书接触。

运行：node server.cjs；终端显示本机URL。服务仅绑定127.0.0.1，按白名单提供预览、两幅原画及现有Three运行库。关闭终端可停止。无付费调用，无外部CDN。原文入口待接入，本预览不假装文章已完整。

当前环境未提供Codex Cloud执行入口，且需读取本地原画、向指定D盘目录交付和连接本机Chrome，因此本地试制。

独立审查修正：初始化防重入；文章入口全部由隔离reading.html承接并返回/#ai；服务不再提供原站HTML/控制器。静态AI section设ai锚点，减少动态或窄屏也可返回对应章节。

最终检查：node --test，9/9通过；Chrome已实际核对播放、暂停、反向、滑块/滚动、静态模式与AI入口返回。详细边界见VALIDATION.md。原站site-v4全部72个文件哈希零变化。
