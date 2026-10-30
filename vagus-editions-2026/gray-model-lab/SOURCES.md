# 来源、许可与制作边界

执行依据：已确认designs/2026-10-25-vagus-3d-design-proposal.md，用户随后明确“按计划进行”；本批执行第一阶段灰模。素材不是Shopify模型或画作，不复制参考站角色、页面或品牌；目标是研究三维体积、接触、光照和阅读交接的制作方法。

## 开源研究（实现之前）

经agent-reach的GitHub/gh入口搜索BlenderProc，CLI未登录，改读公开官方仓库和文档。核查[Three.js](https://github.com/mrdoob/three.js)（mrdoob及贡献者、MIT，观察约117k星）与[BlenderProc](https://github.com/DLR-RM/BlenderProc)（DLR-RM、GPL3，约3.8k星）；星标只作背景，不当质量证明。Three官方有SkinnedMesh/GLTFLoader和测试组织；BlenderProc有模型、相机、灯光及碰撞的分开组织和测试/示例入口。本轮未运行它们的上游测试；个别在线IK/测试页面未成功抓取，不报已核验内容。

可复用优势：Three成熟的真实骨骼蒙皮、AnimationMixer、GLB加载及资源生命周期；BlenderProc展示将场景资产、相机与验证拆开的流程。明确局限：都不会自动产出解剖与美术合格的手，单个接触锚点或模型加载成功也不能说明整手无穿模。因此沿用现有Three0.186.1官方模块，不安装BlenderProc、不复制其GPL源码，不加一套训练数据生成管线。手与书、骨骼及轨迹是本项目原创程序化制作。

## 实际工具与许可

Three来自已有free-motion-lab/vendor/three，必要官方模块及vendor/three/LICENSE保留；新增该vendor下package.json仅用于Node测试的包自引用解析，标明本地0.186.1，不修改第三方模块代码。Node资产测试使用同一份模块与GLTFLoader，便携解压也可运行，不依赖原项目node_modules。

Blender4.5.15 LTS使用本项目已校验的官方本地免安装程序，build hash 5afeabba6097。程序本体不打包；本批没有新下载模型、插件、字体或依赖，没有云端生成、素材上传或付费调用。原始手部和书页由scripts/build-gray.py产生；assets/model-audit.json记录实际导出状态，未将几何代理称为最终雕刻。

assets/reference.webp逐字节复制当前项目已确认AI原画的网页副本，只作对照，不参与新手网格生成。原画母版与现有site-v2未修改，保留核验记录。字体使用系统等线、华文中宋和Times New Roman回退，不复制字体文件。

方案研究参考：[Shopify制作方技术拆解镜像](https://threadreaderapp.com/scrolly/2001335712982147307)。这是制作方自述，不是本站源码、性能或画质证明。本批没有重新测量参考站完整动画，也不宣称灰模已复刻其效果。
