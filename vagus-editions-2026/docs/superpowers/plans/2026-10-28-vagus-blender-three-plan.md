# Vagus Blender＋Three.js Implementation Plan

> For agentic workers: 按本计划逐任务执行。后续执行选择原生模式时使用 superpowers:executing-plans；只有明确选择子代理执行时才使用 superpowers:subagent-driven-development。所有复选项目前均未执行。

**Goal:** 制作关于页的真实画框、绑定手臂和名片，在保留油画与可读内容的前提下获得可验证的实时三维。

**Architecture:** 先在独立3d-about-lab校准相机、造型、接触与材质，再接入site-v3。Blender输出GLB与后备海报；Three.js单渲染器绘可见场景，DOM负责内容；三维与二维后备互斥。

**Tech Stack:** 已有Blender 4.5.15 LTS、Three.js 0.186.1、Blender内置Python、原生ES模块、Node test、已连接Chrome。不引入React/R3F、收费服务或付费插件。

**Spec:** [制作设计](../specs/2026-10-28-vagus-blender-three-design.md)。该设计仍待用户确认；本文件不是实施许可。

## Global Constraints

- 所有路径相对 D:/AI-Data/博物馆奇妙夜/vagus-editions-2026，除非另有说明；全部新增产物在此D盘项目内。
- 先关于页，后思想者；网站展厅原顺序不变。当前site-v3、旧实验、原始母版与ZIP保留。
- 首次执行只到G0/G1。静态自然手型和相机未认可，不进入纹理与整站批量制作。
- 关于页动作周期9.6s：1.0s递出、0.9s停、1.4s回位、剩余静止；Blender以30fps烘焙。
- 思想者后续固定7s：5s滑动、2s停；手机背面朝观众，位置/旋转/尺度不变，不露屏。
- UI不进贴图；真实作品、声音、简历与联系信息不虚构。系统减少动态高于手动开关。
- 初始预算：≤6万三角形、≤35 draw calls、纹理未压缩估算含mipmap≤48MiB、首幕新增网络资源≤6MiB、DPR≤1.5。均为待测目标。
- 执行前检查Git现状；有可用历史则做小步提交，没有HEAD时不擅自初始化。任何情况下先备份并核对哈希，不能覆盖其他工作。

## Review Focus

1. 平面人物躯干与真实前臂接缝：袖口必须掩接，不允许双手/双卡残影。归任务2、4。
2. Blender约束和投影纹理导出后变样：按实际GLB回读，不以Blender预览通过代替。归任务3、4。
3. 全局画布与现有isolation/z-index冲突，以及二维与三维同时播放。归任务5、6。
4. 快速跳过、隐藏标签页、减少动态、加载失败、context lost：正文和poster始终可读。归任务5。
5. 手部局部接触成立但其他指节穿模：几何检查覆盖全手，并配正面/侧面关键帧。归任务3、7。

## 文件分工（以下均为未来执行目标）

