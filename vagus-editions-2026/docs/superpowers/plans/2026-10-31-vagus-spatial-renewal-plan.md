# Vagus 空间叙事完善 Implementation Plan

> 2026-10-31修订：当前不直接执行此v1计划。先审阅 ../specs/2026-10-31-vagus-shot-contract-v2.md；首个设计验证改为首页—AI章，START/Hug随后。旧Shopify首屏/Sidekick截图仍在预加载，不作为连续转场实测证据。技术路线与逐镜头设计以v2待审提案为准。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. 本轮交付计划，尚未执行下列开发任务。

**Goal:** 在既有 Vagus 九幕作品集上，建立有因果的空间交接、清楚的阅读终点和可核验的交付流程。
**Architecture:** 保留原生HTML、普通文档滚动和现有独立页面；每章一个短sticky舞台，分层/遮罩接入真实阅读内容。先在隔离候选验证START，再验证Hug的不同节奏，最后推广；人体动作单独排期。
**Tech Stack:** 现有HTML/CSS/ES modules、SVG、WAAPI、Node内置测试；Three仅按资产条件沿用。首轮不新增框架。
**Spec:** ../specs/2026-10-31-vagus-spatial-renewal-design.md

## Global Constraints
- 本计划所有新路径相对 vagus-editions-2026；不覆盖site-v3/site-v4、原画或现有实验。
- 品牌只写Vagus；首页原有视觉、无白框入口、理念横排保留。
- AI手机固定、不露屏、目标滑动5秒/停2秒；可靠动作缺口明确记录，不以旧测试冒称完成。
- 每章一个主要空间动作；相邻章节至少两项视觉差异；正文与导航保留DOM、普通链接和正常阅读流。
- 系统减少动态优先；直接进入内容不等待动画；默认静音；不新增光标游戏。
- 不虚构作品、数据、音频、现场或身份；版权许可逐项登记。
- 默认云端开发/测试；GitHub为代码持久位置。连接本机Chrome与核查本地源资产需本机操作，云端能力不支持时说明原因。
- 新媒体与导出默认D盘，代码/小文档进Git、大媒体走获准的对象存储；未经授权不启用付费服务。
- 通过连续浏览器验收前不替换默认站；本轮不发布、不上传。

## Review Focus
1. 直接访问、刷新和浏览器后退进入中段，应得到相同画面且内容可达——任务3/5。
2. 滚动中改变窗口、字体加载或图片迟到，不应错位/裁掉标题——任务3/5。
3. 减少动态在页面打开后改变，应立即静态恢复；后台恢复不跳动——任务3/5。
4. 图层alpha/补底不足或图片加载失败，不应露洞或留下空白——任务2/3。
5. 新旧控制器重复写transform、事件或导航焦点，不应叠加动画或吞点击——任务3/5。

## 研究结论与证据地图
参考分工和九幕分镜见规格，不另造一套美术。重要源文件：
- research/2026-10-30-live-chrome/RESEARCH-DIGEST.md（实页离散状态；非全断点/持续FPS）。
- research/2026-10-30-motion-reset/REVIEW-AND-DECISION.md 与 github-evidence.json（2026-10-30开源核查）。
- site-v4/README.md（关于页实验撤下；其余本轮未验收）。
- SITE-CURRENT.md（旧v3指针；需核对后收敛，不能直接照用）。
- The Whoopsies：上轮Chrome观察来自本聊天交接；下一任务补证据到references.md，不能把约4600px、846px透视和9秒循环当Vagus设计参数。
- 本地用户MP4：尚未逐帧核对；作为补充参考，不替代网站操作验证。

