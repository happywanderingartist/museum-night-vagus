# Shopify × Contra × Lusion 实页研究

日期：2026-10-30。视口：1440×900。浏览器：系统 Google Chrome 的独立自动化实例。样本保存在同目录 `screenshots/` 与 `lusion-sequence/`，原始可见文字和 DOM 状态保存在 `live-research.json`、`lusion-sequence.json`。

## 证据边界

本轮实际打开并滚动 Shopify Editions Winter ’26、Contra Labs 和 Lusion v2 首页／About。能确认的是离散状态、页面层级、可见文本、Canvas 位置、部分 CSS 和真实截图；不能确认所有断点、全点击路径、精确动画时长、持续帧率或所有 WebGL 内部实现。官方项目说明与第三方逆向资料分别标注，不把第三方推断写成官方事实。

## Shopify

首屏最终状态中，两位古典人物从左右斜向进入，粉杯、白鞋、粉色购物袋与滑板把现代物件嵌入同一自然场景。中央细线框承担标题、说明、目录和罗马编号，强人物却不压死阅读。Sidekick 让紫色面罩人物、深空、环形机械和白色巨字共处一层；Agentic 在同一个书房里逐步加入商品卡、手部、手机和说明；Marketing 用完整古典风景承载巨大白色标题和右上滑板影像；章节后段最终让给奶油色信息表。

关键不是“背景更复杂”，而是一个章节内多次改变主体层级：背景相连续，标题尺度改变，人物重新取景，现代物件从前景进入，最后正文接管阅读。官方技术线程确认 Painting 是独立 R3F Portal，混合深度图位移与 GLTF 网格，配合 Theatre.js 时间轴、CSS／SVG 开场、Rive 悬停和四级质量降级。

## Contra Labs

首屏是近白编辑底：左侧大衬线标题与短正文，右侧绘画女性的大裁切和网点电脑；“contra LABS” 被拆成画面标签。后续 “Taste” 让巨大字与层叠纸卡占据上方和右下，`missing signal` 整块切换为深青底，随后出现实色统计卡。工具区让完整绘画、白色超大字和六个现代产品图标共同承担叙事。

它使用另一种空间：不是相机持续推进，而是让文字、绘画、色块、纸卡和现代界面不断重新拼接版面。项目作者确认每页有定制预加载、全站 scroll-based animation 与自定义代码，但没有公开逐项时间线。

## Lusion

`v2.lusion.co` 的文档高度只有 900px，`scrollY` 始终为 0，真实推进来自滚轮驱动的内部场景。首屏为深紫空间、红色缠结物体与居中白字；继续滚动后，蓝黑纹理段从底部进入，白色雕塑头跨过场景板缘，背后投影墙和人物剪影接着出现。再往下，巨大透视文字横跨前景，人物位于字面与投影之间。About 页用线框跑者、粒子尾迹与反光水面建立真实层级，后半段切为黑白。

官方项目说明确认宇航员、门户、破玻璃、点击减速、反向滚动、About 流体和异步加载／压缩。第三方逆向说明提供的 Three.js、GLSL、后处理与 Tween 线索只能作为工程参考，不能当作官方审计。该站证明：空间感来自真实世界层级、跨板遮挡、可逆相机和前景文字；一张图整体缩放无法替代。

## 对 Vagus 的硬结论

Vagus 首轮不应继续“给人物换背景”。每个章节先做空间剖面：远景、主体、现代物件、前景书页／桌面、文字平面、阅读底板。章节之间用场景板、材料边或前景遮挡推进；巨字可以前后穿插，但正文和导航保持 DOM。思想者需要托腮、手机、古书、书房光线与屏幕反光形成同一空间关系；不能只换一张更热闹的壁纸。

实现顺序固定为：静态场景成立 → 一场景板推进 → 一次前景遮挡 → 文字层交接 → 正文接管 → 反向／直达／减少动态。Three.js 只在确有独立资产、相机或角色动作时加入；先用纯 CSS、分层透明图或 limited 2.5D 验证“像镜头而非缩放”，再升级技术。

## 文件

- `screenshots/shopify-00-0.png`：完整首屏
- `screenshots/shopify-target-sidekick.png`：Sidekick 巨字与人物
- `screenshots/shopify-target-agentic.png`：Agentic 初始场景
- `screenshots/shopify-01-10633.png`：Agentic 内手机与商品卡进入
- `screenshots/shopify-target-marketing.png`：风景绘画与滑板影像
- `screenshots/contra-00-0.png`：Contra 首屏
- `screenshots/contra-04-12270.png`：完整绘画、产品图标与巨字
- `screenshots/contra-target-missing-signal.png`：深色阅读区
- `lusion-sequence/home-04.png`：跨场景板的雕塑头与投影人物
- `lusion-sequence/home-07.png`：人物、粒子与透视巨字
- `lusion-sequence/about-08.png`：彩色线框跑者与粒子
- `lusion-sequence/about-14.png`：黑白运动与反射水面
