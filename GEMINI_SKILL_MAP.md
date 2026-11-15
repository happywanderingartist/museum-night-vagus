# Gemini Skill 参考与工作顺序

更新于 2026-11-15。以下是用户选定的 7 个外部 Skill 与 4 个标准案例/规范链接。本文把链接和适用边界写入项目交接；没有把外部 SKILL.md 整包复制进仓库，也没有声称 Gemini AI Studio 已安装这些包。#10 与 #5、#11 与 #6 是重复链接，保留用户给出的编号以便对应。

## 7 个 Skill

| 编号 | Skill | Gemini 中的用途 |
| --- | --- | --- |
| 1 | [Competitive Analysis｜竞品分析](https://github.com/product-on-purpose/pm-skills/blob/main/skills/discover-competitive-analysis/SKILL.md) | 比较 START/HUG 的直接、间接方案，记录目标任务、功能差异、定位、来源置信度与可行动结论。采用用户建议的优先项。 |
| 2 | [JTBD Canvas｜用户需求洞察](https://github.com/product-on-purpose/pm-skills/blob/main/skills/define-jtbd-canvas/SKILL.md) | 需要澄清用户在什么情境下要完成什么进展时使用；功能、情绪、社会任务须有访谈或观察支持，不能当作已证实的用户洞察。 |
| 3 | [Design Rationale｜设计决策分析](https://github.com/product-on-purpose/pm-skills/blob/main/skills/develop-design-rationale/SKILL.md) | 新页面或交互有多个合理方向时，写出问题、方案选项、评价标准、取舍、后续条件。采用用户建议的优先项。 |
| 4 | [Positioning Statement｜产品定位文案](https://github.com/sethdford/claude-skills/blob/main/product-manager/strategy/skills/positioning-statement/SKILL.md) | 需要重定产品定位时梳理目标人群、需求、替代方案、差异和情绪价值；将客户测试列为验证步骤。 |
| 5 | [Competitive Brief｜专业竞品分析简报](https://github.com/anthropics/knowledge-work-plugins/blob/main/product-management/skills/competitive-brief/SKILL.md) | 需要较完整的竞品简报时补充能力领域、变化、影响、时间线和业务含义；与 #1 重叠，不必每次重复做两份分析。 |
| 6 | [Copywriting｜产品介绍及网页文案](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md) | 写首页、产品页和案例页前先定页面目的、受众、产品和上下文；要求具体、可核实的表述，逐条核对主张证据。采用用户建议的优先项。 |
| 7 | [Product Marketing｜产品营销与叙事](https://github.com/coreyhaines31/marketingskills/blob/main/skills/product-marketing/SKILL.md) | 新项目或定位改变时整理产品、目标受众、竞争、差异、客户语言和品牌声音，作为其他营销/文案工作的上下文。 |

## 4 个标准案例与规范

8. [竞品分析完整示例](https://github.com/product-on-purpose/pm-skills/blob/main/skills/discover-competitive-analysis/references/EXAMPLE.md)：参考报告章节、比较表、定位图和证据组织，不复制其中市场结论或数字。

9. [设计决策分析完整示例](https://github.com/product-on-purpose/pm-skills/blob/main/skills/develop-design-rationale/references/EXAMPLE.md)：参考多个方案的公平比较、标准、取舍和决策记录结构，不把示例用户研究当成 Vagus 研究。

10. [Anthropic 官方竞品研究规范](https://github.com/anthropics/knowledge-work-plugins/blob/main/product-management/skills/competitive-brief/SKILL.md)：与 #5 同一文件；用作竞品简报的第二个入口，不重复导入。

11. [产品页面文案写作规范](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md)：与 #6 同一文件；重点复用“先看清输入、按证据写主张”的流程。

用户建议的优先项是 1、3、6、8、9。7 可先用来更新项目/产品上下文；需要明确用户任务时再用 2，需要重新定位置时再用 4，需要更完整的竞品决策材料时再用 5/10。每项只在适用时调用，不要为了套模板重复分析。

## 本项目的执行顺序

1. 先用中文读取 GEMINI.md、GEMINI_HANDOFF.md、GEMINI_COPY_SOURCEBOOK.md 和现有 START/HUG 页面事实文件。仓库目前没有完整简历资料包；不要声称读过未入库资料。
2. 开始新的页面或视觉设计前先提交方案供用户确认。方案写明受众/JTBD、证据与未知项、定位或竞品判断、参考网站可复用点及局限、页面结构、2–3 个可比较方向、风险、响应式/无障碍/动效退路和验收证据。未获确认前只做只读研究，不改页面。
3. 用户确认方向后，再按需进行 JTBD、定位或竞品分析；写网页文案时用 #6 核对页面目的、受众、语气与每条事实主张的证据。
4. 把 #8/#9 当结构示例。先前完整竞品示例里有 133 个标为 fictional 的内容，设计决策示例里有 16 个标为 fictional 的内容；数字、研究和用户结论都不能迁移为本站事实。
5. 对 START/HUG 的功能、职责、验证状态和心理效果，以 GEMINI_COPY_SOURCEBOOK.md 与已提交案例事实文件为准；事实不足就标“待补证/未验证”，先问用户，不补造。

## 上游来源审阅

下表是在 2026-11-15 对用户指定的 GitHub 源进行的静态审阅快照。Stars 只记录当时规模，不作为质量证明。我们只引用/改写工作流程，没有复制源码，也没有运行这些外部仓库的测试。

| 上游仓库 | 当时可见的维护与许可证 | 可复用优势 | 明确局限 |
| --- | --- | --- | --- |
| [product-on-purpose/pm-skills](https://github.com/product-on-purpose/pm-skills) | 约 805 stars；最新提交 2026-11-14；Apache-2.0；README 声明 68 个 Skill、200+ 示例和 CI 合同 | 分析步骤、置信度标注、质量清单和案例结构完整 | 示例面向项目管理软件市场，示例含大量 fictional 标记；其用户、价格与能力数据不能用于本站 |
| [sethdford/claude-skills](https://github.com/sethdford/claude-skills) | 约 48 stars；最新提交 2026-03-11；MIT | 定位陈述简洁，按人群、需求、替代、差异、情绪与测试逐步构造 | 更新节奏和独立维护证据弱于其余来源；命令针对 Claude，不是 Gemini 的直接安装格式 |
| [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | 约 36k stars、约 1,149 commits；最新提交 2026-11-13；Apache-2.0 | 竞品简报强调变化、影响、时间线和战略含义，适合做决策材料 | 仓库面向 Claude Cowork/Claude Code 插件；较完整的企业分析会超过个人案例页所需范围 |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 约 60.4k stars、约 8.8k forks；最新提交 2026-11-11；MIT | 产品营销上下文与文案技能互相引用；文案技能强调可证明的主张和输入诊断 | 默认偏增长/转化营销语境；个人作品集要保留叙事与事实边界，不能为了营销效果扩大承诺 |

核对了用户提供的 Skill 文件、两个例子、四个仓库许可证、README 和 GitHub 当前可见的活动信息。没有安装外部 Skill、没有复制完整 Skill 内容、也没有运行外部测试；项目内可复用内容以本文件及 GEMINI.md 里的 Gemini 规则为准。
