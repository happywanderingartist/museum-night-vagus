const fs=require('node:fs'); const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site-v4/index.html'),'utf8');
const homeStart=source.indexOf('<section class="home"');
const aiStart=source.indexOf('<section class="ai chapter"');
const readingStart=source.indexOf('<div class="reading paper" id="ai-reading"');
const nextStart=source.indexOf('<section class="start chapter"');
if([homeStart,aiStart,readingStart,nextStart].some(n=>n<0)) throw Error('Original section boundaries changed');
const rewrite=html=>html.replace(/(src|href)="(?!#|https?:|\/)([^"]+)"/g,(_,a,v)=>`${a}="/site-v4/${v}"`)
 .replace(/href="#(?!home"|ai")(.*?)"/g,(_,v)=>`href="/site-v4/index.html#${v}"`);
const home=rewrite(source.slice(homeStart,aiStart));
const ai=rewrite(source.slice(aiStart,readingStart))+'</section>';
const reading='<section class="ai">'+rewrite(source.slice(readingStart,nextStart));
let header=source.slice(source.indexOf('<header '),source.indexOf('</header>')+9);
header=rewrite(header);
const page=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vagus · 向内游览 v5 空间试制</title><link rel="icon" href="/site-v4/assets/mark.svg"><link rel="preload" href="/site-v4/assets/home.webp" as="image"><link rel="stylesheet" href="/site-v4/style.css"><link rel="stylesheet" href="/site-v4/chapter-pages.css"><link rel="stylesheet" href="/site-v4/completion.css"><link rel="stylesheet" href="preview.css"></head>
<body><a class="skip-link" href="#ai">直接阅读 AI</a>${header}<main><div id="journey"><div id="stage" tabindex="-1"><canvas id="world" aria-hidden="true"></canvas>${home}${ai}</div></div>${reading}</main>
<aside id="review-tools" aria-label="独立试制控制"><span id="study-label">连续衔接 · 试制</span><details><summary>查看过程</summary><div class="study-panel"><label for="keyframe">定位关键帧</label><select id="keyframe"><option value="0">K0 首页</option><option value=".22">K1 画面接力</option><option value=".5">K2 掠过门槛</option><option value=".8">K3 到达 AI</option><option value="1">K4 稳定阅读</option></select><output id="progress" aria-live="off">0%</output><button id="replay" type="button">回到开场</button><a href="#ai">直接阅读 AI</a><p>上下滚动查看画面接力与近景厚边；两幅原画保持整幅，门槛材质仍是试制。</p></div></details><button id="motion-toggle" type="button" aria-pressed="false">关闭动态</button><a href="/site-v4/index.html">原页面 ↗</a></aside>
<script type="module" src="preview.mjs"></script></body></html>`;
fs.writeFileSync(path.join(__dirname,'index.html'),page); console.log('Built preview using unchanged original HTML sections.');
