# 局部取证记录

参考页面https://aestudio.studio/goshuin/en ，Awwwards条目https://www.awwwards.com/sites/goshuin-every-stamp-a-memory 。2026-11-12用website-rebuild/scripts/fingerprint.mjs两次GET页面，间隔1200ms，均200、无重定向、字节一致。未见Next、Nuxt、ReactRouter或Vue数据水合标记。阅读器bundle中未见网络API请求，局部行为可从公开JS解析。

原始记录位于../../evidence/element-rebuild-2026-11-12/source-probe。页面SHA256为739aca37a5b129ac3f626e5352cf22dcc4f8b060d031ef045d712eb95ae48d9f。book-reader-d796e39c0771.js为d796e39c0771e3096db2d1538270eeb0a89fae2ba66f228e337c85ed8b0abf61。book-reader-066f1703ed2f.css为066f1703ed2f74e5a4f64b754ec878d9200083ff522496b15f74054bb3f5fe80。

## 可追溯参数

公开JS的75—88行构建三个连续嵌套面板，每幅截取同一旧页的三分之一。90—118行定义1280ms运动，三面绝对角度交替，子铰链使用相对角度。opening为smoothstep(.12,.62)，departure为smoothstep(.52,1)，角度52×opening＋26×departure，lift为22×smoothstep(0,.16)＋12×opening－26×departure。shift为(width－width×cos(angle))×.22，加上前翻−.58或后翻1.12倍width×departure。旧层从.82到1淡出，新页从.48到.76显现，见142—144行。

149—162行先停止旧动画，立即接受目标页序，再处理动画。153行检查减少动态效果与暂停选项。164—179行涵盖前后翻、键盘、触屏和减少动态效果变更。CSS第6行透视2200px，第12—14行箭头过渡200ms、左右3px，第351—352行减少动态效果处理。

## 本次转译

三折参数、1280ms对照档、透视和箭头距离来自上述公开资源。480ms默认档、文案切换、花园反馈、原创票面和配色组合为Vagus适配。阴影使用简化渐变，版面与源站有意不同。本样稿验收局部行为与现有风格一致性，完整源站还原度未评定。

Vagus基线为site-v4/style.css，纸色#edf0e5、墨色#172b24，中文衬线标题STZhongsong／Noto Serif SC，正文DengXian／Microsoft YaHei，曲线cubic-bezier(.23,1,.32,1)。章节案例沿用START#742d4b与HUG#52744d。当前实现为独立试稿，正式接入需沿既有scene-motion生命周期。

源站未在本轮确认代码再分发许可。原始资源作为本地取证保存，样稿采用自己的内容和实现，默认私有、noindex、本机预览。此为交付设置。
