# 剩余五幕分镜与资产合同 · 2026-10-26

最新用户要求先完成页面，再统一处理3D。本批F0/F3页面结构已实现，F1只含一次台词进入、人物静态；F2是普通文档流交接，不假称角色动作、几何变形或空间拉远已经完成。UI和背景图片分开，五幕分别有无字PNG母版和WebP；没有人物透明分层、深度图或骨骼资产。

## 运营几何

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 近白/炭黑/信号红；全幅圆方构图，人物右侧；真实HTML标题与直接入口 | R：无需等动画 | 展示方向可读，真实笔记和数据未提供；有明确状态 | 原图无UI |
| F1 | 同一画面，现代物件/动作关系保持静态 | A：台词“这张封面，改了第几版？”首次进入后短显 | 入口始终可点 | 人物局部动作未制作 |
| F2 | 艺术画面结束，与同章阅读底色交接 | S：普通滚动；C：直接进入独立页 | 阅读立刻接管 | 无pin，无计时等待，不宣称图层/3D转场 |
| F3 | 定位→选题与制作→真实笔记 | R：正常正文/链接/控件 | 真实笔记和数据未提供；有明确状态 | 不是作品证据已补齐 |

~~~yaml
shot_id: XIAOHONGSHU-STATIC-01
source_art: 'sources/artwork/xiaohongshu.png，内置image_gen原创AI辅助艺术试稿'
layout_desktop: '近白/炭黑/信号红；全幅圆方构图，人物右侧'
layout_mobile: '静态同画面重裁，正文单列；尚待浏览器验收'
modern_gag: '运营几何对应现代封面/耳机/对讲机/绘图笔或原创谢幕意象'
auto_bubble: '这张封面，改了第几版？；UI文字，非图片内文字'
trigger: '进入可见区一次；正常滚动或入口直接阅读'
transition: '本批为原生文档流与底色交接，复杂动作/空间留后'
transition_target_ms: '台词3500ms含阅读停留；非阻塞转场时长'
scroll_pin: false
click_required: ['阅读内容', '主动播放真实音频（有素材后）', '查看图片', '简历与联系']
real_content_visible_in_f3: ['真实笔记和数据未提供；有明确状态']
media_assets: ['无字PNG母版', '同图WebP', '独立HTML/CSS UI']
implementation: ['原生HTML/CSS', 'IntersectionObserver一次台词', '普通锚点/独立URL']
reduced_motion: '停台词运动，完整静态画面和普通阅读保留'
qa: ['无3D加载', '页面入口无需等待', '原始比例作品', '无假指标/音频', '浏览器检查尚未完成']
~~~

## 耳机少女

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 茄紫/珍珠白/银灰；左肖像右内容；真实HTML标题与直接入口 | R：无需等动画 | 展示方向可读，音频未提供；播放器不显示假进度 | 原图无UI |
| F1 | 同一画面，现代物件/动作关系保持静态 | A：台词“嘘，有人在说话。”首次进入后短显 | 入口始终可点 | 人物局部动作未制作 |
| F2 | 艺术画面结束，与同章阅读底色交接 | S：普通滚动；C：直接进入独立页 | 阅读立刻接管 | 无pin，无计时等待，不宣称图层/3D转场 |
| F3 | 节目定位→制作过程→实际音频 | R：正常正文/链接/控件 | 音频未提供；播放器不显示假进度 | 不是作品证据已补齐 |

