# VAGUS：历史反馈、后续方案与参考网站

更新于 2026-11-15。本文给 Gemini 说明已反复提出的反馈、已有方案、各分支完成度与参考网址。**有较完整的后续方案，但方案不等于问题已经全部解决、设计已获接受或网站已可发布。** 当前正式基线仍是 main 中的 vagus-editions-2026/site-v4/；其余分支是独立审稿或试验材料，不能整体合并。

## 反复反馈与对应方案

| 反复强调的反馈 | 已形成的方案与证据 | 当前状态与下一步 |
| --- | --- | --- |
| 不要用横向翻页替代空间体验；需要连续向内的画廊和自然纵向阅读 | v5 设计把首页到 AI 章安排为单次向内进入，保留普通纵向滚动、自然文档阅读、直接跳转、反向恢复、减少动态与静态退路。详细合同见 [连续画廊 v5 方案](https://github.com/happywanderingartist/museum-night-vagus/blob/main/vagus-editions-2026/docs/superpowers/specs/2026-11-01-vagus-continuous-gallery-v5.md)；镜头与材料边界见 [空间设计 v2](https://github.com/happywanderingartist/museum-night-vagus/blob/main/vagus-editions-2026/docs/superpowers/specs/2026-10-31-vagus-shot-contract-v2.md) | 这是方向和实验方案，不是正式网站实现或视觉验收。独立空间预览不能自动并入 site-v4；先看关键帧和 Chrome 实际预览，再决定是否接入。 |
| 产品页不能只放大截图代替手机产品体验 | 2026-11-13 产品设计提示词 v2 要求可编辑的 390×844 手机界面、真实操作状态和单列移动阅读；还列出窄屏、点击区域、返回、失败状态与产品事实边界，见 [设计提示词 v2](https://github.com/happywanderingartist/museum-night-vagus/blob/codex/vagus-motion-study-20261113/design-reviews/2026-11-13-motion-study/2026-11-13-vagus-product-motion-prompt-v2.md) | 独立审稿分支有实际 START/HUG 页面和手机客户端演示，但尚未并入 main，也未完成全设备视觉验收。尺寸和字体数值是起步提案，须看稿调整。 |
| 人物、手、手机/书、猫和桌面要有真实接触关系；不能靠纸片视差、假补底或不断叠修遮住断裂 | 先盘点原图、透明层、清底、前景、遮罩和高分辨率母版；人物与接触物没有可靠独立素材时保持同组。先交空间剖面、五个关键帧和灰模，再替换正式素材。相同根因连续两次失败就撤回该实现路线，不继续叠补丁。 | 素材合同与停止条件已写，真实素材是否齐备、最终连续效果和真实设备效果尚未全部验收。不要把单张原画说成完整三维人物或真实动作。 |
| 先研究相似网站与成熟方案，再写清提示词、画面关系和验收标准，减少返工 | [动效研究分支](https://github.com/happywanderingartist/museum-night-vagus/tree/codex/vagus-motion-study-20261113/design-reviews/2026-11-13-motion-study)保存完整提示词、设计合同和实施交接；合同记录了 MotionSites 可访问预览、GSAP、Anime.js、Motion 和 Three.js/R3F 方案的复用点与限制。 | 后续每一轮先核对用户最新反馈和来源，再交静态构图/关键帧；用户选定方向后做灰模和功能验证，最后才接正式素材与主站。参考页的技术做法不能凭视觉猜测。 |
| 网站内容必须让人快速读懂；案例事实、产品能力和未完成验证不能混写 | site-v4 保留真实文本、普通链接、稳定阅读状态和减少动态路径；START/HUG 记录了来源、样例和验证状态。当前案例稿明确区分提案、开发预览、真实证据与专业审核。 | 现有案例布局仍待用户视觉审阅；START 的可发布地点、HUG 的专业内容审核、正式存储与真实效果等仍有缺口。不要把样例或旧测试写成线上能力。 |

## 仍在单独分支中的成果

这些分支均基于 2026-10-30 的主仓库基线，较当前 main 少了 Gemini 迁移提交。阅读时以 main 为当前基线，并先比较文件差异；除非明确选定，不要整条合并。

| 分支 | 包含内容 | 已知检查与未完成项 |
| --- | --- | --- |
| [codex/vagus-motion-study-20261113](https://github.com/happywanderingartist/museum-night-vagus/tree/codex/vagus-motion-study-20261113/design-reviews/2026-11-13-motion-study) | 手机产品页与连续漫游提示词 v2、设计合同、库审阅与实现交接 | 提示词中的尺寸和时长是设计提案；页面仍需用户逐屏确认。 |
| [codex/vagus-motion-implementation-20261113](https://github.com/happywanderingartist/museum-night-vagus/tree/codex/vagus-motion-implementation-20261113/design-reviews/2026-11-13-motion-implementation) | GSAP/ScrollTrigger 连续镜头、Anime.js 手机状态反馈和一份独立整站审稿副本 | 历史 Node 测试与 GitHub Actions 通过，Chrome 检查过主要入口和部分流程；完整移动端、辅助技术、低端设备和最终视觉接受仍待检查。不是当前正式站。 |
| [codex/vagus-element-motion-20261112](https://github.com/happywanderingartist/museum-night-vagus/tree/codex/vagus-element-motion-20261112/design-lab/vagus-elements-2026-11-12) | START 翻页与 HUG 花园反馈的独立样稿 | 历史测试 7/7 和语法检查通过；最后一次视觉修改后的 Chrome 访问失败，不能视为该改动已视觉验收。 |
| [codex/vagus-site-review-20261113](https://github.com/happywanderingartist/museum-night-vagus/blob/codex/vagus-site-review-20261113/vagus-editions-2026/site-v4/REVIEW_2026-11-13.md) | 独立整站文案与页面审稿副本 | 历史 Node 测试 43/43，Chrome 查看了主要页面和部分交互；未完成全设备视觉审核。两份含联系方式的简历 PDF 仅在本地审稿副本，未上传。 |
| [codex/start-hug-case-design-2026-11-11](https://github.com/happywanderingartist/museum-night-vagus/tree/codex/start-hug-case-design-2026-11-11/design-reviews/2026-11-11-start-hug) | START/HUG 案例图文评审稿、素材和验收记录 | 历史记录有 326 项页面/链接/素材检查和 Chrome 路径检查；介绍图、布局及正式替换时机仍待用户审阅。目录内还封存少量较早的本地原型副本；只读取需要的文件，不要整包搬入正式网站。 |
| [backup/2026-11-02-vagus](https://github.com/happywanderingartist/museum-night-vagus/tree/backup/2026-11-02-vagus) | v5 设计、素材合同、早期动效参考笔记与隔离预览 | 其中的参考材料只用于研究；主站仍以 main 为准。 |

## 参考网站与学习范围

下列网站是观察对象，不是需要照搬的模板。参考页可能更新；项目文档中的截图和观察日期用于还原当时看到的版本。实现时先看当前页面，再核对仓库里的记录。

| 网站 | 看什么 | 不迁移什么 |
| --- | --- | --- |
| [Shopify Editions Winter ’26](https://www.shopify.com/editions/winter2026) | 章节画面的层级、古典图像与现代物件的关系，以及主视觉如何交给信息阅读 | 不复制其画面、品牌素材或整套 WebGL 技术；2026-10-30 的动效观察是历史记录，官网内容会更新。 |
| [Contra Labs](https://contralabs.com/)；[制作方建站案例](https://contra.com/p/7OWlOrXQ-contra-labs-framer-site-build) | 绘画媒介、现代动作、标题和信息的统一；具体案例来源可帮助理解设计制作范围 | 当前官网与 2026-10 月观察版本可能不同；不复制其业务数据、页面文字或把风景当成万能背景。 |
| [Lusion v2](https://v2.lusion.co/)；[My Little Storybook](https://exp-my-little-storybook.lusion.co/) | 真实空间层次、遮挡、绘本叙事，以及作品进入正文的节奏 | 这些演示依赖专门绘制/制作的素材；旧版 Lusion 页目前可能无法在部分浏览器环境工作，不把旧截图说成当前运行结果。 |
| [The Whoopsies](https://thewhoopsies.co.uk/) | 插画叙事、滚动入口、趣味与书本结构的层次 | 不复制角色、书本作品、游戏或具体界面；只借鉴有明确语义的进入关系。 |
| [The Boat / SBS](https://www.sbs.com.au/theboat/)；[Getty Tracing Art](https://www.getty.edu/tracingart/)；[Getty Sculpting Harmony](https://gehry.getty.edu/) | 长篇插画阅读、真实档案材料如何变成纵向故事、不同媒介如何在章节中交替 | 只取信息组织和画面/正文交接；不复制故事、档案素材或强戏剧化镜头。The Boat 的官方入口在非脚本抓取中信息有限，以历史研究记录为补充。 |
| [MotionSites Cyber Layer](https://motionsites.org/zh/prompts/cyber-layer) | 结构化提示词如何写清图层、入场顺序、字体就绪和稳定终态 | 这是提示词示例，不是 Vagus 的视觉参考；公开页只显示部分提示词，勿复制受限全文。 |

网站互动研究和开源库审阅的细节保存在动效研究分支的 design-contract.md；此前的参考候选与 v5 关键帧图保存在 backup/2026-11-02-vagus。每次继续研究都应记录访问日期、实际观察到的状态、哪些是推断，以及对 Vagus 的适用边界。

## 建议 Gemini 的开始顺序

1. 先读 GEMINI.md、GEMINI_HANDOFF.md 和本文；以 main 的 site-v4 为当前正式源。
2. 对照 motion-study、motion-implementation、site-review 三个分支，列出各自新增内容和冲突；不要自动合并。
3. 将“设计已经写清”“代码已实现”“测试通过”“Chrome 实际可见”“用户已接受”“已经部署”分别报告。
4. 给用户展示一个具体、可比较的视觉结果后，再按反馈选取需要接入的部分。网站部署是单独事项。

