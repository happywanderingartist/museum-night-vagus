# Vagus · 完整页面试作 v3

本版先完成剩余页面，3D统一后置。原site-v2、灰模、模型源文件与历史ZIP保留；本版不加载Three、WebGL或模型。

## 打开

已有Node.js时，在本目录双击start.cmd，保留终端窗口，用Google Chrome打开 http://127.0.0.1:4182 。首页可进入探索；works.html是可筛选的作品速览。Ctrl+C停止本机服务。无需npm install或外部账户。file://直接打开时静态文字与普通链接仍在，模块交互需要本机服务。

## 页面

| 文件 | 内容 |
|---|---|
| index.html | 首页与9幕连续展厅 |
| works.html | 7个展示方向的搜索、分类与直达 |
| ai.html | 已提供的3个主题与原文接入位 |
| start.html / hug.html | 两个独立数字产品项目页 |
| xiaohongshu.html | 账号定位、选题与制作、真实代表笔记入口 |
| podcast.html | 节目定位、制作过程与原生音频播放器接入 |
| literature.html | 活动背景、策划、物料与现场证据结构 |
| visual.html | 真实个人作品接入位、独立网站艺术试稿画廊 |
| about.html | 已确认的介绍、项目索引、简历与联系入口 |

每个项目页可返回展厅/速览，并从页末进入前后项目。首页导航初始隐藏，下滚显现；系统减少动态优先。画廊代码支持方向键、Esc、关闭后回到原入口；真实材料缺失时不显示假音频、假指标或虚构履历。

## 真实材料

音频、文章原文URL、个人高清作品、简历、邮箱和具体履历尚未提供；页面结构完成不代表这些材料已经接入。把确认可公开的文件放入public/，再编辑assets/site-content.json，字段说明见CONTENT-GUIDE.md。服务器支持PDF和音频字节范围读取，便于文档与进度定位。网站艺术试稿与个人真实作品分组查看。

## 素材与源码

五幅新无字画面由内置image_gen生成，原始PNG保存在sources/artwork，网页WebP在assets，准确提示词与来源哈希在sources/。UI全部是HTML/CSS，不烧进图片。当前运营图为衣着完整的古典编辑；About为画中人物递名片。人物是网站艺术角色，不是真实作者照片。当前母版路径以sources/artwork-manifest.json为准。

HTML由scripts/build-pages.cjs和sources/templates生成。若需要重建，先备份手动修改的HTML，再修改生成器并运行 node scripts/build-pages.cjs 。构建不会重置assets/site-content.json。CSS与交互模块可直接编辑。图片格式转换脚本只用于重建网页WebP，播放网站不需要Python。

## 验证边界

代码/资源/片段与本机HTTP检查见VALIDATION.md。2026-10-28经用户明确授权后完成有限Chrome实测：六组动作实际运行、开关及离屏停止、思想者手机固定；965×437六页及1440×900首页/运营/关于已检查。实际截图与数据在evidence/chrome-2026-10-28。持续FPS、全设备、真实媒体与辅助技术尚未验收。此前被拒的浏览器请求保留在历史记录，没有换入口绕过。

历史保留核验脚本scripts/preservation.py只在原项目运行，因为它读取未打入便携包的旧版本ZIP；其已执行结果在evidence/preservation.json。便携包内的Node测试、网站运行与素材重建不依赖历史目录。

2026-10-27更新：当前源码已加入第一轮二维动效，刷新预览可加载；21项代码/HTTP回归通过。详见MOTION-01.md。旧2026-10-26 ZIP保持原样，不包含本轮更新。

人物动作第二轮：当前运营图为衣着完整的古典编辑人物，About为画中人物递名片。已接入局部眨眼与手指滑动二维试作。重建素材应使用更新后的prepare-art.py与prepare-character-art.py，当前原稿清单见sources/artwork-manifest.json。实际状态见CHARACTER-MOTION-02.md。

人物动作第三轮：六组角色动作已接入，当前34项回归与11个HTTP资源哈希通过，18张原画关键帧已检查。打开预览可查看；Chrome实际播放与FPS尚未验收。当前是二维微动，3D制作方案见3D-DIRECTION-03.md，操作与验收说明见CHARACTER-MOTION-03.md。

2026-10-28补验已完成：此前“Chrome实际播放尚未验收”是历史记录，当前有限验收范围与未测项以CHARACTER-MOTION-03.md末节为准。