~~~yaml
shot_id: PODCAST-STATIC-01
source_art: 'sources/artwork/podcast.png，内置image_gen原创AI辅助艺术试稿'
layout_desktop: '茄紫/珍珠白/银灰；左肖像右内容'
layout_mobile: '静态同画面重裁，正文单列；尚待浏览器验收'
modern_gag: '耳机少女对应现代封面/耳机/对讲机/绘图笔或原创谢幕意象'
auto_bubble: '嘘，有人在说话。；UI文字，非图片内文字'
trigger: '进入可见区一次；正常滚动或入口直接阅读'
transition: '本批为原生文档流与底色交接，复杂动作/空间留后'
transition_target_ms: '台词3500ms含阅读停留；非阻塞转场时长'
scroll_pin: false
click_required: ['阅读内容', '主动播放真实音频（有素材后）', '查看图片', '简历与联系']
real_content_visible_in_f3: ['音频未提供；播放器不显示假进度']
media_assets: ['无字PNG母版', '同图WebP', '独立HTML/CSS UI']
implementation: ['原生HTML/CSS', 'IntersectionObserver一次台词', '普通锚点/独立URL']
reduced_motion: '停台词运动，完整静态画面和普通阅读保留'
qa: ['无3D加载', '页面入口无需等待', '原始比例作品', '无假指标/音频', '浏览器检查尚未完成']
~~~

## 文学节催场

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 钴蓝/煤黑/橘红；对角线舞台光；真实HTML标题与直接入口 | R：无需等动画 | 展示方向可读，现场照片、职责与复盘待提供 | 原图无UI |
| F1 | 同一画面，现代物件/动作关系保持静态 | A：台词“灯光就位，作家呢？”首次进入后短显 | 入口始终可点 | 人物局部动作未制作 |
| F2 | 艺术画面结束，与同章阅读底色交接 | S：普通滚动；C：直接进入独立页 | 阅读立刻接管 | 无pin，无计时等待，不宣称图层/3D转场 |
| F3 | 活动背景→策划物料→真实现场 | R：正常正文/链接/控件 | 现场照片、职责与复盘待提供 | 不是作品证据已补齐 |

~~~yaml
shot_id: LITERATURE-STATIC-01
source_art: 'sources/artwork/literature.png，内置image_gen原创AI辅助艺术试稿'
layout_desktop: '钴蓝/煤黑/橘红；对角线舞台光'
layout_mobile: '静态同画面重裁，正文单列；尚待浏览器验收'
modern_gag: '文学节催场对应现代封面/耳机/对讲机/绘图笔或原创谢幕意象'
auto_bubble: '灯光就位，作家呢？；UI文字，非图片内文字'
trigger: '进入可见区一次；正常滚动或入口直接阅读'
transition: '本批为原生文档流与底色交接，复杂动作/空间留后'
transition_target_ms: '台词3500ms含阅读停留；非阻塞转场时长'
scroll_pin: false
click_required: ['阅读内容', '主动播放真实音频（有素材后）', '查看图片', '简历与联系']
real_content_visible_in_f3: ['现场照片、职责与复盘待提供']
media_assets: ['无字PNG母版', '同图WebP', '独立HTML/CSS UI']
implementation: ['原生HTML/CSS', 'IntersectionObserver一次台词', '普通锚点/独立URL']
reduced_motion: '停台词运动，完整静态画面和普通阅读保留'
qa: ['无3D加载', '页面入口无需等待', '原始比例作品', '无假指标/音频', '浏览器检查尚未完成']
~~~

## 绘图笔双手

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 暖灰白/石灰；超宽局部与中央留白；真实HTML标题与直接入口 | R：无需等动画 | 展示方向可读，个人作品待提供；网站AI试稿另分组 | 原图无UI |
| F1 | 同一画面，现代物件/动作关系保持静态 | A：台词“灵感已发送。”首次进入后短显 | 入口始终可点 | 人物局部动作未制作 |
| F2 | 艺术画面结束，与同章阅读底色交接 | S：普通滚动；C：直接进入独立页 | 阅读立刻接管 | 无pin，无计时等待，不宣称图层/3D转场 |
| F3 | 完整作品→局部→应用情境 | R：正常正文/链接/控件 | 个人作品待提供；网站AI试稿另分组 | 不是作品证据已补齐 |