~~~text
3d-about-lab/
  index.html / style.css / app.mjs         独立试点与DOM文字
  server.cjs / start.cmd                  仅本机只读服务，端口执行时核验
  package.json / package-lock.json        固定依赖与测试命令
  vendor/three/                          指定官方模块及LICENSE
  sources/about/about.blend              可编辑场景，不公开提供
  sources/about/layers/                  真alpha拆层与修补底图
  sources/about/reference.json           原画角点、权限、来源、尺寸
  sources/about/camera.json              标定相机和物件坐标
  assets/3d/about.glb                    网页模型
  assets/3d/about-poster.webp            同构图后备
  assets/3d/about-scene.json             类型与角色映射清单
  tools/blender/run-blender.cjs           参数化调用本机Blender，输出都在D盘
  tools/blender/build_about.py           场景制作与可重复导出
  tools/blender/validate_about.py        evaluated网格/关节与接触检查
  runtime/contracts.mjs                  清单/生命周期数据约定
  runtime/webgl-manager.mjs              单renderer、可见裁切、释放
  runtime/about-scene.mjs                模型与角色动作
  runtime/scene-clock.mjs                可暂停活动时钟，不使用滚动当动作时间
  runtime/quality.mjs                    实测采样与降级
  tests/*.test.mjs                       数据、GLB、生命周期、路由测试
  evidence/                             导出、截图、录制、性能、哈希
~~~

主站只在任务6审阅通过后涉及：site-v3/scene-motion.mjs、scene-motion.css、server.cjs、scripts/build-pages.cjs、index.html、about.html及新增webgl桥接文件。HTML通过生成器更新，不直接改生成文件后丢失。

## Task 1：基准、素材与相机锁定（G0）

**Files:** 创建独立试点的sources/about/reference.json、camera.json、evidence/baseline.json及源文件只读副本；先不启动正式站点替换。

**Interfaces:** reference记录sourcePath、sha256、width、height、objectPosition、anchors和中文安全区；anchors为实际标注的像素坐标。camera记录projection、位置/朝向、near/far、视场或正交范围、参考画布尺寸与已标注点的投影误差；均以一单位一米的场景标尺解释。

- [ ] 读取最新制作设计、当前母版清单和Chrome基准截图；哈希保存，不移动原件。
- [ ] 核实Blender版本、Three锁文件、许可与所需模块；用run-blender.cjs显式参数调用，避免Unicode路径的shell拼接问题。Blender用户配置/缓存若需新建，使用本项目D盘toolchain/cache下的任务目录，不迁移全机配置。
- [ ] 标注名片四角、框角、眼睛、腕/肘以及文字区。建立cover到实际艺术容器的映射，不用整窗尺寸替代容器。
- [ ] 建立reference.test.mjs：缺少角点、尺寸不符、源文件哈希漂移应失败；合法标注应通过。测试自己的映射与源数据，不复刻Three内部实现。
- [ ] 用名片尺寸确定比例；正交对照后测试固定透视，输出相机叠图。主要角点目标≤3px，眼部基准≤2px。
- [ ] 交付reference/camera清单及1440×900叠图，记录这是标定目标还是实际达到。执行后正常命令为 node --test tests/reference.test.mjs。

**完成条件:** 能从同一数据重新得到相同取景；无猜测坐标被当成测量值。

## Task 2：补背景、自然手型与真实灰模（G1）

**Files:** sources/about/layers/*、about.blend、tools/blender/build_about.py、evidence/gray/*。

**Interfaces:** 场景角色固定为Wall、CharacterPainting、FrameFront、FrameWall、ArmRig、BusinessCard和GripAnchor。reference中的role映射与导出清单一致，避免依赖导出器偶然生成的节点名。

- [ ] 制备去原手/原卡的干净背景，保留移动后露出的衣物和框内空间；人物脸部不重绘。输出透明拆层和同画布位置。
- [ ] 检查alpha取值范围、黑白底边缘、移动后背景覆盖范围；移除旧手后不出现残影。把截图与源图哈希写入asset-audit.json。
- [ ] 建立框体厚度、内壁、名片薄片和自然手/前臂；静止时先还原夹持姿态。手部不能使用未修整的几根圆柱作为最终造型。
- [ ] 袖口留真实遮挡：绘画袖口与三维手臂交界藏在褶皱内，底图中去掉重复手臂；框内壁与手臂在几何深度上可区分。
- [ ] 正面、诊断侧面和局部近景各交一张灰模；展示手/框/卡的完整关系，不只截取最好看的指尖。
- [ ] 提交静态造型和相机审阅。未认可则只修这一步，不烘纹理、不做其他幕。

**完成条件:** 自然静止手通过视觉审阅，框体和手臂没有可见穿插，相机与原构图对齐。

## Task 3：绑定、接触与导出动作（G2）

**Files:** about.blend、build_about.py、validate_about.py、assets/3d/about.glb、tests/about-asset.test.mjs。

**Interfaces:** GLB包含可映射角色与一个offer_card片段，时长9.6s；frame 1/31/58/100/289对应0/1.0/1.9/3.3/9.6s。GripAnchor隶属掌/腕驱动体系，BusinessCard与其保持固定相对变换。

- [ ] 先写GLB资产检查：缺模型/缺角色/缺动作失败；片段长度误差≤一帧，名片与GripAnchor相对变换恒定，起终姿态一致。
- [ ] 建前臂、腕、必要指骨与IK；拇指/食指保持夹持，其他指自然；动作是同一个腕部驱动，不另给名片独立追赶轨迹。
- [ ] 制作1.0s递出、0.9s停留、1.4s回位和剩余休息。沿身体前方递近2–3cm为试调初值，最终以造型和实际镜头校正。
- [ ] 以30fps烘焙约束与关键变换，导出GLB；逐帧检查Blender evaluated真实表面和回读后顶点，而不是只查骨骼锚点。
- [ ] validate_about.py检查全手/卡/框的候选面交叉与表面距离；夹持处误差目标≤0.5mm且无可见穿透。数值接触容差和有意相切分开记录。
- [ ] 输出五个关键时刻与诊断侧视：0、1.0、1.9、3.3、9.6s；首尾叠图无跳变，卡片角点不拉伸。
- [ ] 浏览器或离线Three加载器回读同一GLB，确保骨骼和节点关系未变化。运行 node --test tests/about-asset.test.mjs，保存检查输出与完整循环预演。

**完成条件:** 真实手臂、卡片、框在全周期正确，不用二维手替代承诺的绑定手；不能仅因GLB可加载而放行。

## Task 4：绘画贴图与浏览器一致性（G3）

**Files:** sources/about贴图与.blend、assets/3d模型/纹理/poster、evidence/materials/*、about-scene.json。

**Interfaces:** about-scene.json记录schemaVersion、kind、modelUrl、posterUrl、referenceAspect、cameraProfile、nodesByRole、clip、durationSec和质量级别。只引用真实存在的资产，缺项状态为未完成，不写verified:true。

- [ ] 建立UV与投影纹理后，把受骨骼影响的手臂颜色烘入UV；不能让相机投影实时停留在原位置，导致手移动时纹理滑动。
- [ ] 不重画脸，不改变原服饰；补手指侧面、卡边、框内壁等实际会露出的区域。面部绘画层避免再次打强光。
- [ ] 区分绘画原有阴影与新动态阴影；添加夹持、袖口和框内接触阴影，限制光泽，统一笔触尺寸。
- [ ] 正视对照Blender和Three结果，检查gamma、透明边、肤色、反光、骨骼拉纹理和贴图接缝。sRGB颜色贴图与数据贴图分别处理。
- [ ] 先未压缩版本通过，再按预算选KTX2/Meshopt；压缩前后同视角对照，必要的解码器与纹理一起计入资源预算。
- [ ] 从最终同机位输出poster.webp；检查三维首帧与海报替换没有人物跳位。无UI彩色对照、黑白底边缘和近景提交视觉审阅。

**完成条件:** 画风与原稿一致，动作不拉坏纹理，海报/模型切换不跳位；输出真实尺寸、字节数、哈希与来源。

## Task 5：独立网页、单渲染器与后备（G4）

**Files:** lab app/index/style/server、runtime/*、tests/runtime.test.mjs、tests/server.test.mjs。

**Interfaces:**

- mountWebGLManager({window, slots, registry}) → {refresh(), dispose()}；slots包含sceneId和艺术容器，registry定义场景工厂。
- createAboutScene({renderer, manifest, signal}) → Promise<{render({deltaSec, activeTimeSec, scrollProgress}), resize({width,height}), setActive(boolean), dispose()}>。
- 生命周期为poster → loading → ready → fallback/disposed；只有真实首帧成功后才进入ready。失败不能提前隐藏poster。
- 动作时钟只计活动时间；滚动进度只控制F2交接。register/create失败和过期异步结果都能安全释放。

- [ ] 先写实际控制器边界测试：首次加载失败、首帧失败、过期加载返回、context lost时poster仍在；减少动态/手动关闭/隐藏页立刻停止。
- [ ] 加入两场景同屏测试：同一renderer、各自scissor、互不清掉深度/颜色区域，离屏场景不继续动作或绘制。
- [ ] 实现单renderer和可见区域裁切；处理isolation/z-index及普通阅读区遮盖，画布pointer-events:none，点击/键盘给真实DOM。
- [ ] 做完整F0–F3：F0立即可读，F1自动行为与一次旁白，F2正常滚动，F3静态阅读。锚点直达或快滚跳过表演；图片、标题、入口不先被隐藏。
- [ ] 加载距视口约一屏的资产并限制相邻缓存，释放geometry/material/texture/ImageBitmap和Mixer缓存；共享资源引用计数不误删。
- [ ] 品质管理在真实活动段采样，DPR上限1.5；持续2s超预算后降DPR、关阴影、退静态。此策略测试不等于已达到60fps。
- [ ] server加入明确资产及MIME：.glb为model/gltf-binary，.ktx2为image/ktx2，.wasm为application/wasm；原始.blend、sources、任意路径必须404。
- [ ] 运行 node --test tests/*.test.mjs。Chrome实际测默认进入、开关、离屏/恢复、系统减少动态、快滚、直接哈希、资源404、context lost、无脚本与键盘阅读。
- [ ] 记录1440×900连续活动30s、切换10轮、冷加载及恢复：设备、浏览器、DPR、帧间隔分布、长任务和资源字节。完成表以实际数据填，未测写未测。

**完成条件:** 独立页面动作、阅读、降级同时成立；关键截图与录制可供用户判断，性能达标或清楚说明并保持后备。

## Task 6：经认可后接入当前网站（G5）

**Files:** site-v3/scene-motion.mjs、scene-motion.css、server.cjs、scripts/build-pages.cjs；新增webgl桥接及指定资产。生成index/about，不修改无关页面。

**Interfaces:** scene-motion记录该幕owner为poster/2d/webgl。WebGL ready后才停止对应actor与二维cameraFrame；fallback立即交回静态poster，不让两个手同时存在。手动开关和媒体查询仍以现有入口为准。

- [ ] 执行前备份当前site-v3相关文件、资产、源图哈希。确定精确文件白名单；旧实验和ZIP不动。
- [ ] 先增加集成回归：未启用About时其他八幕行为不变；启用后About只有一个画面负责人，图片/文字始终有后备。
- [ ] 首页About幕与about.html复用同一合格场景，只改变容器/裁切；同步生成器、import map/本地模块路径与服务器白名单。
- [ ] 运行现有34项及新增三维测试、HTML审查、实际HTTP字节哈希检查；再用Chrome核对标题/名片/导航遮挡和真实点击。
- [ ] 标记技术验收与视觉认可分别通过的范围。若要打包，新命名版本ZIP，不覆盖2026-10-26静态包，解压后复测且保留许可证。

**完成条件:** 只更新已认可的一幕，关闭新特性可恢复当前海报与阅读，其他页面不回退。

## Task 7：思想者单独试点（关于页通过后才排期）

**Files:** 另建thinker源场景/资产/专门测试；复用经验证的runtime，不直接启用旧灰模。

**Interfaces:** 动作总长7s，phoneRoot在所有采样点的世界变换恒定；screenContactPlane朝人物，访客只见背面。滑动与回程/离面阶段分别标记，几何验证检查全手。

- [ ] 先标定当前手机、古书与手；给出正视叠图和不露屏的诊断侧视。未经认可不制作长动画。
- [ ] 先写资产测试：0–5s滑动、5–7s思考；手机世界矩阵恒定，循环首尾一致。触点属于屏幕面，滑动阶段离面误差≤0.5mm。
- [ ] 制作真实手部，回程先离面，其他指节不穿模；手机前表面的触点可自然被背壳边缘遮住。
- [ ] 检查5+2整个周期与回位，正面不露屏；保留左侧三条纯文字入口和查看全部作品，标题不拆成两行。
- [ ] 重做接触、材质、性能与真实Chrome验收，不能因为About已通过而免验。

**完成条件:** 用户要求的固定手机和5+2动作在网页上同时成立，不把前一轮被否定模型当现成成品。

## 本次计划的自查

覆盖了制作设计中的原稿保留、真实手臂、夹持、材质、F0–F3、免费工具、DOM/UI分离、失败回退、性能与思想者特殊限制。接口统一以activeTimeSec/scrollProgress区分时钟；清单角色映射与GLB实际输出核对。无需本轮新增代码测试，因为本轮未写产品代码；上述命令均为未来执行步骤，不是已运行结果。

执行建议由当前会话按工作包推进，优先G0/G1；批准静止构图后再进入接触和材质。若改为多人并行，只可拆不共享.blend/纹理的任务，不能让多个执行者同时修改同一个场景。
