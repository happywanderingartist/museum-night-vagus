# Vagus 提示词与动效工具研究记录

核对日期为 2026 年 11 月 13 日。目标为完善博物馆主题作品集及 START / HUG 产品页的设计提示词。当前交付包括研究、提示词补充和独立动效库资料包。

## 实际读到的内容

| 参考 | 本轮访问与观察 | 可复用的写法或关系 | 项目转译与素材边界 |
| --- | --- | --- | --- |
| Cyber Layer | Chrome 点击复制后读取全文，约 14,104 字符；目录预览视频正常播放 | 明确图层、起始状态、入场顺序、字体就绪与动画收尾 | 借鉴描述结构，Vagus 使用自身原画、字体和文案 |
| Mostar Guide | 读取公开介绍与提示词片段；播放目录视频，看到前景桥体交给后方河谷 | 前后景承接下一画面，画面焦点随推进连续变化 | 转译为近框、远框与展厅关系，项目的镜头数值另行设计 |
| Design World | 读取详细公开介绍；播放目录视频，看到立方体与背后文字的折射关系 | 拖动、惯性、方向按钮、静止状态分别有描述 | 借鉴空间反馈的描述，展厅沿用自己的框体与作品 |
| Sea Serenade | 读取公开提示词片段与类型介绍；完整提示词为付费内容 | 公开片段明确以滚动进度组织电影感单页 | 采用滚动进度的设计表述，具体实现仍需分镜验证 |
| Bitcoin Yield | Chrome 读取公开提示词片段；付费内容 | 片段把排版、文字、素材与滚动列为同一复刻任务 | Vagus 以自身素材与阶段事实定义整体交付 |
| Urban Jungle Hero | Chrome 读取公开提示词片段；显示付费及限时免费标记 | 片段明确滚动主视觉及 GSAP / ScrollTrigger 技术方向 | 据此检索工具，具体页面实现归于后续验证 |
| Intelligence Layer | 读取公开介绍与提示词片段，点击复制后出现分享解锁界面 | 访问限制已记录 | 全文阅读状态保持待解锁 |

Mostar Guide、Design World、Intelligence Layer 的复制入口在当前账户中显示分享解锁条件。本文对三者的分析以公开介绍、公开片段和已播放的目录视频为依据。Cyber Layer 是本轮实际读到完整提示词的样本。浏览器剪贴板曾短暂保留上一条内容，核对开头和页面解锁状态后确认了阅读范围。

本轮没有访问这些参考的生成站点源码。预览录屏能说明可见画面关系，具体材质、时序、源代码和实现方式分别按对应资料核对。Golden Portal、Cosmic Mapping 及此前视频参考继续保留历史观察记录的范围。

## 提示词写法的转译

本轮最明确的学习来自 Cyber Layer 的全文结构。它把画布、字体、层次和起始画面写在前面，再用时序表描述入场，最后交代结束、回退和交互。Vagus v2 采用同样清晰的描述粒度，具体场景、文案、动作和参数由本项目重新设计。

每段动效统一写出对象、触发、起始与结束状态、路径、驱动、时间或进度、缓动、反向、打断和稳定终态。滚动段另外记录停止与反向行为，操作段另外记录焦点与状态。作品信息、素材分辨率与遮挡关系贯穿设计和验收。

v2 中 1.5 至 1.8 个视口的进入距离、各进度分段、约 900 至 1200ms 的点击进入，以及局部幅度均为原创提案。第一轮分镜将检查连贯性、疲劳感、素材和阅读密度，再校准数值。

## GitHub 候选审阅

以下星标与维护记录来自本轮 GitHub API。星标用于了解使用规模，选用判断同时依据许可、说明、测试入口和与现有网站的适配。

