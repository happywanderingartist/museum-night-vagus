# 来源审阅 · 2026-10-24

R2修正补查（2026-10-25）：实现前重新搜索GitHub官方仓库的[Object3D坐标转换文档](https://github.com/mrdoob/three.js/blob/dev/docs/pages/Object3D.html.md)，复用现有0.186.1版本的localToWorld/worldToLocal和矩阵更新。优势是用真实屏幕变换约束指尖；局限是不会识别绘画中的解剖结构，需要人工锚点及浏览器视觉复核。下文星标和提交为初轮观察，不当本轮最新值；没有新增依赖。

## 本轮实现前的开源核查

GitHub公开项目：[mrdoob/three.js](https://github.com/mrdoob/three.js)，原作者/维护者生态为mrdoob及持续贡献者，MIT许可证；本轮页面观察约116.9k星，仅作活跃度线索，不作为质量证明。公开仓库包含单元、addons、lint和浏览器端测试配置；本轮未运行上游全套测试。观察到近期提交 `5e6eee6ce8757abde7105aba35a358feac986e91`，时间2026-10-24T08:36:41Z，PLYExporter量化属性修复。这是观察时的开发分支提交，不是安装包提交标识。CLI GitHub搜索因未登录失败，随后改读公开仓库和官方文档。

可复用优势：成熟的glTF模型加载、AnimationMixer播放、WebGL渲染与测试组织，适合本轮局部道具和动作播放。明确局限：不会从一张画自动生成精确人物或绑定；加载成功不证明手指接触合理，也不证明网页流畅。因此未照搬网站完整代码，只复制官方模块并独立制作几何、时序和页面。

实际安装的是官方npm注册表 `three@0.186.1`，锁文件保留integrity；`vendor/three/LICENSE`随包保留。参考：[Three.js动画系统](https://threejs.org/manual/pages/animation-system.html)。

## Blender

官方免安装包：[Blender 4.5.15 Windows x64](https://download.blender.org/release/Blender4.5/blender-4.5.15-windows-x64.zip)，来自官方发布索引；官方同版SHA256文件核验一致。包大小398,649,826字节，SHA256：`52dd02fd74877fa08e74b67d7854cf32468a232c02aaa19b6844c91285574f8d`。后台运行报告 Blender 4.5.15 LTS，build hash `5afeabba6097`。

依据[Blender许可说明](https://www.blender.org/about/license/)，程序为自由软件；本轮只使用本地建模、导出与渲染，不需要生成积分。Blender程序未打入便携网页ZIP；官方包、校验文件、解压目录保留在原项目toolchain内。未修改系统PATH、文件关联、浏览器安全设置或账户凭据。

## 原图与文字

原画来源为本项目 `storyboards/batch-01/assets/thinker-master.png`，副本 `assets/thinker-original.png`；二者SHA256均为 `45ca5d65a17e921e3bf0ee5353f4b5ed9a51c7eb061c7a1650020347bd314735`。本轮不重画面部、不上传素材。仅网页运行时分层和局部背景重建，不声称得到了原图真实深度。

作品标题为既有原型的SeedRealtime、Vibe Coding、AI产品榜与热门精选。没有生成原文、产品截图、成果数字或履历。中文采用本机等线优先的系统字体，不复制Windows字体文件，不依赖网络字体。

## 与参考站的关系

Vagus Skill用于约束古典角色与单一现代物件的反差、左侧阅读区、深绿章节个性、低干扰背景及原始素材/UI分离。本轮是免费技术管线试制，没有重新逐帧测量Shopify或Contra；本轮时长是用户确认的5+2规则，不标成参考站实测，不承诺与参考站画质完全相同。
