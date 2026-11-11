import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const stage = path.dirname(fileURLToPath(import.meta.url));
const project = 'D:/AI-Data/博物馆奇妙夜/vagus-editions-2026';
const sourceRoot = 'D:/AI-Data/Projects/ChatGPT/AI产品';
const contentRoot = path.join(sourceRoot, 'docs/website-case-content-2026-11-11');
const output = path.join(stage, 'preview');
const target = path.join(project, 'site-v4/public/product-cases-2026-11-11');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
await fs.mkdir(path.join(output, 'assets'), {recursive: true});
await fs.copyFile(path.join(stage, 'cases.css'), path.join(output, 'cases.css'));

const assets = [
  ['start-art.webp', path.join(project, 'site-v4/assets/start.webp'), '既有 START 舞会艺术，沿用项目来源与授权记录'],
  ['hug-art.webp', path.join(project, 'site-v4/assets/hug.webp'), '既有 HUG 水面艺术，沿用项目来源与授权记录'],
  ['start-search.png', path.join(sourceRoot, 'evidence/start-b2-2026-11-10/artist-search.png'), '2026-11-10 合成艺人、上海、合成咖啡的实际搜索结果'],
  ['start-states.png', path.join(sourceRoot, 'evidence/start-b2-2026-11-10/state-review.png'), '七态设计提案，合成示例，界面方案待验收'],
  ['hug-returned.jpg', 'D:/AI-Data/Projects/心灵花园/.setup/persistence-demo-20261111/returned.jpg', '2026-11-11 Chrome 普通合成事项刷新后恢复'],
  ['hug-failure.jpg', 'D:/AI-Data/Projects/心灵花园/.setup/persistence-demo-20261111/save-failure.jpg', '模拟保存失败，保留上一份结果并提供重试和取消'],
  ['hug-highest.jpg', 'D:/AI-Data/Projects/心灵花园/.setup/persistence-demo-20261111/highest-stage.jpg', '合成记录撤销后保留最高已解锁阶段，露水按记录回退']
];
const manifest = [];
for (const [name, source, caption] of assets) {
  const bytes = await fs.readFile(source);
  await fs.writeFile(path.join(output, 'assets', name), bytes);
  manifest.push({name, source, caption, bytes: bytes.length, sha256: hash(bytes)});
}
const config = {
  start: {
    name: 'START', category: '主题旅行', status: '开发预览 · 内容与真实任务验证中',
    title: '让“我也想去”，<br>有一个清楚的起点。',
    intro: 'START 面向艺人和作品主题出行，把分散的地点线索、关联依据与出行准备组织起来。我负责需求、范围和业务规则判断，借助 AI 推进原型、实现与检查，目前重点验证可信内容供给和一次出行主路径。',
    role: '需求与范围判断、业务规则、AI 协作推进与结果审阅',
    graphicTitle: '从一条兴趣线索，<br>到一次有依据的选择',
    graphicCaption: '产品任务示意。真实界面局部使用合成数据，当前开放条件与地图交接仍在验证。',
    steps: [['主题线索', '艺人或作品与城市'], ['核验关联', '回到来源，确认关系'], ['选择地点', '地址与当前条件'], ['交接地图', '确认目的地后交给地图']],
    task: '为一次艺人或作品主题出行，选定有依据且可前往的地点，并安排下一步。',
    comparison: [
      ['收集地点', '网页和社交分享地点导入，配合标签整理。', '指南加点、预订导入及旅行规划。', '已形成地点发现预览，可信主题目录的供给仍在验证。'],
      ['判断主题关系', '评论可记录保存理由，主题核查深度待实际比较。', '站点可添加笔记与链接，主题审核机制待核。', '独立关联贡献及来源标题、类别、链接已进入后台合同。'],
      ['决定现在能否前往', '开放条件的具体维护方式待客户端核对。', '当地条件与出行资料的维护方式待核对。', '两处成都地图候选仍缺资料，本批近期可发布地点为 0。'],
      ['安排出行与返回', '地图、标签与编辑能力来自官方介绍。', '行程、地图、重排及同步来自官方介绍。', '筛选上下文已有修复，统一入口与真机地图交接待验证。'],
      ['失效与维护', '推荐地图、共享与编辑机制需结合任务观察。', '指南与同行协作的维护成本需结合任务观察。', '候选、核对、审核、发布、纠错形成拟验证的运营闭环。']
    ],
    competitors: ['Mapstr', 'Wanderlog'],
    comparisonConclusion: '主题关联的核验与持续维护，能否减少用户重复判断，是 START 下一轮需要验证的差异化假设。合格内容、切换意愿和一次完整出行任务决定后续投入。',
    sources: [['Mapstr 官方介绍', 'https://www.mapstr.com/'], ['Mapstr 官方 FAQ', 'https://en.mapstr.com/faq'], ['Wanderlog 官方介绍', 'https://wanderlog.com/']],
    evidence: '来源标题、类别和链接已接入保存、投稿审核与公开读取合同。新表单、审核日期与当前开放状态合同、云部署和真机地图交接继续待验。当前成都样本为 2 个地图候选、0 个近期可发布地点。',
    engineering: '截至 2026-11-11，定向 18 项、平台 162 项、云适配 147 项通过。sourceDetails 后台合同进入私有草稿 PR #1，提交 5a14502。各数量对应相应工程用例，代码可按需审阅。',
    proposed: '用同一份合格主题材料，观察收集、核验、选点、修改与地图交接。保留原有内容搜索与地图组合，记录完整耗时、人工修改、弃用与维护成本。'
  },
  hug: {
    name: 'HUG', category: '自我关怀', status: '浏览器原型 · 合成事项验证中',
    title: '今天，从你愿意的<br>一点开始。',
    intro: 'HUG 围绕心灵恢复、生活秩序与花草陪伴，设计倾听、行动和休息的选择。用户可以看懂建议、继续拆小、主动采纳到 Today，再从温和花园反馈中找回自己的节奏。我负责参与门槛与反馈规则等产品取舍，借助 AI 推进原型和检查，目前可体验普通合成事项的建议与刷新恢复。',
    role: '低精力参与、微行动、休息与拒绝、花园反馈规则及 AI 协作推进',
    graphicTitle: '让一个建议，<br>成为可以找回、<br>也能改变主意的小事',
    graphicCaption: '浏览器普通合成事项演示，展示任务与保存行为，心理效果仍待研究。',
    steps: [['表达意图', '倾听、行动或休息'], ['预览与拆小', '看懂后自主选择'], ['明确采纳', '进入 Today，稍后找回'], ['温和反馈', '可以撤回或改变主意']],
    task: '表达当前状态，自主决定要不要行动，并在稍后找回自己接受的小事。',
    competitors: ['Finch', 'How We Feel'],
    comparison: [
      ['表达当前需要', '自我关怀目标与虚拟宠物反馈。', '情绪识别、记录和回顾，资料中有可选 AI 功能。', '倾听、行动、休息分别设计，真实自由表达的理解增益待测。'],
      ['选择愿意做的一步', '可创建、编辑及完成目标，实际配置负担待比较。', '提供情绪策略，具体选择与修改方式待任务观察。', '固定合成示例支持预览、拆小、自主采纳。'],
      ['拒绝或改变主意', '官方帮助提供暂停、延后与编辑等操作。', 'AI 功能自愿启用，具体建议修改路径待核。', '拒绝与休息有出口，采纳后可按规则撤回或撤销。'],
      ['稍后回来', '记录与账户机制的故障恢复待实际比较。', '签到与回看机制的设备表现待实际比较。', '显式浏览器演示已验证普通合成事项刷新恢复，正式保存方案待推进。'],
      ['依据与内容质量', '各项方法的依据与适用性仍需专项核对。', '开发者介绍了策略，逐项适配仍需核对。', '8 张场景卡为待审稿，真实模型、专业审核及效果继续待验证。']
    ],
    comparisonConclusion: '用户意图、可承受的小行动、反悔与再次使用的连续性，是 HUG 需要放进同一任务检验的组合。下一轮重点观察理解与修改负担、自主选择和再次使用理由。',
    sources: [['Finch 官方介绍', 'https://finchcare.com/'], ['Finch 目标帮助', 'https://help.finchcare.com/hc/en-us/articles/37779940291213-Creating-and-Completing-Goals'], ['How We Feel 开发者介绍', 'https://apps.apple.com/us/app/how-we-feel/id1562706384'], ['How We Feel 隐私与 AI 说明', 'https://howwefeel.web.app/privacy']],
    evidence: '显式浏览器入口中的普通合成事项已能保存、刷新找回与撤回，保存失败提供重试和取消。8 张恢复场景卡仍为 draft_unreviewed。正式存储与恢复政策、微信和真机、真实模型、专业审核及真实用户效果继续待验证。',
    engineering: '截至 2026-11-11，Chrome 原生存储 9 项、UI 集成 5 项、DOM 77 项、工作区 297 项及场景/服务 30 项通过。私有补丁 ce341c70 用于保全当前改动，完整可检出工程分支仍待整合。',
    proposed: '以普通或合成事项比较倾听、行动和休息分支，观察表达、理解、修改、明确采纳、返回及撤回。通用聊天与待办组合保留为基线，记录负担与再次使用的具体理由。'
  }
};