| 项目与维护方 | 星标快照 | 核对到的版本及维护 | 许可 | 优势 | 局限与测试情况 |
| --- | --- | --- | --- | --- | --- |
| greensock/GSAP，GreenSock / Webflow，包维护者 Jack Doyle | 30,551 | 3.15.1；默认分支最近提交 2026-11-04，5e6c35f | Standard No Charge GSAP License | 时间轴、分段滚动、固定区间和进度同步，适合连续镜头试验 | 使用自定义许可；发行仓库根目录与 package.json 未提供公开测试入口，仍需项目内验证 |
| motiondivision/motion，Motion，包作者 Matt Perry | 35,104 | packages/motion 为 14.13.0；默认分支最近提交 2026-11-13，9d17d79 | MIT | 原生 JS 状态、滚动与取消能力，可与现有浏览器动画协作 | 大型单仓包含多个包及付费周边内容，需确认实际导入和功能范围；已核对 Jest、类型检查及 Playwright 入口 |
| juliangarnier/anime，Julian Garnier | 74,550 | 4.5.0；默认分支最近提交 2026-08-09，01b81be；仓库 pushed_at 为 2026-11-02 | MIT | 矢量描线、路径、时间轴和局部说明，具有独立浏览器发行文件 | 与现有动画的属性归属需要设计；已核对 browser-sync 浏览器测试、Mocha 节点测试与类型检查脚本 |

GSAP 的许可允许在网站和数字界面中使用，同时对特定可视化动画构建工具有使用限制。本文按官网当前条款记录。Motion、Anime.js 按各自 MIT 文本保留版权与许可信息。

本轮审阅了三者 README、包元数据、维护记录与许可资料。测试脚本的存在已核对，上游完整测试套件仍需其开发依赖环境。当前下载文件采用语法与指纹检查，整站性能及兼容性属于后续试验内容。

## 本次选择

先准备 GSAP 核心与 ScrollTrigger 两个浏览器文件，用于连续滚动和镜头分段的局部试验。另准备 Anime.js 单文件发行版，用于路线描绘和说明图形的独立比较。Motion 保留为候选文档来源。现有 Three.js 继续承担已有三维画面的基础。

主项目的画面构图、人物角度、素材与阅读行为由设计稿明确。库负责组织数值和状态变化。正式接入时先核对旧控制器职责，为每一段选择唯一进度来源，为每个元素选择唯一动画负责人。

## 下载与核对范围

资料包位于 `D:/Downloads/vagus-motion-kit-2026-11-13`。下载清单记录官方固定提交、原始 URL、版本、文件字节数、Git blob SHA-1 与 SHA-256。三个浏览器文件总计 236,083 字节，约 230.6 KiB。

本轮校验文件大小、官方 Git blob 标识及 JavaScript 语法。资料包的独立准备与后续网站接入分别记录状态。

## 设计确认与质量标准

方向延续原画、蒙娜丽莎进入、可旋转展厅、完整项目目录与纸色产品阅读。新增的镜头进度和手机参数保留提案身份。当前可确认素材为已有完整原图及部分矢量图，分层、清底、高清局部和人物视角按资产审计推进。

首份设计稿应同时证明停住时构图成立、进入过程有可辨空间关系、所有项目可被发现、手机 UI 的比例与操作完整。阅读文本、真实成果和示例身份均在对应位置保持清楚。

## 来源

- [Cyber Layer](https://motionsites.org/zh/prompts/cyber-layer)
- [Mostar Guide](https://motionsites.org/zh/prompts/mostar-guide)
- [Design World](https://motionsites.org/zh/prompts/design-world)
- [Sea Serenade](https://motionsites.org/zh/prompts/sea-serenade)
- [Bitcoin Yield](https://motionsites.org/zh/prompts/bitcoin-yield)
- [Urban Jungle Hero](https://motionsites.org/zh/prompts/urban-jungle-hero)
- [Intelligence Layer](https://motionsites.org/zh/prompts/intelligence-layer)
- [GSAP 仓库](https://github.com/greensock/GSAP) [ScrollTrigger 文档](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) [GSAP 当前许可](https://gsap.com/community/standard-license/)
- [Motion 仓库](https://github.com/motiondivision/motion) [滚动文档](https://motion.dev/docs/scroll)
- [Anime.js 仓库](https://github.com/juliangarnier/anime) [滚动文档](https://animejs.com/documentation/events/onscroll)
