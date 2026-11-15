# 参考2／3／4：滚动、说明与阅读交接

2026-11-01。对象是 The Boat、Tracing Art、Sculpting Harmony。只做研究与设计修订，不开发网站。以下将制作方说明、原站内容、设计推断分开记录。

## 可用证据与限制

本轮重新读取三个原站、SBS／Getty 官方说明，以及制作方 Distil、Resn 的访谈。尝试启动并绑定 Google Chrome：启动请求超时后，窗口确已出现；但两次绑定均返回“window id 41420494 no longer belongs to Chrome; current owner is Chrome”。刷新窗口清单后问题仍在；没有切换其他浏览器，没有更改浏览器设置。本轮未获得连续滚动截图或录像，因此不能报告具体帧率、实测毫秒、停滚惯性或某一镜头的精确轨迹。搜索工具的图片展开还出现两站返回同一图片地址的情况，没有据此认定两站图面相同。

## 三站分别值得迁移的内容

| 参考 | 核实到的事实／制作方说明 | 对 Vagus 的设计判断 | 明确局限 |
|---|---|---|---|
| 2 The Boat | SBS 说明访客可以自行控制向下阅读、停留与回看；Distil 说明原始手绘扫描作为三维场景里的对象处理，并将插画师手写制作成多套定制字体 | 图片、文字与节奏必须对应同一叙事段落。让一个有意义的物件引出原简介，强动作与安静阅读交替；保持绘画媒介统一 | 船的摇晃与声音服务特定故事，不宜移植到作品集。没有合格图层，不能仅凭整图宣称拥有相同三维能力 |
| 3 Tracing Art | Getty／Resn 自述以三章连续叙事组织内容，垂直进度与可展开章节菜单帮助定位；原站用作品、档案和年份解释所有权变化 | 交接需要一个持续可理解的对象和一个稳定阅读锚点。Vagus 可从现代工作物件接到“AI 如何进入真实生活”的原简介；标题先建立位置，正文接着解释 | 不复制其时间线、作品史资料或进度条；其滚动库和惯性不自动适合本站。参数需要自己试制 |
| 4 Sculpting Harmony | Resn 说明采用半线性叙事，允许适时深入探索；Getty 原站区分互动故事和深入阅读，并提供回到故事的路径。动态字形意在呼应 Gehry 的建筑、音乐与个性 | 把“看一段场景”和“停下来读内容”作为不同密度的状态，过渡时改变画面占幅与文字主次，阅读时停止镜头。Vagus 的文字动效应解释内容，而非持续表演 | 真实模型来自长期档案与三维数字化；不能让当前石像图片任意转身。其字形伸缩有自身主题，不能据此拉伸中文宋体 |

主要依据：[SBS 对 The Boat 的制作介绍](https://www.sbs.com.au/whats-on/article/the-sound-and-vision-of-the-boat/67xsuhjh5)、[Distil 制作说明](https://www.distil.im/projects/the-boat)、[Getty／Resn 对 Tracing Art 的回答](https://www.commarts.com/webpicks/tracing-art)、[Tracing Art 原站](https://www.getty.edu/tracingart/)、[Resn 对 Sculpting Harmony 的回答](https://www.commarts.com/webpicks/sculpting-harmony)、[Sculpting Harmony 原站](https://gehry.getty.edu/)。[Getty 官方介绍](https://www.getty.edu/news/getty-spotlights-the-frank-o-gehry-papers/)进一步确认其模型、草图、影像与互动三维资料的基础。

## 对当前稿的诊断与修改依据

v3 的两个绘画平面相距2个世界单位，中途 AI 只有约64%视口宽，四周大量待补区使它看起来像一个悬浮矩形；首页最后露出的桌沿还放大到约3.215倍。坐标虽连续，画面重心、阅读锚点与内容解释却尚未连续。这是对本项目分镜的判断，不是假称参考站采用了相反参数。

v4 因此缩短前后距离、让 AI 环境作为满幅底面承接，再以“手机／古书→原标题→原简介→三入口”组织说明。首页桌沿只作一次前景遮挡，不另加完整画框或解释卡片；终态继续原 HTML/CSS。新的图面用现有整图定位，正式分层、延展和接触组仍要审计。

原站实际字体栈为：字标 Times New Roman；标题 STZhongsong／华文中宋／Noto Serif SC／serif；正文 DengXian Light／等线 Light／DengXian／Microsoft YaHei／sans-serif。CSS 已有 font-synthesis:none；资产目录未发现网页字体文件，当前仍依赖系统回退，不能把栈里的名字当作所有设备上实际使用的字体。本轮不更换字库，不下载字体，不认定再分发授权已核实。

下一次若取得可控 Chrome，应逐站记录同一段进入、停滚、反向、快滚、阅读释放五种输入，再判断真正需要的阻尼和驻留长度；本轮的设计参数均属于 Vagus 提案。