已审阅开源先例（以下为10月30日快照，不是实时承诺）：
| 先例 | 维护/许可/历史规模 | 已读用法或测试 | 可复用优势 | 明确局限与决策 |
|---|---|---|---|---|
| motiondivision/motion | motiondivision、MIT、34658星；默认分支提交2026-10-29 | scroll API与反向滚动浏览器测试 | 文档滚动与动画进度分离，真实滚动测试 | 不制造图像深度/人体动作；先复用现有能力，不默认安装 |
| pmndrs/drei 与 examples | pmndrs、MIT；10079/132星；提交2026-09-30/10-21 | View、截图测试、滚动驱动GLB动画示例 | HTML与画面分工，离屏停渲染，动作素材先成立 | React依赖不适合直接迁移；示例媒体许可另查 |
| martinlaxenaire/curtainsjs | MIT、1826星；提交2025-04-03 | DOM平面对齐、上下文丢失示例 | 尺寸同步与静态回退 | 所读缩放/顶点效果会重现形变；不引入第二WebGL库 |
星标不是质量证明；未运行这些上游示例，不能说其视觉/性能已验证。本轮方案依赖已有源码研究；实施前任务1刷新适用信息。

## 文件与接口
当前读取到的scene-motion.mjs负责场景查询、文字入场、cameraFrame与人物挂载，scene-motion.css负责舞台层和水面/灯光。新增控制器不得与它同时控制同一节点。

新文档：
- docs/superpowers/specs/2026-10-31-vagus-spatial-renewal-design.md：视觉与行为合同（本轮创建）。
- docs/superpowers/plans/2026-10-31-vagus-spatial-renewal-plan.md：本文件（本轮创建）。
实施时新建：
- research/2026-10-31-spatial-renewal/references.md、baseline.json、asset-manifest.json、content-gaps.md：证据、唯一基线、素材能力和内容缺口。
- spatial-pilot/index.html、pilot.css：START与Hug隔离验证页，沿用真实文字与素材。
- spatial-pilot/scene-config.mjs：两章各自的图层、端态、裁切和滚动区间。
- spatial-pilot/scene-state.mjs：纯进度与模式计算。
- spatial-pilot/scene-controller.mjs：读取滚动/尺寸，调度状态并写样式；可销毁。
- spatial-pilot/tests/scene-state.test.mjs、scene-lifecycle.test.mjs：状态与生命周期。
- spatial-pilot/evidence/：截图、连续录屏、验证记录。
- site-v5-candidate/：试验合格后才从核实基线白名单创建；保留旧版。
不提前复制依赖/全量媒体；共享原资产可只读引用，发布打包时再按manifest收集。

拟定模块合同（任务3实现）：
- sceneProgress(scrollY, stageTop, travelPx) -> 0..1；有限数校验，travel<=0时按是否越过起点返回0/1。
- motionMode({systemReduced,userEnabled,documentHidden}) -> 'static' | 'paused' | 'animated'；systemReduced或用户关闭优先static，后台为paused。
- sceneFrame(kind,p,mode) -> {layers,portal,readingVisible}；kind仅start/hug，输入相同输出相同；配置与计算分离。
- mountScene(stage,{kind,window,config}) -> {refresh,destroy}；同一stage只有一个控制者，destroy清除全部监听/观察/RAF及临时样式。
- sceneFrame的layers按layer id给出x/y/scale/opacity；portal给出0..1 aperture，readingVisible控制装饰交接，不通过它隐藏唯一的真实内容。
- static模式回到完整poster与可读内容；paused保留最后画面，回前台从实际scrollY重算。
以上是待实现接口，不声称现有代码已包含。

