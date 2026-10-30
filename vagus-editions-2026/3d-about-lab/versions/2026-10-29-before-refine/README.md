# 关于页｜G0/G1 静态灰模试稿

更新：2026-10-29。只制作原画坐标标定、可编辑静态灰模与正面/侧面对照。没有动画、正式油画材质、GLB或Three.js网页接入；site-v3没有替换。

## 查看

- evidence/gray/front.png：固定机位的完整构图。
- evidence/gray/hand-close.png：手、名片与袖口的三维近景。
- evidence/gray/side.png：隔离手/卡/袖口的诊断侧视。
- evidence/gray/side-context.png：保留画框与人物参考层的诊断侧视。
- evidence/gray/overlay.png：原图与灰模混合叠图；含原手残影，只校准，不是最终背景。
- sources/about/about-gray.blend：Blender可编辑源文件，参考图片已打包。
- sources/about/reference.json、camera.json：锚点、标定镜头与深度假设。

框、名片、手和前臂是真实网格；面部与身体仍是明确命名的平面灰度原画，并非全人物三维。袖口目前是灰模接缝遮盖，尚未复原原画的衣褶。背景去手、真正透明拆层、油画纹理和完整袖口材质均未完成。

## 原画标定

名片角点由tools/extract-card.cjs从原图指定白色区域提取，实际得到13133个候选像素，保存完整凸包与四角。拟合90×54×0.4mm的真实矩形，四角拟合残差约0.50–0.61个源图像素。眼睛、腕、肘和框的手工标记只是近似观察，不能据名片残差声称整个人物已精确标定。场景深度来自所选物理卡片大小，是制作假设。

## 手部来源与修改

首轮程序生成手型已被审阅否定，留在evidence/gray/iteration-01和iteration-02及旧脚本供追溯。当前仅手/前臂采用[Blender官方Human Base Meshes v1.4.1](https://www.blender.org/download/demo-files/)中的Hand - Realistic，作者Dan Ulrich，CC0-1.0；下载来源、大小、哈希和许可链接见sources/vendor/SOURCES.json。没有替换原画人物的脸或身体，也没有付费生成、上传图片或安装陌生插件。

现网格为基础解剖拓扑的静态修改：手掌整体摆位、有限屈指与朝向调整，再做局部指腹接触面修整。静态修整不等于已完成骨骼权重或真实软组织模拟；后续绑定时还须检查拇指根部和指节变形。不能继续称为纯原创几何。

## 检查如何解读

model-audit.json记录真实网格连通性、封闭性与名片投影。static-contact.json从保存的.blend求值，检查手/卡、手/框、卡/框三角面相交，并分别只查询Skin_index、Skin_thumb表面，记录接触位置、法线和所属表面。距离是在0.5mm卡面网格上采样的上界，不是夹持压力模拟；通过也只适用于当前静止姿态，不保证后续动作或全部自碰撞。

build-manifest.json将构建脚本、原图、模型、各视图和模型报告绑定到同一批哈希，检查报告另带源.blend哈希，避免把旧检查套在新模型上。preservation.json只核对基线指定的7个原站文件，不代表全仓库审计。

视觉仍待判断：灰模不代表成品肤色和笔触，手型自然度必须单独看正面与侧面。即使技术测试通过，也未将G1标记为用户验收。

## 复现

在本目录执行以下命令，调用项目已有Blender 4.5.15 LTS，任务缓存与产物均在D盘。

~~~text
node tools/extract-card.cjs
node tools/blender/run-blender.cjs
node tools/blender/run-blender.cjs --check
node --test tests/*.test.mjs
~~~

## 下一步关口

先解决静止手型、夹持与原画角度，再补干净背景和拆层。G1经视觉确认后才进入G2骨骼和递卡动作；随后才是油画材质、GLB回读和独立Three.js预览。当前不扩展其余八幕。