function inline(text) {
  return escape(text).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
function markdown(text) {
  const lines = text.trim().split(/\r?\n/);
  const parts = [];
  let paragraph = [], table = [];
  function flushParagraph() { if (paragraph.length) { parts.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } }
  function flushTable() {
    if (!table.length) return;
    const rows = table.filter(row => !/^\s*\|\s*:?-/.test(row)).map(row => row.trim().slice(1, -1).split('|').map(cell => cell.trim()));
    parts.push('<div class="table-scroll"><table><thead><tr>' + rows[0].map(cell => `<th>${inline(cell)}</th>`).join('') + '</tr></thead><tbody>' + rows.slice(1).map(row => '<tr>' + row.map(cell => `<td>${inline(cell)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
    table = [];
  }
  for (const line of lines) {
    if (line.startsWith('编辑用来源为')) continue;
    if (line.startsWith('|')) { flushParagraph(); table.push(line); continue; }
    flushTable();
    if (!line.trim()) { flushParagraph(); continue; }
    if (line.startsWith('### ')) { flushParagraph(); parts.push(`<h3>${inline(line.slice(4))}</h3>`); }
    else paragraph.push(line);
  }
  flushParagraph(); flushTable();
  return parts.join('\n');
}
function splitSections(source) {
  return source.split(/^## /m).slice(1).map(block => {
    const newline = block.indexOf('\n');
    return {title: block.slice(0, newline).trim(), text: block.slice(newline + 1).trim()};
  }).filter(section => section.title !== '展厅与首屏');
}
function header(key, compare = false) {
  return `<header class="case-header"><a class="brand" href="index.html">Vagus</a><nav aria-label="案例导航"><a href="${key}.html" ${compare ? '' : 'aria-current="page"'}>产品案例</a><a href="${key}-compare.html" ${compare ? 'aria-current="page"' : ''}>竞品分析</a><a href="/site-v4/works.html">作品速览</a><a href="/reference/eye-reflection/index.html">返回展览</a></nav></header>`;
}
function shell(title, key, body, className = '') {
  const exportCleanup = className === 'artboard-page' ? `<script>
    // This export-only page keeps translation controls outside the artwork.
    function clearExportControls() {
      document.documentElement.querySelector(':scope > #st-root')?.remove();
    }
    clearExportControls();
    new MutationObserver(clearExportControls).observe(document.documentElement, {childList: true});
  </script>` : '';
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · Vagus 图文方案</title><link rel="stylesheet" href="cases.css"></head><body class="${key} ${className}">${body}${exportCleanup}</body></html>\n`;
}
function flow(c) {
  return `<ol class="task-flow">${c.steps.map(([title, text]) => `<li><h3>${title}</h3><p>${text}</p></li>`).join('')}</ol>`;
}
function figure(src, caption, className = '') {
  return `<figure class="${className}"><a href="assets/${src}" target="_blank" rel="noopener"><img src="assets/${src}" alt="${escape(caption)}" loading="lazy"></a><figcaption>${caption}</figcaption></figure>`;
}
for (const [key, c] of Object.entries(config)) {
  const source = await fs.readFile(path.join(contentRoot, `${c.name}-页面文案.md`), 'utf8');
  const sections = splitSections(source);
  const contentHash = hash(Buffer.from(source));
  const ids = sections.map((section, index) => ({...section, id: `section-${index + 1}`}));
  const readingNav = `<aside class="reading-nav"><p>${c.name}</p><nav aria-label="本页阅读">${ids.map(s => `<a href="#${s.id}">${s.title}</a>`).join('')}<a href="#evidence">当前证据与阶段</a></nav><a class="compare-entry" href="${key}-compare.html">详细竞品分析</a></aside>`;
  let body = `${header(key)}<main><section class="product-opening"><div class="opening-art"><img src="assets/${key}-art.webp" alt="Vagus 既有${c.name}章节艺术"><div class="opening-copy"><p class="product-stage">${c.category} · ${c.status}</p><h1>${c.name}</h1><p class="opening-line">${c.title}</p><a href="#case-summary">阅读产品案例</a></div></div><div class="case-summary" id="case-summary"><h2>${key === 'start' ? '把喜欢的人和作品，变成有依据的出行线索。' : '把恢复生活秩序，拆成愿意尝试的一小步。'}</h2><p>${c.intro}</p><dl><div><dt>我的职责</dt><dd>${c.role}</dd></div><div><dt>目前阶段</dt><dd>${c.status}</dd></div></dl><a href="${key}-compare.html">查看竞品分析</a></div></section><section class="intro-figure">${figure(`${key}-intro.jpg`, c.graphicCaption)}<a href="${key}-intro.html">打开可编辑排版主图</a></section><div class="reading-layout">${readingNav}<article class="reading-body">`;
  for (const section of ids) {
    body += `<section id="${section.id}"><h2>${section.title}</h2>${markdown(section.text)}`;
    if (section.title === '核心路径与功能解释') {
      body += `<div class="flow-note"><h3>一次使用的目标顺序</h3>${flow(c)}<p class="caption">任务关系示意，能力与验收范围见图注及当前阶段。</p></div>`;
      if (key === 'start') body += figure('start-search.png', '2026-11-10 合成数据检查。实际搜索界面保留艺人、上海与合成咖啡条件，供检查当前实现。', 'evidence-picture');
      else body += figure('hug-returned.jpg', '2026-11-11 Chrome 普通合成事项演示。刷新后恢复已保存完成记录，画面保留了合成标记。', 'evidence-picture');
    }
    if (section.title === '我的取舍与一次修复') {
      if (key === 'hug') body += figure('hug-failure.jpg', '模拟保存失败。界面保留上一份结果，并提供重试和取消。', 'evidence-picture');
      else body += `<details><summary>查看七态界面设计提案</summary>${figure('start-states.png', '七态设计提案审阅稿。地点、艺人与来源均为合成示例，界面方案待验收。')}</details>`;
    }
    if (section.title === '竞品分析概览') body += `<p><a class="read-link" href="${key}-compare.html">展开同任务对照与判断依据</a></p>`;
    body += '</section>';
  }
  body += `<section id="evidence"><h2>当前证据与下一步</h2><p>${c.evidence}</p><details><summary>工程验收范围与代码审阅说明</summary><p>${c.engineering}</p><p>页面中的图片与摘要可直接阅读。私有代码及详细材料可按需审阅。</p></details><p class="caption">事实截至 2026 年 11 月 11 日。真实用户收益、增长与收入按后续观察记录。</p></section></article></div><nav class="case-next"><a href="${key}-compare.html">继续阅读 ${c.name} 竞品分析</a><a href="${key === 'start' ? 'hug' : 'start'}.html">${key === 'start' ? 'HUG' : 'START'} 产品案例</a></nav></main><footer>Vagus · 图文设计方案待评审 <a href="index.html">返回方案总览</a></footer>`;
  await fs.writeFile(path.join(output, `${key}.html`), shell(`${c.name} 产品案例`, key, body));

  const compareBody = `${header(key, true)}<main class="comparison-page"><section class="comparison-opening"><p>${c.name} / 同任务比较</p><h1>${key === 'start' ? '一次主题出行，<br>需要完成哪些判断。' : '一次低精力支持，<br>怎样表达、选择与返回。'}</h1><p class="lead">${c.task}</p><p class="caption">资料访问于 2026 年 11 月 11 日。官方资料与本项目验收记录用于建立当前判断，客户端步数、耗时、版本条件及主观体验继续待测。</p><nav><a href="#task">任务与判据</a><a href="#comparison">逐步对照</a><a href="#decision">判断与下一轮</a><a href="#sources">资料来源</a></nav></section><div class="comparison-reading"><section id="task"><h2>先固定一次任务</h2><p>${c.task}</p>${flow(c)}<p>观察中保留原有工具组合，允许修改、放弃和返回，记录每一步需要的输入、依据和人工处理。${c.proposed}</p></section><section id="comparison"><h2>沿任务逐步比较</h2><div class="table-scroll"><table><thead><tr><th>需要解决的问题</th><th>${c.competitors[0]}</th><th>${c.competitors[1]}</th><th>${c.name} 当前范围</th></tr></thead><tbody>${c.comparison.map(row => '<tr>' + row.map((cell, index) => `<${index ? 'td' : 'th'}>${cell}</${index ? 'td' : 'th'}>`).join('') + '</tr>').join('')}</tbody></table></div><p class="caption">竞品栏来自下方官方资料，具体使用表现仍待同任务体验。${c.name} 栏使用本轮项目记录。</p></section><section id="decision"><h2>由现有依据作出怎样的判断</h2><p class="decision">${c.comparisonConclusion}</p><div class="decision-columns"><div><h3>目前能说明的事</h3><p>${c.evidence}</p></div><div><h3>下一轮怎样观察</h3><p>${c.proposed}</p></div></div></section><section id="sources"><h2>研究来源与可追问证据</h2><p>以下为官方资料入口。功能介绍由各提供方撰写，比较结论仍需结合实际任务、版本与条件检验。</p><ul class="source-list">${c.sources.map(([title, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${title}</a><span>访问于 2026-11-11</span></li>`).join('')}</ul><details><summary>查看本项目的工程证据范围</summary><p>${c.engineering}</p></details></section></div><nav class="case-next"><a href="${key}.html">返回 ${c.name} 产品案例</a><a href="${key === 'start' ? 'hug' : 'start'}-compare.html">另一款产品的同任务比较</a></nav></main><footer>Vagus · 竞品分析阅读方案 <a href="index.html">返回方案总览</a></footer>`;
  await fs.writeFile(path.join(output, `${key}-compare.html`), shell(`${c.name} 竞品分析`, key, compareBody));

  const poster = key === 'start'
    ? `<main class="intro-artboard start-poster"><div class="poster-art"><img src="assets/start-art.webp" alt="既有START舞会艺术"><div class="poster-title"><p>主题旅行 · 开发预览</p><h1>START</h1><h2>${c.graphicTitle}</h2></div></div><section class="poster-explanation"><p class="diagram-label">产品任务示意</p>${flow(c)}</section><figure class="start-evidence"><p>当前实现 · 真实合成检索局部</p><div class="search-fields-crop"><img src="assets/start-search.png" alt="合成咖啡搜索条件与艺人、城市筛选"></div><div class="search-result-crop"><img src="assets/start-search.png" alt="合成咖啡A的实际搜索结果"></div><figcaption>2026-11-10 · 合成艺人 A / 上海 / 合成咖啡</figcaption></figure><p class="poster-caption start-caption">${c.graphicCaption}</p></main>`
    : `<main class="intro-artboard hug-poster"><img class="poster-water" src="assets/hug-art.webp" alt="既有HUG水面艺术"><div class="hug-poster-copy"><p>自我关怀 · 浏览器原型</p><h1>HUG</h1><h2>${c.graphicTitle}</h2><div class="hug-principles"><p>先看懂建议，再决定是否采纳。</p><p>稍后能找回，也可以改变主意。</p><p>完成与自愿休息，得到同等反馈。</p></div></div><figure class="poster-screen"><img src="assets/hug-returned.jpg" alt="普通合成事项刷新后恢复"><figcaption>真实浏览器合成事项演示 · 刷新后恢复的完成记录</figcaption></figure><p class="poster-caption hug-caption">${c.graphicCaption}</p></main>`;
  await fs.writeFile(path.join(output, `${key}-intro.html`), shell(`${c.name} 产品介绍主图`, key, poster, 'artboard-page'));
  await fs.writeFile(path.join(output, `${key}-content.json`), JSON.stringify({date: '2026-11-11', source: path.join(contentRoot, `${c.name}-页面文案.md`), sourceSha256: contentHash, config: c, sections}, null, 2));
}

const indexBody = `<header class="case-header"><a class="brand" href="/site-v4/index.html">Vagus</a><nav><a href="/reference/eye-reflection/index.html">进入展览</a><a href="/site-v4/works.html">作品速览</a></nav></header><main class="design-index"><p>START / HUG · 图文设计方案 · 2026-11-11</p><h1>从展览里的好奇，<br>走进产品的判断与过程。</h1><p class="lead">两款产品沿用各自的艺术入口。案例页先说明任务与当前阶段，再通过真实界面、失败修复和同任务比较，展开产品判断。</p><div class="case-pair">${Object.entries(config).map(([key,c]) => `<article class="${key}"><a href="${key}.html"><img src="assets/${key}-intro.jpg" alt="${c.name}介绍主图"><h2>${c.name}</h2></a><p>${c.status}</p><nav><a href="${key}.html">产品案例</a><a href="${key}-compare.html">竞品分析</a><a href="${key}-intro.html">介绍主图</a></nav></article>`).join('')}</div><section class="design-note"><h2>推荐的阅读路径</h2><p>蒙娜丽莎工作室 → 镜片倒影 → 七方向球面目录 → 产品案例 → 竞品分析。产品案例也可由作品速览直接到达。正式接入时，返回应恢复原球面朝向和焦点，进入章节后的正文使用自然滚动。</p><h2>本轮审阅重点</h2><p>介绍主图能否清楚解释产品任务，案例正文能否支持面试追问，比较是否有来源和实际边界。新视觉保持在可审阅方案中，现有案例页仅补充已确认的简介、职责与阶段字段。</p></section></main><footer>Vagus · 待评审的页面编排</footer>`;
await fs.writeFile(path.join(output, 'index.html'), shell('产品案例图文方案', 'overview', indexBody));
await fs.writeFile(path.join(output, 'asset-manifest.json'), JSON.stringify({date: '2026-11-11', assets: manifest}, null, 2));

// Keep the review bundle portable under both the full project server and site root.
for (const file of (await fs.readdir(output)).filter(file => file.endsWith('.html'))) {
  const text = await fs.readFile(path.join(output, file), 'utf8');
  const returnTarget = file.startsWith('start') ? '../../index.html#start' : file.startsWith('hug') ? '../../index.html#hug' : '../../index.html';
  await fs.writeFile(path.join(output, file), text.replaceAll('href="/site-v4/', 'href="../../').replaceAll('href="/reference/eye-reflection/index.html"', `href="${returnTarget}"`));
}

if (process.argv.includes('--install')) {
  await fs.mkdir(target, {recursive: true});
  await fs.cp(output, target, {recursive: true});
  const backup = path.join(project, 'docs/superpowers/specs/2026-11-11-product-cases-before');
  await fs.mkdir(backup, {recursive: true});
  const changes = [];
  for (const [key, c] of Object.entries(config)) {
    const file = path.join(project, 'site-v4', `${key}.html`);
    const before = await fs.readFile(file, 'utf8');
    const backupFile = path.join(backup, `${key}.html`);
    try { await fs.writeFile(backupFile, before, {flag: 'wx'}); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    if (!before.includes('<dt>本人负责</dt><dd>') || !before.includes('<dt>本页状态</dt><dd>')) throw new Error(`Confirmed content fields missing in ${file}`);
    let after = before.replace(/(<dt>本人负责<\/dt><dd>)[\s\S]*?(<\/dd>)/, `$1${c.role}。资料整理、候选文案、代码和回归由 AI 辅助完成。$2`);
    after = after.replace(/(<dt>本页状态<\/dt><dd>)[\s\S]*?(<\/dd>)/, `$1${c.status}。${key === 'start' ? '来源字段后台合同已有工程验收，内容与实际出行验证继续推进。' : '普通合成事项已验证浏览器刷新恢复，正式存储与真实用户效果继续验证。'}$2`);
    after = after.replace(/<section class="case-evidence" id="evidence"[\s\S]*?<\/section>/, `<section class="case-evidence" id="evidence" tabindex="-1"><p class="case-section-label">作品证据</p><h2>当前可核对的实现与阶段。</h2><p>${c.evidence}</p><p><a href="public/product-cases-2026-11-11/${key}.html">阅读完整产品案例图文方案</a> · <a href="public/product-cases-2026-11-11/${key}-compare.html">阅读竞品分析方案</a></p><p class="case-caption">图文编排待评审，事实截至 2026 年 11 月 11 日。</p></section>`);
    after = after.replace('真实界面接入后展示一个完整流程', '显式浏览器入口已验证普通合成事项保存与刷新恢复');
    await fs.writeFile(file, after);
    const baseline = await fs.readFile(backupFile);
    changes.push({file, beforeSha256: hash(baseline), afterSha256: hash(Buffer.from(after)), fields: ['本人负责', '本页状态', '作品证据及图文方案链接']});
  }
  const galleryFile = path.join(project, 'reference-rebuild-2026-11-09/reference/eye-reflection/reflection.mjs');
  const galleryBefore = await fs.readFile(galleryFile, 'utf8');
  const galleryBackup = path.join(backup, 'reflection.mjs');
  try { await fs.writeFile(galleryBackup, galleryBefore, {flag: 'wx'}); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  const galleryAfter = galleryBefore.replace("description: '复刻偶像足迹的追星旅行产品。'", "description: '把喜欢的人和作品，变成有依据的出行线索。开发预览中，来源字段后台合同已有工程验收，内容与真实任务继续验证。'").replace("description: '温和、无惩罚的自我照顾。'", "description: '把恢复生活秩序，拆成愿意尝试的一小步。浏览器原型已验证普通合成事项保存与刷新恢复，真实用户效果继续验证。'");
  if (galleryAfter !== galleryBefore) await fs.writeFile(galleryFile, galleryAfter);
  changes.push({file: galleryFile, beforeSha256: hash(Buffer.from(galleryBefore)), afterSha256: hash(Buffer.from(galleryAfter)), fields: ['START description', 'HUG description']});
  await fs.writeFile(path.join(target, 'content-integration.json'), JSON.stringify({date: '2026-11-11', changes, backup}, null, 2));
}
console.log(JSON.stringify({output, target, pages: 7, assets: manifest.length, installed: process.argv.includes('--install')}, null, 2));