## Task 1：核实基线、参考与内容缺口
Files: 新建research/2026-10-31-spatial-renewal的四个文件；核对完成后才更新SITE-CURRENT.md，不删除历史记录。
- [ ] 核查Git状态、现有分支与远端，记录未提交文件；不得覆盖他人工作。云端连接可用时从已核实提交建工作分支，建议feat/vagus-spatial-renewal；无云端则记录具体限制。
- [ ] 分别核对v3/v4实际服务入口与页面版本，把“文档最新”“浏览器可见”“已验收”拆开记录。baseline.json含commit（若有）、sourceDir、URL、模块版本、源图SHA-256、核对日期。
- [ ] 用已连接Chrome复核Whoopsies关键序列，存五个过程状态和短录屏，区分页面观察/源码机制/推断；若不能操作，只标待补，不重复宣称全流程实测。
- [ ] 按agent-reach研究入口刷新上表候选的维护、许可证、测试与实际用法；固定采用版本/提交。只有既有能力不足才提出新增依赖。
- [ ] 逐页登记真实文章、产品截图、音频、作品、角色与履历来源；缺口分别标“用户已提供但未定位”“需确认公开范围”“尚未提供”，先查已有材料再询问。
- [ ] 检查source manifest与页面实际引用一致；形成一份唯一状态文件。提交该任务文档时只包含授权文件。
验收：执行者能明确知道从哪个版本继续、哪些功能生效、哪些内容/资产缺失；不引用失效端口作为完成证据。

## Task 2：START空间分镜与资产门槛
Files: asset-manifest.json；新建spatial-pilot/storyboard.md、assets/（仅必要且获准的衍生层）。
- [ ] 核对现有START完整母版、票与手接触关系、真实产品截图。明确原图尺寸和禁止改动区域。
- [ ] 画F0—F3与0/25/50/75/100%构图：票边逐步占前景→入口显露真实路线→票边退出→阅读稳定；“路线”必须来自真实产品或明确标记的机制线稿。
- [ ] 记录每层遮挡次序、镜头轴、文字安全区和补底覆盖；票与手不能因放大产生断裂。入口变为独立图形时须有清楚的脱离/交接，不硬把票从手上拉走。
- [ ] 1440×900和1920×1080静态审阅：标题、人物、票、入口主次清楚；主体保持原画比例；没有空洞、接触错位或伪造产品。
- [ ] 缺分层时先完成资产准备或保留静态分镜，不拿整图网格生成假纵深；获得静态方向审阅后再做动作。
验收：五个位置均构图成立，所需资产确实存在，未制作素材明确标记。此阶段不为可逆静态文档写无意义单测。

