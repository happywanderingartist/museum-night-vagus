# R3 局部干净底图

制作方式：内置image_gen编辑，非CLI或付费3D API。编辑目标为assets/thinker-original.png。原始文件不覆盖；实际使用assets/thinker-clean-plate-r3.png，仅两个局部蒙版参与渲染，人物和其余场景继续使用原始纹理。输出初始被工具强制保存到C盘，已复制到D盘项目。

提示词原文：

```text
Use case: precise-object-edit. Asset type: clean background plate for a 2.5D website animation. Edit target is the supplied 1672x941 landscape painting. REMOVE ONLY the orange smartphone at pixel bounding box x716..834 y507..664 and the outstretched right hand/forearm over box x814..1090 y529..643. Fill behind the removed phone and hand with a seamless continuation of the dark museum corridor floor and room shadows, and reconstruct the open book's visible ivory page at the lower phone footprint. No new objects, hands, phones, blocks, triangles or copied windows/chairs. Keep the same exact framing, scale, perspective, warm subdued museum light, painterly material. All portrait face, hair, head, torso, robe, left thinking hand at chin, entire room outside the two removal regions, table and other books must remain unchanged. The old arm may terminate naturally behind the robe at x1090, but DO NOT move any body part. This is a technical clean plate, NOT a new composition. No text or UI. Output same wide 16:9 framing with pixel registration preserved.
```
