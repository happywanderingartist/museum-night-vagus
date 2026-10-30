# 来源与制作边界

R3实现前重新经agent-reach的GitHub/gh入口查找Three.js，CLI仍未登录，改读公开官方仓库、Mesh实现、Raycaster说明与近期发布记录。观察公开仓库约117k星、mrdoob及贡献者维护、MIT许可，星标仅供背景。优势：真实网格射线与矩阵可检查先接触哪一面；明确局限：单个点在屏幕范围内不代表整段指腹无穿模，仍要检查面方向、手部几何并放大看实际画面。沿用现有0.186.1，无新框架或下载模型。参考[Raycaster官方说明](https://github.com/mrdoob/three.js/blob/dev/docs/pages/Raycaster.html.md)、[Mesh实现](https://github.com/mrdoob/three.js/blob/dev/src/objects/Mesh.js)；没有运行上游整套测试。新局部补图由内置图像编辑制作，来源与准确提示词见R3-ASSET-NOTES.md，未覆盖原画或人物。以下未用生成服务的表述只针对R3前批次。

## 本批实现前审阅

GitHub搜索入口尝试了gh（未登录），随后读取公开官方仓库。参考[Motion官方仓库](https://github.com/motiondivision/motion)的状态、进入/退出及纯逻辑与浏览器测试分离方式；[仓库测试说明](https://github.com/motiondivision/motion/blob/main/AGENTS.md)与本地测试组织相互核对。维护者为Motion项目贡献者，仓库MIT许可；本批未引入其代码或包，未声称运行上游测试或刷新星标统计。可复用优势是成熟的状态/生命周期设计和测试层次；局限是它不提供人物资产、真实作品内容或跨浏览器视觉保证，公开问题也显示滚动兼容性需要实际检查。本站保持原生滚动，没有为了两个章节增加动画框架。

现有Three.js来自[mrdoob/three.js](https://github.com/mrdoob/three.js)，本地vendor固定three@0.186.1，MIT许可证见vendor/three/LICENSE。复用glTF加载、矩阵坐标与WebGL渲染。局限是模型加载或矩阵接触正确不等于人物自然、画面成熟；本批未运行上游完整套件。Blender只是前批本机资产制作工具，不打包程序，不需要用户启动它才能播放。

## 资产

home.webp、ai.webp、start.webp、hug.webp来自本项目已确认试稿，复用prototype-v1中的网页副本。assets/manifest.json保留原画来源与SHA256，但其中source是来源说明，不是便携包依赖路径。新增thinker-original.png逐字节复用原思想者母版，gesture.glb复用本机制作的模型；未上传、重画或下载参考站图像。手机固定由运行时hand-contact.mjs约束；GLB保留历史动画通道，不代表网页播放手机转向。

字体使用本机系统字体与Times New Roman等回退；没有复制商业字体文件。原画源哈希已保留，网页副本见asset-integrity.json。不是Shopify/Contra官方资产或官方模板，没有本轮新的参考站逐帧测量或其效果等价承诺。

## 本地浏览器验证

使用已安装Google Chrome，在D盘新建隔离测试资料目录，只请求localhost，未读取用户登录信息。自动化方式依据[Google官方Headless说明](https://developer.chrome.com/docs/automation-and-testing/headless)。初次命令行虚拟时间截图出现AI空白，随后使用真实浏览器等待模型完成渲染，AI直达与场景就绪检查成功；初次空白截图未作为成功证据。当前证据来自实际页面截图，页面本身不依赖测试工具。
