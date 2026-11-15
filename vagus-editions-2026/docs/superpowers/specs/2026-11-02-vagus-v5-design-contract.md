# Vagus v5 审阅入口与决策记录

2026-11-02。面向查看作品的访客与后续设计/制作人员。本轮目标是可审阅的设计方案和 SVG，不是网站实现。方向建议为：保留两幅原画与原排版，通过一次绘本式画层展开接入新展廊，再向内行进到原 AI 阅读状态。原图没有现成通道，新的连接环境仍需制作。

## 先看这五项

| 交付 | 文件与重点 |
| --- | --- |
| 空间关系 | [空间剖面 SVG](2026-11-01-vagus-continuous-gallery-v5-space.svg)：原画是独立合成层，主相机只在新环境里前进 |
| 五个关键帧 | [五帧 SVG](2026-11-01-vagus-continuous-gallery-v5-frames.svg) / [PNG 预览](2026-11-01-vagus-continuous-gallery-v5-frames.png)：原首页、画层展开、途中、到达、阅读 |
| 镜头与文字时序 | [主方案第 5 节](2026-11-01-vagus-continuous-gallery-v5.md#5-镜头滚动和文字如何接力)：1.2H 初值、.26—.88 前行、可停可逆、直达可跳过 |
| 素材与画质 | [素材合同](2026-11-01-vagus-continuous-gallery-v5-assets.md)：完整原图已有；连续环境缺失；分层、补全、授权待审计 |
| 阅读终态 | [阅读 SVG](2026-11-01-vagus-continuous-gallery-v5-reading.svg) / [PNG 预览](2026-11-01-vagus-continuous-gallery-v5-reading.png)：原文、三入口、原版位与返回方式 |

简明执行规范见 [DESIGN](2026-11-02-vagus-v5-DESIGN.md)，后续制作入口见 [交接说明](2026-11-02-vagus-v5-implementation-handoff.md)。

## 依据与可信度

| 依据 | 等级 | 能支持什么 |
| --- | --- | --- |
| 当前会话：保留原页面、希望向里延伸、反对左右滑动与反复退进 | provided | 设计目标与否定条件 |
| home.webp / ai.webp 及当前 index.html / style.css | observed | 原画、文案、字号与版位规则；不代表全部运行样式已经复现 |
| 六段 MP4 的约每半秒时间序列 | observed | 可见构图与前后变化；不支持精确缓动、滚动距离或引擎判断 |
| 四个详情页公开正文与截断提示词 | observed | 公开描述和部分目标，未读到完整提示词 |
| 画层开口、新展廊、1.2H、时序与有限 Three.js | inferred / proposal | 本次为适配原画而提出的设计，尚待审阅与验证 |

观察记录见 [原始核查](../../../research/2026-11-01-motionsites-video-observation/2026-11-01-observations.md)。Cosmic Mapping 未取得有效演示，不列入参考结论。

## 每个参考的迁移边界

| 参考 | Keep：保留的机制 | Change：适配到 Vagus | Do not copy：不采用的原内容 |
| --- | --- | --- | --- |
| Urban Jungle | 前景掠过、深处目标、到达后说明 | 列车纵深改为绘画展廊；回到原 AI 版位 | 植物车厢、黄色车门、品牌与原说明面板 |
| Bitcoin Yield | 环境连续展开、文字独立换段 | 云山水路改为浅青到深绿的室内材料关系 | 山水原图、Meridian 品牌、金融文案与黑卡 |
| Sea Serenade | 游览到稳定阅读的尺寸/密度变化 | 保留原 AI 满幅构图，先停镜头再读 | 海岸素材、岸线剧情、原标题及固定视频路线 |
| Golden Portal | 绘画轮廓承接章节、稳定定位 | 云边改为浅青画层轮廓和深绿墙缘 | 金色天空、飞鸟、Still Frame 文案及原品牌 |
| Nature Portfolio | 关键入口一次、作品展开后阅读 | 使用原画色层开口，不增加人物观看角度 | 眼睛/森林素材、球形图库、摄影作品与文案 |
| Art Landing | 古典与现代共处、边缘连接安静正文 | 继续使用已有粉电脑、猫杯桌及手机古书 | 红底、泳圈、参考人物拼贴及原品牌 |

## 制作条件与待确认偏好

必须满足：原画接触关系与观看角度、缺口补全、实际清晰度、单一控制权、原生阅读和失败恢复。原图约 1672px；只放大导出不能补回细节。入口初版可统一遮罩整幅原画；如果进一步拆层产生位移，就必须先有合格底图与外扩。新增展廊要先通过灰模与画面接缝验证，不能把本图的平涂色块当正式美术。

待用户确认的偏好：绘本式画层展开与新增短展廊；约 1.2H 的行程初值；明显穿行只用于首页到 AI、进入阅读后停稳。三项都是本次提案，没有写成用户已经接受。

## 本轮核对结果

三张 SVG 已栅格化并目视检查；本地链接有效，SVG ID/内部引用有效，嵌入的原画 PNG 与原 WebP 解码后的 RGB 像素一致。独立审阅曾指出“从无门的原图如何进入通道”不明确，现已明确采用非物理画层展开，复核无其余重大未答设计问题。网站目录 Git diff 为空。

上述只证明设计文件的完整性与接缝定义已明确。连续效果、画质、性能、交互、可访问性和用户视觉接受仍待后续制作验证。本轮使用了 vagus-storyboard、vagus-editions-art-direction、brainstorming、reference-design-contract 与 verification-before-completion。

仓库 happywanderingartist/museum-night-vagus，分支 main；仅在 D 盘新增设计文档、图稿与生成/检查辅助文件，未提交、推送或发布，没有云工件。原画在本机，本轮没有接入云端设计渲染环境，因此本地制作交付。
