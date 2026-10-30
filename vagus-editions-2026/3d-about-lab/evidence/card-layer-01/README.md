# 名片分层静态试验｜2026-10-30

`front-source-preserved.png` 是原画与 Blender 实体名片的静态合成。仅在原画名片的浅色纸面覆盖 3D 卡片，前景手指保留原画像素；原图没有修改。`card-front-rgba.png` 和 `card-side-rgba.png` 是隔离的实体名片诊断渲染，黑色预览区域实际为透明。`card-texture-clean.png` 只给名片使用，依据原画露出的白纸像素拟合温和色差；不作为完整背景图。可编辑试验源文件为 `sources/about/about-card-layer.blend`；其中的人物、灰手及框已隐藏，仅名片参与渲染。

这份试验解决了上一混合稿把手部纹理印在名片上、遮挡出洞的问题，并保留了物理名片的侧视厚度。它**没有**完成 3D 手、衣袖、人物或完整网页。原画里仍有原始名片；卡片一旦移动，会露出它。需要先完成干净底图、手部前景遮罩和可接受的手部静态造型，才能做递卡动画。`site-v3` 未接入这份试验。

复现顺序：运行 `tools/prepare_card_texture.py`，Blender 执行 `tools/blender/render_source_card.py`，运行 `tools/compose_source_card.py`，再运行 `tools/verify_card_layer.py`。脚本均以 `3d-about-lab` 目录为参数，使用 D 盘现有 Blender 和绑定 Python。
