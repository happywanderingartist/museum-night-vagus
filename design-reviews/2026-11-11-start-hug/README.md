# START / HUG 案例图文评审工件

本批内容日期为 2026-11-11，2026-11-12 完成导出、导航验收与私有保存。状态为可审阅设计稿。

## 打开与内容

本机完整预览在 http://127.0.0.1:4184/public/product-cases-2026-11-11/index.html 。当前球面入口在 http://127.0.0.1:4196/reference/eye-reflection/index.html 。两服务均限本机访问。

files/vagus-editions-2026/site-v4/public/product-cases-2026-11-11 包含七个HTML、CSS、源素材、两张最终介绍JPG、页面编排截图、资料截图、素材清单和验收记录。HTML文字和布局可继续编辑。研究与方案说明分别在 files/vagus-editions-2026/research 和 docs/superpowers/specs。content-package 保存本轮已审阅文字输入。

## 工程整合状态

本工件基于私有仓库 main 的 e8317dea8168208fc69d5cd347cccb0f17906ea0 保存。当前球面工程仍在本机工作区保存。本地存在此前独立的空间与球面探索，本批采用附加目录保存，主站合并范围继续按对应工程基线核对。云端没有运行或部署本预览。

files 保留五个本轮接入文件的完整 after 版本，原文件在 docs/superpowers/specs/2026-11-11-product-cases-before，before/after指纹在 content-integration.json。应用到已有项目之前，逐一比较目标文件与 beforeSha256。完全匹配时可复制 after 文件，已经匹配 afterSha256 时可跳过。其他情况按差异合并本批字段、精确白名单和JPG类型支持。完整 reflection.mjs 的整合还需要其当前球面工程文件，单个 after 文件的保存状态仅表示该文件已保全。

本批工件没有加入原仓库其余未保存文件。原本机分支和索引保持各自状态。authoring 中脚本保留原本机路径以说明制作过程，可按实际环境调整路径后运行。

## 验证与待评审

verification.json 记录 326 项页面、链接、锚点、图片、指纹及语法检查，37个不同HTTP地址。Chrome 实际点击了正常目录与球面目录到两款案例、竞品分析和返回的路径。静态浏览实际显示七个平面入口。系统级减少动态、其他浏览器、触屏和持续帧率没有在本批测量。

两张介绍图、连续案例版式与正式替换旧页面的时机等待用户视觉评审。现有返回链接回到原 index 章节，球面原朝向恢复属于后续整合决定。介绍图内的原始截图保留少量翻译控件，外层导出页浮层已清理。浏览器工具使用允许的C盘可视化目录暂存截图，再复制到D盘并核对SHA256，正式交付在D盘。
