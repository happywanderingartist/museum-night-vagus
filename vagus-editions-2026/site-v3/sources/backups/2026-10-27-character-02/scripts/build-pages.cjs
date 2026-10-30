const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const entries=[
 {id:'ai',title:'AI 行业观察',category:'观察与写作',description:'产品测评、创意玩法与行业观察',url:'ai.html',image:'ai'},
 {id:'start',title:'START',category:'数字产品',description:'复刻偶像足迹的追星旅行产品',url:'start.html',image:'start'},
 {id:'hug',title:'Hug',category:'数字产品',description:'温和、无惩罚的自我照顾',url:'hug.html',image:'hug'},
 {id:'xiaohongshu',title:'小红书运营',category:'内容创作',description:'账号定位、选题、封面与传播',url:'xiaohongshu.html',image:'xiaohongshu'},
 {id:'podcast',title:'播客',category:'内容创作',description:'节目策划、声音表达与制作',url:'podcast.html',image:'podcast'},
 {id:'literature',title:'文学节',category:'活动策划',description:'从策划方案到真实活动现场',url:'literature.html',image:'literature'},
 {id:'visual',title:'视觉与物料',category:'视觉设计',description:'海报、编辑设计与应用物料',url:'visual.html',image:'visual'}
];
fs.writeFileSync(path.join(root,'assets/catalog.json'),JSON.stringify(entries,null,2));
const chapters={
 xiaohongshu:{title:'小红书运营',category:'内容运营',headline:'内容，也有比例。',subtitle:'从账号定位，到一篇被看见的内容。',quote:'这张封面，改了第几版？',alt:'白色工作室中的原创比例人物，手持信号红封面板，圆与方框作为构图结构。',opening:'从比例，到传播。',intro:'把圆与方的秩序，交给内容。',description:'账号定位、内容策略、选题与制作，最终回到一篇真实笔记。这个章节关注内容如何被组织、制作和看见。',sections:[
  {id:'positioning',label:'账号定位',title:'先确定和谁说话。',text:'围绕目标读者、内容主题和表达方式组织案例。定位如何影响选题、封面和发布节奏，需要用实际账号与内容材料说明。',items:[['目标读者','让账号内容面向清楚的人，而不是所有人。'],['内容边界','把主题范围、语气和视觉规则放在一起。']]},
  {id:'content',label:'内容策略',title:'让选题与封面一起工作。',text:'按“选题切口—内容结构—封面表达—发布与反馈”的顺序呈现制作过程。代表笔记接入后，读者可以从成品返回对应决策。',items:[['选题与结构','从一个明确问题进入，保留能支持判断的信息。'],['封面与正文','视觉承诺应与正文内容一致，不靠堆砌装饰替代信息。']]},
  {id:'evidence',label:'代表作品',title:'效果，留给真实记录。',text:'真实笔记、公开链接、本人职责与允许公开的数据尚未提供。本页不以生成的封面或虚构增长指标代替运营证据。',status:'待接入：账号链接、代表笔记、制作过程与可公开指标。'}
 ]},
 podcast:{title:'播客',category:'声音与策划',headline:'把声音，<br>留给认真听的人。',subtitle:'从一个问题，到一段值得听完的表达。',quote:'嘘，有人在说话。',alt:'深茄紫背景里，戴蓝色头巾和珍珠耳环的古典少女自然佩戴银灰色现代耳机。',opening:'让声音，有自己的空间。',intro:'先让内容被听见。',description:'这里呈现节目的主题、策划过程、本人制作角色与代表单集。播放器只消费真实音频，默认不自动播放。',sections:[
  {id:'concept',label:'节目定位',title:'一次对话，从什么开始？',text:'先说明节目的议题、听众与表达方式，再进入具体单集。标题、简介与文字说明应帮助访客决定是否收听。'},
  {id:'production',label:'制作过程',title:'从提纲，到最后一次剪辑。',text:'策划、资料准备、录制、剪辑和发布是本页的阅读顺序；本人承担的工作与具体过程材料接入后，会在对应环节明确说明。',items:[['策划与准备','主题、问题、提纲及资料。'],['录制与编辑','真实音频、剪辑选择及制作角色。'],['单集与文字','节目简介、代表单集与文字稿或摘要。']]},
  {id:'episodes',label:'代表单集',title:'等一段真实的声音。',text:'节目名称、音频文件、封面、时长及文字稿尚未接入。不会使用假波形、伪造的单集或模拟时长冒充节目。',status:'音频待提供。接入后可播放、暂停、拖动进度与调整音量。'}
 ]},
 literature:{title:'文学节',category:'活动策划与执行',headline:'把文字，<br>带到现场。',subtitle:'从一份方案，到灯光亮起的那一刻。',quote:'灯光就位，作家呢？',alt:'钴蓝夜色与橘红舞台光中，梵高式红发人物正用现代工作人员对讲机调度。',opening:'当文字走出书页。',intro:'让一场活动，有清楚的来路。',description:'按活动背景、目标、方案、物料与现场执行展开阅读。艺术人物负责开场，真实现场和本人工作负责说明项目。',sections:[
  {id:'brief',label:'活动背景',title:'为什么要办这一场？',text:'活动名称、时间、目标受众与实际问题需要来自真实项目材料。本页按“目标—方案—执行—反馈”的顺序组织阅读。'},
  {id:'planning',label:'策划与物料',title:'把想法，写成可以执行的方案。',text:'内容议程、参与者体验、宣传与物料应共同服务活动目标。接入实际方案后，展示关键取舍及本人负责的具体部分。',items:[['方案','目标、议程、分工与现场动线。'],['传播','宣传内容、视觉物料与使用场景。'],['执行','流程、协作、现场记录与复盘。']]},
  {id:'evidence',label:'现场与成果',title:'让真实现场，接过画面。',text:'活动方案、宣传物料、现场照片、本人职责与复盘材料尚待接入。上方的艺术画面是展厅视觉，不是活动照片。',status:'待接入：真实活动名称、方案、现场记录及本人工作。'}
 ]},
 visual:{title:'视觉与物料设计',category:'视觉创作',headline:'把想象，交到手上。',subtitle:'海报、编辑设计与应用物料。',quote:'灵感已发送。',alt:'从画面两侧伸出的古典绘画双手，其中一方自然握着现代绘图笔，中央留出清楚的空隙。',opening:'灵感之后，是作品。',intro:'让作品，保留自己的颜色。',description:'真实作品按原始比例和色彩呈现。先看完整作品，再看局部、设计决策与应用情境，不把所有创作统一做旧或染色。',sections:[
  {id:'approach',label:'作品阅读',title:'完整、局部、使用情境。',text:'每件作品需要清楚的用途、创作背景、本人工作与过程说明。高清原件接入后，可放大查看，并用键盘切换与关闭。',items:[['完整作品','原始比例与色彩。'],['设计选择','排版、构图与材料的判断。'],['使用情境','作品如何进入真实应用。']]},
  {id:'personal-work',label:'个人作品',title:'留给真实作品的画廊。',text:'个人海报、编辑设计和物料高清文件尚未提供。下面单独列出的是本网站的 AI 辅助艺术试稿，用于查看画廊交互，不计作个人真实项目成果。',status:'个人作品高清文件与用途说明待接入。'}
 ]},
 about:{title:'About Vagus',category:'关于作者',headline:'展览之后，<br>认识 Vagus。',subtitle:'让好奇心成为方法，让想象力成为作品。',quote:'看完展了，来认识一下作者？',alt:'明亮的原创超现实画面，一张大纸缓缓卷起，匿名背影走向工作台；这不是作者真实肖像。',opening:'回到真正的创作者。',intro:'Hello，我是 Vagus。',description:'欢迎来到我的网站。这里记录了我在艺术、设计与 AI 之间的游走与探索。用观察提出问题，用创作回应问题，让想象最终成为可以被看见和使用的作品。',sections:[
  {id:'interests',label:'关注的方向',title:'在观察与创作之间。',text:'这个作品集围绕 AI 行业观察、数字产品、内容运营、声音、活动策划与视觉创作展开。各类项目通过具体作品与过程材料说明，而不是只列工具名称。'},
  {id:'background',label:'个人背景',title:'经历，要由真实材料来写。',text:'教育、工作经历与具体职责尚未提供；本页不预填学校、公司、任职时间或成绩。作品索引已经可以直接阅读。'},
  {id:'resume',label:'简历',title:'一份可以直接阅读的介绍。',text:'正式简历文件尚未接入。后续接入后，这里的入口会直接打开文件；现在可以先从完整作品目录了解各个方向。',status:'简历文件待提供。'},
  {id:'contact',label:'联系',title:'让下一次对话，从这里开始。',text:'公开邮箱与合作联系方式尚待本人确认。当前不填写虚构地址，也不会自动发送任何消息。'}
 ]}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function head(title,theme=''){return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${theme||'#edf0e5'}"><title>${title} · Vagus</title><link rel="icon" href="assets/mark.svg"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="chapter-pages.css"><link rel="stylesheet" href="completion.css"><script type="module" src="chapter-motion.mjs"></script><script type="module" src="site-features.mjs"></script></head>`;}
function header(id,next){return `<a class="skip-link" href="#project-intro">直接阅读内容</a><header class="case-nav"><a class="case-brand" href="index.html">Vagus</a><a href="index.html#${id}">返回展厅</a><a href="works.html">速览作品</a>${next?`<a href="${next.url}">下一页：${next.title}</a>`:''}<button data-motion-toggle type="button" hidden aria-pressed="false">关闭动态</button></header>`;}
function footer(){return `<footer><a href="index.html">Vagus</a><a href="works.html">作品速览</a><a href="about.html#resume" data-resume-link>看看简历</a><a href="#top">回到页首</a></footer>`;}
function player(){return `<div class="audio-portal"><div class="audio-empty" data-audio-empty><span class="quiet-play" aria-hidden="true">▷</span><div><strong>音频待接入</strong><p>真实音频接入后，可在这里直接收听。</p></div></div><audio controls preload="none" hidden data-audio-player aria-label="播客播放器"></audio><p class="audio-message" data-audio-message role="status">由你选择何时开始，不自动播放。</p></div>`;}
function art(id,c,tag='h1',home=false){const titleId=home?id+'-title':'project-title';return `<section class="collection-art theme-${id}" id="${home?id:'top'}" ${home?'data-section':''} data-chapter="${id}" aria-labelledby="${titleId}" tabindex="-1"><img class="collection-image" src="assets/${id}.webp" width="1672" height="941" alt="${c.alt}" ${home?'loading="lazy" decoding="async"':'fetchpriority="high"'}><div class="art-copy"><p class="art-category">${c.category}</p><${tag} id="${titleId}">${c.headline}</${tag}><p class="art-subtitle">${c.subtitle}</p>${id==='podcast'&&!home?player():''}<a class="art-read" href="${home?id+'.html':'#project-intro'}">${home?'进入'+c.title:'阅读'+c.title}<span aria-hidden="true">↓</span></a></div><p class="art-quip">“${c.quote}”</p>${id==='xiaohongshu'?`<nav class="geometry-entries" aria-label="${home?'运营展厅':'运营内容'}"><a href="${home?'xiaohongshu.html':''}#positioning">账号定位</a><a href="${home?'xiaohongshu.html':''}#content">选题与制作</a><a href="${home?'xiaohongshu.html':''}#evidence">代表笔记</a></nav>`:''}${id==='about'?'<p class="art-disclosure">原创艺术意象，非作者真实肖像</p>':''}</section>`;}
function section(s){return `<section id="${s.id}" tabindex="-1"><p class="case-section-label">${s.label}</p><h2 ${s.id==='personal-work'?'data-personal-heading':''}>${s.title}</h2><p ${s.id==='personal-work'?'data-personal-description':s.id==='resume'?'data-resume-description':s.id==='contact'?'data-contact-description':s.id==='episodes'?'data-audio-description':''}>${s.text}</p>${s.items?`<dl class="process-pairs">${s.items.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`:''}${s.status?`<p class="material-note" ${s.id==='personal-work'?'data-personal-pending':s.id==='resume'?'data-resume-pending':s.id==='episodes'?'data-audio-pending':''}>${s.status}</p>`:''}${s.id==='personal-work'?'<div class="gallery-grid" data-personal-gallery></div>':''}${s.id==='resume'?'<a class="inline-link" href="works.html">先看作品目录</a><a class="inline-link" data-resume-download hidden>打开简历文件</a>':''}${s.id==='contact'?'<a class="inline-link" data-contact-link hidden>通过邮箱联系</a>':''}</section>`;}
const galleryNames={xiaohongshu:'内容的比例',podcast:'正在倾听的少女',literature:'名画人物也要催场',visual:'灵感已发送',about:'展览之后'};
function gallery(){return `<section class="artwork-gallery" id="artwork" tabindex="-1"><p class="case-section-label">本网站的艺术制作记录</p><h2>五幕，无字试稿。</h2><p class="gallery-disclosure">以下为本网站制作的 AI 辅助艺术画面，用于展厅开场；不是运营笔记、活动现场或个人海报成果。</p><div class="gallery-grid">${Object.entries(galleryNames).map(([id,title],i)=>`<figure><a href="assets/${id}.webp" data-gallery data-gallery-group="art" data-caption="${title} · Vagus 网站 AI 辅助艺术试稿" aria-label="放大查看：${title}"><img src="assets/${id}.webp" width="1672" height="941" alt="${chapters[id].alt}" loading="lazy"></a><figcaption><span>${title}</span><span>艺术试稿</span></figcaption></figure>`).join('')}</div></section>`;}
function lightbox(){return `<dialog class="image-viewer" data-image-dialog aria-label="图片查看器"><div class="viewer-bar"><p data-image-caption></p><button type="button" data-gallery-close aria-label="关闭图片">关闭 ×</button></div><img data-image-full alt=""><div class="viewer-navigation"><button type="button" data-gallery-previous aria-label="上一张图片">← 上一张</button><output data-gallery-position aria-live="polite"></output><button type="button" data-gallery-next aria-label="下一张图片">下一张 →</button></div></dialog>`;}
function switcher(prev,next){return `<nav class="project-switch" aria-label="继续浏览">${prev?`<a href="${prev.url}"><small>上一页</small><strong>${prev.title}</strong></a>`:'<a href="works.html"><small>返回</small><strong>作品速览</strong></a>'}${next?`<a href="${next.url}"><small>下一页</small><strong>${next.title}</strong></a>`:'<a href="works.html"><small>回到</small><strong>全部作品</strong></a>'}</nav>`;}
const sequence=[...entries,{id:'about',url:'about.html',title:'About Vagus'}];
for(const [id,c] of Object.entries(chapters)){
 const index=sequence.findIndex(x=>x.id===id),prev=sequence[index-1],next=sequence[index+1];
 const intro=`<section class="case-opening" id="project-intro" tabindex="-1"><p class="case-kicker">${c.opening}</p><h2>${c.intro}</h2><p>${c.description}</p></section>`;
 const contents=`<aside class="case-contents"><span>本页内容</span><nav aria-label="${c.title}阅读目录">${c.sections.map(s=>`<a href="#${s.id}">${s.label}</a>`).join('')}${id==='visual'?'<a href="#artwork">网站艺术试稿</a>':''}</nav><a href="works.html">全部作品</a></aside>`;
 const extra=id==='visual'?gallery():id==='about'?`<section class="about-projects"><p class="case-section-label">从作品认识我</p><h2>找到你关心的方向。</h2><div class="about-links">${entries.map(e=>`<a href="${e.url}"><span>${e.title}</span><span>${e.category}</span></a>`).join('')}</div></section>`:'';
 const html=head(c.title)+`<body class="project-page completed-page theme-${id}">${header(id,next)}<main>${art(id,c)}${intro}<div class="case-layout">${contents}<div class="case-body">${c.sections.map(section).join('')}${extra}</div></div>${switcher(prev,next)}</main>${footer()}${id==='visual'?lightbox():''}</body></html>`;
 fs.writeFileSync(path.join(root,id+'.html'),html);
}
function directoryRows(){return entries.map(e=>`<a class="directory-row" href="${e.url}" data-catalog-item data-title="${e.title}" data-category="${e.category}" data-description="${e.description}"><img src="assets/${e.image}.webp" width="128" height="84" alt="" loading="lazy"><div><h2>${e.title}</h2><p>${e.description}</p></div><span class="directory-category">${e.category}</span><span aria-hidden="true">↗</span></a>`).join('');}
const works=head('作品速览')+`<body class="directory-page"><header class="directory-nav"><a class="case-brand" href="index.html">Vagus</a><a href="index.html#ai">进入探索</a><a href="about.html">关于作者</a><a href="about.html#resume" data-resume-link>看看简历</a></header><main id="top"><div class="directory-heading"><p>作品速览</p><h1>先看作品，<br>再慢慢逛展。</h1><p>按方向找到你关心的内容，直接进入独立页面。</p></div><section class="catalog" aria-label="作品目录"><div class="catalog-tools" data-filter-tools hidden><div class="filter-buttons" aria-label="作品类别">${['全部','观察与写作','数字产品','内容创作','活动策划','视觉设计'].map((c,i)=>`<button type="button" data-category-filter="${c}" aria-pressed="${i===0}">${c}</button>`).join('')}</div><label class="catalog-search">搜索作品<input type="search" data-catalog-search placeholder="名称、方向或关键词" autocomplete="off"></label></div><p class="catalog-count" data-catalog-count aria-live="polite">全部方向</p><div class="directory-list">${directoryRows()}</div><div class="catalog-empty" data-catalog-empty hidden><h2>没有找到相符的作品。</h2><p>换一个关键词，或重新查看全部方向。</p><button type="button" data-catalog-reset>查看全部作品</button></div></section><p class="directory-status">页面与展示方向已经连通；原文、音频、个人作品及简历以真实材料接入为准。</p><a class="directory-return" href="index.html">回到展览开场</a></main>${footer()}</body></html>`;
fs.writeFileSync(path.join(root,'works.html'),works);
const articleRows=[['seed','SeedRealtime','产品测评'],['vibe','Vibe Coding','创意玩法'],['selection','AI产品榜与热门精选','行业观察与内容策划']];
const ai=head('AI 行业观察')+`<body class="project-page ai-index-page"><header class="directory-nav"><a class="case-brand" href="index.html">Vagus</a><a href="index.html#ai">返回展厅</a><a href="works.html">速览作品</a><a href="start.html">下一个项目：START</a></header><main id="top"><section class="ai-directory-hero"><img src="assets/ai.webp" width="1672" height="941" alt="古典学者在夜间阅览室看橙红手机。"><div><p>观察与写作</p><h1>AI 行业观察</h1><p>在技术快速变化的时代，我更关心 AI 如何进入真实生活，以及它如何改变人们的创作、工作与表达方式。</p><a class="inline-link" href="#articles">查看文章目录</a></div></section><section class="ai-article-collection" id="articles" tabindex="-1"><h2>把观察，留在这里。</h2><p>已确认的三个主题。文章正文与原文链接接入后，可从相同位置直接阅读。</p>${articleRows.map(([id,title,type])=>`<article id="${id}" tabindex="-1"><div><p>${type}</p><h3>${title}</h3></div><div><span class="source-pending" data-source-pending="${id}">原文待接入</span><a class="inline-link" data-article-link="${id}" hidden>阅读原文</a></div></article>`).join('')}<p class="material-note">不补写未提供的原文，不填写未经核实的文章数量、作者职责或阅读指标。</p></section>${switcher(null,entries[1])}</main>${footer()}</body></html>`;
fs.writeFileSync(path.join(root,'ai.html'),ai);
// Extend the preserved, accepted homepage instead of replacing its first four paintings.
let home=fs.readFileSync(path.join(root,'sources/templates/index.html'),'utf8');
home=home.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/,'').replace('<script type="module" src="three-bridge.mjs"></script>','').replace(/\s*<canvas id="thinker-stage"[^>]*><\/canvas>/,'');
home=home.replace('本地四章节交互试作。','艺术、设计与 AI 的完整展厅与作品目录。');
home=home.replace('<link rel="stylesheet" href="chapter-pages.css">','<link rel="stylesheet" href="chapter-pages.css"><link rel="stylesheet" href="completion.css"><script type="module" src="site-features.mjs"></script>');
home=home.replace(/<nav aria-label="展厅">[\s\S]*?<\/nav>/,`<nav aria-label="展厅">${[['home','首页'],['ai','AI'],['start','START'],['hug','Hug'],['xiaohongshu','运营'],['podcast','播客'],['literature','文学节'],['visual','视觉'],['about','关于']].map(([id,t])=>`<a href="#${id}">${t}</a>`).join('')}<a href="works.html">速览</a></nav>`);
home=home.replace('让好奇心成为方法，<br>让想象力成为作品。','让好奇心成为方法，让想象力成为作品。').replace('Curiosity as a method.<br>Imagination made real.','Curiosity as a method. Imagination made real.');
home=home.replace('href="#works"><span>01</span>速览作品','href="works.html"><span>01</span>速览作品').replace('href="#resume"><span>03</span>看看简历','href="about.html#resume" data-resume-link><span>03</span>看看简历');
for(const [id] of articleRows)home=home.replace(`href="#${id}">`,`href="ai.html#${id}">`);
home=home.replace(/<button data-missing="[^"]*原文"[^>]*>查看接入状态 ↗<\/button>/g,'<a class="inline-link" href="ai.html#articles">查看文章目录</a>');
home=home.replace('<a class="text-link" href="#ai-reading">','<a class="text-link" href="ai.html">');
const added=Object.entries(chapters).map(([id,c],i)=>art(id,c,'h2',true)+(id!=='about'?`<section class="chapter-summary theme-${id}" id="${id}-reading" tabindex="-1"><div><p>${c.category}</p><h3>${c.opening}</h3></div><div><p>${c.description}</p><a class="inline-link" href="${id}.html">阅读${c.title}</a><a class="chapter-next" href="#${Object.keys(chapters)[i+1]||'works'}">下一幕：${chapters[Object.keys(chapters)[i+1]]?.title||'作品目录'} ↓</a></div></section>`:'')).join('');
home=home.replace('  <section id="works"',added+'\n  <section id="works"');
home=home.replace(/<div class="index-list">[\s\S]*?<\/div>\s*<p class="status-note">本地交互试作[^<]*<\/p>/,`<div class="index-list">${entries.map(e=>`<a href="${e.url}"><span>${e.category}</span><strong>${e.title}</strong><span>进入阅读</span></a>`).join('')}</div><a class="inline-link" href="works.html">打开可筛选的完整目录</a>`);
home=home.replace(/  <section class="end paper"[\s\S]*?<\/section>/,`<section class="end paper" id="resume" tabindex="-1" aria-labelledby="end-title"><h2 id="end-title">看过作品，<br>再认识创作者。</h2><p>正式简历与联系方式以本人确认的真实材料为准。</p><div><a href="about.html#resume" data-resume-link>简历与个人介绍</a><a href="about.html#contact">联系入口</a><a href="works.html">作品速览</a></div></section>`);
home=home.replace('Vagus · 本地四章节试作','Vagus · 名画奇妙夜');
home=home.replace('后续展厅尚未接入本次原型。','');
home=home.replace('</article>\n  </section>\n  <section class="collection-art theme-xiaohongshu"','<a href="#xiaohongshu" class="next-chapter">下一幕 <span>小红书 / 从比例到传播。</span><span aria-hidden="true">→</span></a></article>\n  </section>\n  <section class="collection-art theme-xiaohongshu"');
// The last existing product leads into the newly completed chapters.
const chapterStart=home.indexOf('<section class="collection-art theme-xiaohongshu"');
const previousEnd=home.lastIndexOf('</article>',chapterStart);
if(previousEnd>=0)home=home.slice(0,previousEnd)+'<a href="#xiaohongshu" class="next-chapter">下一幕 <span>小红书 / 从比例到传播。</span><span aria-hidden="true">→</span></a>'+home.slice(previousEnd);
fs.writeFileSync(path.join(root,'index.html'),home);
for(const id of ['start','hug']){
 let html=fs.readFileSync(path.join(root,'sources/templates',id+'.html'),'utf8');
 html=html.replace('<link rel="stylesheet" href="chapter-pages.css">','<link rel="stylesheet" href="chapter-pages.css"><link rel="stylesheet" href="completion.css"><script type="module" src="site-features.mjs"></script>');
 html=html.replaceAll('index.html#works','works.html');
 if(id==='start')html=html.replace('class="case-brand" href="works.html"','class="case-brand" href="index.html"');
 if(id==='hug'){
  html=html.replace('class="case-brand" href="works.html"','class="case-brand" href="index.html"');
  html=html.replace('<a href="start.html">上一个项目：START</a>','<a href="xiaohongshu.html">下一页：小红书运营</a>');
  html=html.replace('<a href="works.html"><small>返回</small><strong>全部作品</strong></a>','<a href="xiaohongshu.html"><small>下一页</small><strong>小红书运营</strong><span>从比例，到传播。</span></a>');
 }
 fs.writeFileSync(path.join(root,id+'.html'),html);
}
// A shared style and toggle are emitted by the generator, not patched into outputs.
for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
 let page=fs.readFileSync(path.join(root,name),'utf8');
 page=page.replace('</head>','<link rel="stylesheet" href="scene-motion.css"></head>');
 if(name==='ai.html'||name==='works.html')page=page.replace('</header>','<button data-motion-toggle type="button" hidden aria-pressed="false">关闭动态</button></header>');
 fs.writeFileSync(path.join(root,name),page);
}
console.log('Built 10 pages with shared 2D motion. 3D remains deferred.');