## Task 3：START可逆空间试验
Files: spatial-pilot/index.html、pilot.css、scene-config.mjs、scene-state.mjs、scene-controller.mjs及tests。
- [ ] 先写scene-state测试：p越界截断、0/1端态、正反向同p同输出、非有限输入、travel<=0；系统减少动态不能被手动开启动效覆盖。运行node --test spatial-pilot/tests/scene-state.test.mjs，确认缺实现时失败。
- [ ] 实现纯状态与START配置，初始滚动travel=1个视口；只用独立图层、等比变换、SVG/CSS遮罩，正文从HTML初始状态即存在。
- [ ] 写生命周期测试：重复挂载拒绝或复用；resize/image load刷新测量；destroy无监听/RAF残留；后台不推进；关闭动态立即静态。测试原控制器不能同时挂到候选节点。
- [ ] 接入原生滚动、短sticky舞台和独立DOM文字，静止不持续轮询；快速导航立即到内容，不播放补帧追赶。
- [ ] 覆盖poster加载失败、部分层加载失败及无JS：回到可读文本、原始链接和合理替代说明；不显示空白锁定舞台。
- [ ] 运行node --test spatial-pilot/tests/*.test.mjs；记录实际用到的shell展开方式及结果。
- [ ] Chrome连续体验正向、停顿、反向、快速滚过、点击直达；录20—24秒完整画面，五帧截图辅助解释，不能用截图替代播放。
验收：看得出“进入下一层”的遮挡与差速；没有整图拉伸、断手、文字被入口吞没或不必要长滚动。功能通过不等于视觉接受。

## Task 4：Hug对照试验与节奏收敛
Files: 同一pilot增加Hug配置与分镜，不另建第二套控制器。
- [ ] 先写Hug端态及反向测试，确保不继承START票面放大行为；确认失败后补配置。
- [ ] 以宽景水面、水平光带与花园边界交接制作安静版本；远近差异只在真实图层存在时启用。
- [ ] 与START并排检查：两章至少两项差异，实际阅读不晃、不强制驻留、不重复穿洞。
- [ ] 用相同浏览器检查与连续证据验收；修改共享控制器后只补跑受影响测试与两章回归。
验收：同一系统支持鲜明与安静两种节奏。若只有一种效果可用，不推广九章。

## Task 5：接入全站与真实作品阅读
Files: 合格后创建site-v5-candidate；修改候选的index.html、各章HTML、scene-motion.mjs/相关样式；新模块职责参照pilot保持。
- [ ] 从任务1核实基线按白名单创建候选，不从旧ZIP恢复；保存复制文件与源图哈希，不带未启用变形实验进运行入口。
- [ ] 先写回归：全部十个页面可直达、首页九幕与作品速览入口不丢；hash/后退/刷新中段正确；导航焦点可见。
- [ ] 仅替换已合格章节的空间交接，并解绑同节点旧控制器。其余章节先保证静态构图与阅读，再按规格逐章推广，禁止一次性九章套模板。
- [ ] AI保持手机固定与不露屏；5秒滑/2秒停单独登记为资产依赖任务，不以降低幅度掩盖不自然。About递卡保持未启用，除非新资产独立通过。
- [ ] 真实正文与项目展示优先：只接入有来源/公开许可的内容；缺失项在内部缺口表，公开页不假装“已完成”。
- [ ] 逐章检验200%缩放、390×844重排、键盘直达；无动画和失败模式下内容同样完整。
- [ ] 回归测试分为当前运行模块、历史实验、纯HTTP/链接三类，各自报数；旧实验通过数不计入当前功能证明。
验收：导航、作品、章节节奏完整，不以“动画已接上”宣称内容已齐全。

## Task 6：连续视觉、性能、审查与交付
Files: 候选evidence、VALIDATION.md、CURRENT-STATUS.md；最终审阅后才变更正式指针。
- [ ] 在已连接Chrome验证桌面两档及窄屏，记录真实URL、版本、时间、硬件/浏览器与实际加载模块；页面版本标识仅用于检查，不污染产品界面。
- [ ] 连续测试：停滚、反滚、快速跳转、动态开关、系统设置变更、后台恢复、图片/JS失败；对关键章各录20—24秒。
- [ ] 测量30秒帧时间/长任务，记录采样方法和局限；p95超过33.3ms或出现可见卡顿则定位瓶颈，不编造FPS、不同设备不混算。
- [ ] 独立代码审查关注控制器冲突、资源释放、失败回退、焦点和内容真实性；视觉审阅关注构图、边缘、接触关系与节奏，两者结果分开。
- [ ] 按根因停止规则处置失败；未解决项回退到静态/上一个已通过版本，不能自动更新截图基准掩盖问题。
- [ ] 整理审阅包：新旧对照、准确预览入口、证据、内容缺口、实际生效能力、回退步骤。获得候选视觉接受后再切默认指针；发布另外遵循用户授权范围。
- [ ] 云端完成时核对commit/branch/PR、未提交和未推送工作；报告测试与云端artifact。若只本地完成，明确本机原因和文件变更，不说已同步。
验收：功能正确、视觉自然、性能测量、用户接受四列独立，未完成项不混成“全通过”。

## 优先级与推进闸门
P0：基线/研究复核、内容资产审计、START静态与连续空间试验、Hug节奏对照。
P1：全站入口与阅读完善、合格机制逐章推广、降级与性能验收。
P2：真实人体动作、声音、额外3D等独立增强；不阻塞作品集可阅读交付。
每一阶段交一个可审阅结果；不提前承诺总工期，先根据素材完备度和单章实测估算。下一步是任务1和START空间分镜，不是重新生成九张图或恢复递卡实验。

## 本轮完成范围
已读取现有研究、最新状态与关键模块，完成规格和实施计划。仅新增两个Markdown；未改网站代码/资产、未启动服务、未运行产品测试、未开分支/PR、未推送、未生成云端artifact。计划是后续执行依据，不是效果已完成或用户已接受的证明。

