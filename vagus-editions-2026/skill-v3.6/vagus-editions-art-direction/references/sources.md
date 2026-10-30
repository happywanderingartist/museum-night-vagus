# 来源与迁移依据

核查日期：2026-10-23，补充核查 2026-10-30。只把实际读取到的公开材料作为证据；网页抓取可能存在缓存，不将页面中的星标或提交列表当作实时承诺。本文为独立归纳，未将官网图像、源代码或字体作为可复用设计资产；研究截图仅作视觉证据。

## 主要依据

| 编号 | 可追溯来源 | 实际支持的结论 | 证据限制 |
|---|---|---|---|
| S1 | [Shopify Editions Winter ’26 官网](https://www.shopify.com/editions/winter2026) | 已用 Chrome 查看首屏、Sidekick、Agentic，取得真实截图并操作目录锚点 | 未完成全站逐帧动效、帧率或全断点测试 |
| S2 | [Shopify 官方发布](https://www.shopify.com/news/winter-26-edition-renaissance) | 以 RenAIssance 表达 AI 与商业工具的主题 | 是产品发布，不是详尽制作教程 |
| S3 | [Shopify 在 The One Show 的项目提交](https://www.oneclub.org/awards/theoneshow/-award/64482/the-renaissance-edition/) | 团队将古典艺术与现代工具并置，按章节组织可滚动画廊；设计开发早期协作控制时间轴；兼顾功能与惊喜 | 来自参赛方自述，经奖项页面发布；不把自报效果当因果实验 |
| S4 | [Arnaud Tanielian 制作线程镜像，2025-12-17](https://threadreaderapp.com/scrolly/2001335712982147307) | 制作者说明 three.js／R3F、分场景、时间轴工具与静态降级的实际制作方法 | 第一人称公开线程的第三方镜像，原帖本轮未成功打开；不是独立代码审计 |
| S5 | [Shopify 官方设计案例文章](https://www.shopify.com/blog/beautiful-websites) | Winter ’26 案例强调层级、节奏、目录与小惊喜；文字和插画协同 | 2026-09-21 编辑文章，不等于原团队的逐项规则 |
| S6 | [Codex 官方技能文档](https://learn.chatgpt.com/docs/build-skills) | SKILL.md 组织与 `.agents/skills` 发现路径、符号链接支持 | 不证明本包已被当前会话加载 |
| S7 | [Shopify 制作者技术线程镜像](https://threadreaderapp.com/scrolly/2001335712982147307) | R3F Portal、深度图、GLTF／Blender、Theatre.js、Rive、CSS／SVG 首屏与四级质量降级 | 第一人称说明的第三方镜像，不是独立代码审计 |
| S8 | [Contra Labs 完整 Framer 构建](https://contra.com/p/7OWlOrXQ-contra-labs-framer-site-build) | 页面级预加载、scroll-based animation、自定义代码与项目范围 | 制作者自述，不证明每个效果的技术实现或性能 |
| S9 | [Contra Labs Report Framer 案例](https://www.framer.com/community/gallery/contra-labs-report/) | 将静态分层画作改为整站 scrub-scroll，图表和艺术物件持续响应 | 作品说明页，不是原站逐帧测量 |
| S10 | [Lusion 官方项目说明](https://www.commarts.com/project/36283/lusion) | 宇航员角色、门户、点击减速、反向滚动、About 流体、移动端传感器与异步加载／压缩 | 制作团队项目说明，非源码审计 |
| S11 | [Lusion × Codrops](https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/) | 自建系统、每种项目独立规则、3D／叙事／交互能力 | 工作室访谈，不提供实现细节或帧率 |
| S12 | [Lusion 第三方逆向说明](https://github.com/Shuvam-Banerji-Seal/modern-design.md/blob/main/websites/lusion/design.md) | 固定 WebGL、DOM 分层、Three.js、GLSL、相机与 Tween 等线索 | 非官方逆向整理；版本与数值可能过期，必须用真实站点复核 |

不要混用 [Winter ’25 制作文章](https://www.shopify.com/news/how-we-built-boring-edition) 与 Winter ’26；Boring Edition 属于不同年份。本轮规则不引用前者作为本项目制作证据。

## 原站规律与迁移规则的区别

“强叙事主题、古典与现代并置、章节与内容相关、制作时可调节节奏、保留静态降级”有制作资料支持。实际画面支持大胆裁切、字图配重与变化章节。“单个现代物件、非黄色、竖排文字”是 Vagus 约束；全屏／半屏／三分之一为迁移布局选项，180–360ms 为项目试制起点，不是原站实测参数。原站允许复杂绘画、暖色与多道具；低干扰指阅读竞争，不要求固定风景或素底。

## Contra 一手与制作证据

- [Contra Labs 官网](https://contralabs.com/)：已用 Edge 查看首屏、Offerings 和 missing signal 统计状态，保存截图；DOM 实测标题字体和采样尺寸，见 visual-study.md。不是完整动效测试。
- [Alex Karpodinis 制作案例](https://contra.com/p/7OWlOrXQ-contra-labs-framer-site-build)：制作者公开说明使用 Framer、定制预加载到首屏衔接与滚动动画。属于第一人称制作说明，不是代码审计；未由此推断全部技术或性能。

安装包不含官网图像；完整研究交付中的截图仅为本地研究证据，不作为可复用或已授权设计素材。

## 2026-10-30 浏览器实拍

本项目以 Google Chrome 独立实例重新访问三个公开站点。Shopify 访问了首屏、Sidekick、Agentic、中段、Marketing 与资料表；Contra 访问了首屏、Taste／信任区、工具绘画与 missing signal；Lusion 访问 `v2.lusion.co` 首页与 About，逐滚轮采样固定舞台。研究截图、DOM 采样和脚本位于项目 `vagus-editions-2026/research/2026-10-30-live-chrome/`，不随 Skill 安装包分发。

证据边界：这是一轮 1440×900、Chrome、正常动态偏好下的离散截图与 DOM／可见文字采样。Lusion 的 WebGL 预加载偶发在自动化页面留下黑帧，已通过等待和隐藏已完成 DOM 包装层继续观察，但不能据此报告完整原始冷启动、精确时长、所有断点、全部点击或帧率。Shopify 资源也有少数 CDN 连接关闭，不能把局部加载失败解释成其正式体验。

## GitHub 先例审阅

搜索范围：GitHub smooth scroll、Lenis、React Three Fiber、分场景与测试。agent-reach 的网页／开发路由已读取；本机未找到 agent-reach，gh 未认证，改用网页搜索与 GitHub 公开页面。没有下载或照搬代码，也未安装依赖。

| 项目 | 维护与许可证证据 | 测试／用法 | 可复用优势 | 明确局限与本轮决策 |
|---|---|---|---|---|
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | Poimandres；仓库页面约 33.2k 星；[MIT](https://github.com/pmndrs/react-three-fiber/blob/master/LICENSE)；[可见提交](https://github.com/pmndrs/react-three-fiber/commits/master/)列有 2026-08-25 ff3899d | README 有 Canvas／mesh 示例；[renderer 测试](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/tests/renderer.test.tsx)与 Jest 配置可读，本轮未运行 | 独立场景、可复用组件和状态驱动适合分镜拆分；也是 S4 明确提到的技术 | React 主版本需匹配，三维资产与 GPU 成本仍要承担；本轮借鉴分层思路，先交静态视觉，不引入依赖 |
| [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | darkroom.engineering；页面约 16.8k 星；[MIT](https://github.com/darkroomengineering/lenis/blob/main/LICENSE)；[提交列表](https://github.com/darkroomengineering/lenis/commits/main/)可见 2026-08-05 eea7159 | README 有帧循环、锚点、集成与限制；已读 [package.json](https://github.com/darkroomengineering/lenis/blob/main/package.json)，根脚本未列 test；未运行或推断测试覆盖 | 滚动与动画同步已有成熟接入方式，不必自造滚轮处理 | iframe、嵌套容器和滚动吸附有具体限制；它不提供构图或艺术指导。本轮不安装，也没有证据证明 Winter ’26 使用它 |

星标仅是关注度线索。提交页与仓库主页缓存可能不一致，所以以上只是本轮“可见记录”，不是最新提交断言。正式实现时需重新核对版本、兼容性并做实际运行测试。

## 本轮本地证据

## 动效实现先例补核 · 2026-10-23

[Motion](https://github.com/motiondivision/motion) 由 motiondivision／Matt Perry 维护；主页可见约 34.4k 星，MIT；[提交页](https://github.com/motiondivision/motion/commits/main/)可见 2026-09-11 的 372846e，不保证是当前最新。已查看 [package.json](https://github.com/motiondivision/motion/blob/main/package.json) 的单元／类型与 Playwright 测试脚本、测试目录含 scroll；具体 scroll 子目录抓取失败，测试未运行。其 [scroll](https://motion.dev/docs/scroll) 与 [inView](https://motion.dev/docs/inview) 将连续进度和入区触发分开，是可复用优势；它不提供艺术指导，硬件加速取决于属性与浏览器，是明确局限。本轮只借鉴合同与方法，不安装或复制代码，不证明两参考站用了 Motion。

[Theatre.js](https://github.com/theatre-js/theatre) 是 Shopify 制作者点名的时间轴工具；仓库可见约 12.8k 星、Apache-2.0。提交页本轮可见记录止于 2024，缓存与分支可能影响可见性，不能称其当前维护活跃；不因参考使用而直接选为新项目默认依赖。已有 R3F／Lenis 审阅保留，后续正式实现还须重新核对兼容性和许可。

原对话附件已实际打开，两张都是暖金色思想者构图；文字卡横排／图片卡横排、复杂大厅、悬浮界面分别可见。用户后续明确否定黄色、复杂背景与横排图片卡，因此本轮将它们写成项目约束。附件拷贝保留在交付的 `evidence/` 中，不包含于通用安装包，不把这些生成图当作真实雕塑照片或正式作品数据。