~~~yaml
shot_id: VISUAL-STATIC-01
source_art: 'sources/artwork/visual.png，内置image_gen原创AI辅助艺术试稿'
layout_desktop: '暖灰白/石灰；超宽局部与中央留白'
layout_mobile: '静态同画面重裁，正文单列；尚待浏览器验收'
modern_gag: '绘图笔双手对应现代封面/耳机/对讲机/绘图笔或原创谢幕意象'
auto_bubble: '灵感已发送。；UI文字，非图片内文字'
trigger: '进入可见区一次；正常滚动或入口直接阅读'
transition: '本批为原生文档流与底色交接，复杂动作/空间留后'
transition_target_ms: '台词3500ms含阅读停留；非阻塞转场时长'
scroll_pin: false
click_required: ['阅读内容', '主动播放真实音频（有素材后）', '查看图片', '简历与联系']
real_content_visible_in_f3: ['个人作品待提供；网站AI试稿另分组']
media_assets: ['无字PNG母版', '同图WebP', '独立HTML/CSS UI']
implementation: ['原生HTML/CSS', 'IntersectionObserver一次台词', '普通锚点/独立URL']
reduced_motion: '停台词运动，完整静态画面和普通阅读保留'
qa: ['无3D加载', '页面入口无需等待', '原始比例作品', '无假指标/音频', '浏览器检查尚未完成']
~~~

## 展览谢幕

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | 白/石墨灰；小人物、卷纸、明亮空间；真实HTML标题与直接入口 | R：无需等动画 | 展示方向可读，只使用已确认介绍；无虚构履历与邮箱 | 原图无UI |
| F1 | 同一画面，现代物件/动作关系保持静态 | A：台词“看完展了，来认识一下作者？”首次进入后短显 | 入口始终可点 | 人物局部动作未制作 |
| F2 | 艺术画面结束，与同章阅读底色交接 | S：普通滚动；C：直接进入独立页 | 阅读立刻接管 | 无pin，无计时等待，不宣称图层/3D转场 |
| F3 | 介绍→方向→经历→简历与联系 | R：正常正文/链接/控件 | 只使用已确认介绍；无虚构履历与邮箱 | 不是作品证据已补齐 |

~~~yaml
shot_id: ABOUT-STATIC-01
source_art: 'sources/artwork/about.png，内置image_gen原创AI辅助艺术试稿'
layout_desktop: '白/石墨灰；小人物、卷纸、明亮空间'
layout_mobile: '静态同画面重裁，正文单列；尚待浏览器验收'
modern_gag: '展览谢幕对应现代封面/耳机/对讲机/绘图笔或原创谢幕意象'
auto_bubble: '看完展了，来认识一下作者？；UI文字，非图片内文字'
trigger: '进入可见区一次；正常滚动或入口直接阅读'
transition: '本批为原生文档流与底色交接，复杂动作/空间留后'
transition_target_ms: '台词3500ms含阅读停留；非阻塞转场时长'
scroll_pin: false
click_required: ['阅读内容', '主动播放真实音频（有素材后）', '查看图片', '简历与联系']
real_content_visible_in_f3: ['只使用已确认介绍；无虚构履历与邮箱']
media_assets: ['无字PNG母版', '同图WebP', '独立HTML/CSS UI']
implementation: ['原生HTML/CSS', 'IntersectionObserver一次台词', '普通锚点/独立URL']
reduced_motion: '停台词运动，完整静态画面和普通阅读保留'
qa: ['无3D加载', '页面入口无需等待', '原始比例作品', '无假指标/音频', '浏览器检查尚未完成']
~~~

## 统一验收状态

代码、链接、资源和本机HTTP已检查；新生成母版可直接查看。浏览器自动审批因用量限制未完成，未进行新版网页的桌面/窄窗渲染和实际交互验收，也未以其他浏览器或工具绕过。3D、脸/手动作、完整分层、深度空间与复杂F2全部后置。
