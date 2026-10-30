# 来源与许可 · 2026-10-26

Three.js 0.186.1沿用项目已固定的官方模块和MIT许可证；没有改写vendor源码，只保留上轮用于Node自引用解析的package.json。官方：https://github.com/mrdoob/three.js ，提交：https://github.com/mrdoob/three.js/commits/dev/ ，实际用法：GLTFLoader与AnimationMixer导入真实蒙皮GLB。GitHub CLI未认证，转公开GitHub网页研究；网页约117k星不作质量证明，提交页可见r186及9月维护记录，不声称核实当日最新commit或运行上游全套测试。

Blender4.5.15本机既有官方程序，用于本地生成与导出，不打包软件本体。手、骨骼、书、手机、布褶袖口与建模脚本由本项目制作，尚非完成雕刻；无云端模型生成或收费调用。

参考DLR-RM/BlenderProc的相机投影、深度/碰撞分开验证方法，GPL3，约3.8k星；不安装、不复制其代码。来源：https://github.com/DLR-RM/BlenderProc 。本轮镜头拟合是独立NumPy最小二乘实现，无SciPy安装。

原画与R3局部干净底来自项目现有site-v2/assets，复制到新目录，原文件不覆盖。网页里原画原像素与补图局部遮罩分开，UI独立于图片；用户既有素材的外部发布权利未新增核实，本轮不公开上传。

后续造型路线研究到MakeHuman官方资产许可证将内置basemesh列为CC0（https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md）；本批未下载、安装或使用MakeHuman模型，不把许可调研当已替换手部。其程序源码与素材许可不同。
