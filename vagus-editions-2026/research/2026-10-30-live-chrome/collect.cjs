const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  "C:/Program Files/WindowsApps/OpenAI.Codex_26.1027.3384.0_x64__2p2nqsd0c76g0/app/resources/cua_node/bin/node_modules/playwright",
);

const outputDir = __dirname;
const screenshotsDir = path.join(outputDir, "screenshots");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profileDir = "D:/AI-Data/Cache/chrome-vagus-research";

fs.mkdirSync(screenshotsDir, { recursive: true });
fs.mkdirSync(profileDir, { recursive: true });

const sites = [
  {
    id: "shopify",
    url: "https://www.shopify.com/editions/winter2026",
    headings: ["Sidekick", "Agentic", "Marketing", "Shop"],
  },
  {
    id: "contra",
    url: "https://contralabs.com/",
    headings: ["Offerings", "missing signal", "Contra"],
  },
  {
    id: "lusion",
    url: "https://lusion.co/",
    headings: ["Step into a new world", "Let's work together", "Projects"],
  },
  {
    id: "lusion-v2",
    url: "https://v2.lusion.co/",
    headings: ["Step into a new world", "Let's work together", "Projects", "About"],
  },
];
const siteFilter = (process.env.SITE_FILTER || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const initialWaitMs = Number(process.env.INITIAL_WAIT_MS || 4500);
const outputSuffix = siteFilter.length ? siteFilter.join("-") : "all";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function dismissConsent(page) {
  const candidates = [
    "Accept all",
    "Accept All",
    "Allow all",
    "I agree",
    "Got it",
    "Close",
  ];
  for (const label of candidates) {
    const button = page.getByRole("button", { name: label, exact: false }).first();
    if (await button.count()) {
      try {
        await button.click({ timeout: 1200 });
        await pause(350);
        return label;
      } catch {}
    }
  }
  return null;
}

async function pageSnapshot(page) {
  return page.evaluate(() => {
    const css = (selector) =>
      Array.from(document.querySelectorAll(selector))
        .slice(0, 20)
        .map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            id: element.id,
            className: typeof element.className === "string" ? element.className : "",
            role: element.getAttribute("role"),
            tag: element.tagName.toLowerCase(),
            text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 160),
            position: style.position,
            transform: style.transform,
            opacity: style.opacity,
            zIndex: style.zIndex,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          };
        });

    return {
      title: document.title,
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      document: {
        scrollY: Math.round(scrollY),
        scrollHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.scrollHeight,
      },
      headings: Array.from(document.querySelectorAll("h1,h2,h3"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            level: element.tagName.toLowerCase(),
            text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180),
            top: Math.round(rect.top + scrollY),
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
          };
        })
        .filter((item) => item.text)
        .slice(0, 80),
      canvases: css("canvas"),
      fixedOrSticky: css("header,nav,[style*='fixed'],[style*='sticky']").slice(0, 40),
      heroCandidates: css("main > section:first-of-type,[data-section],section").slice(0, 40),
      transformSamples: css("[style*='transform'], [class*='motion'], [class*='hero'], [class*='scroll']").slice(
        0,
        50,
      ),
      links: Array.from(document.querySelectorAll("a"))
        .map((anchor) => ({
          text: (anchor.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          href: anchor.href,
        }))
        .filter((item) => item.text || item.href)
        .slice(0, 80),
    };
  });
}

async function collectSite(browser, site) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const events = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      events.push({ type: `console:${message.type()}`, text: message.text() });
    }
  });
  page.on("pageerror", (error) => events.push({ type: "pageerror", text: String(error) }));

  const response = await page.goto(site.url, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await pause(initialWaitMs);
  const consent = await dismissConsent(page);
  await pause(1200);

  const initial = await pageSnapshot(page);
  const total = initial.document.scrollHeight;
  const height = initial.viewport.height;
  const positions = Array.from(new Set([0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => Math.round((total - height) * ratio))));
  const states = [];

  for (let index = 0; index < positions.length; index += 1) {
    const y = positions[index];
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await pause(1300);
    const state = await pageSnapshot(page);
    const file = path.join(screenshotsDir, `${site.id}-${String(index).padStart(2, "0")}-${y}.png`);
    await page.screenshot({ path: file, fullPage: false });
    states.push({ requestedY: y, screenshot: file, ...state });
  }

  const headings = new Map(initial.headings.map((heading) => [heading.text.toLowerCase(), heading]));
  const targets = [];
  for (const wanted of site.headings) {
    const match = initial.headings.find((heading) =>
      heading.text.toLowerCase().includes(wanted.toLowerCase()),
    );
    if (match) targets.push({ wanted, ...match });
  }
  for (const target of targets) {
    const before = await page.evaluate(() => scrollY);
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), Math.max(0, target.top - 90));
    await pause(1500);
    const after = await page.evaluate(() => scrollY);
    const file = path.join(
      screenshotsDir,
      `${site.id}-target-${target.wanted.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`,
    );
    await page.screenshot({ path: file, fullPage: false });
    states.push({
      requestedTarget: target.wanted,
      requestedY: Math.max(0, target.top - 90),
      before,
      after,
      screenshot: file,
      ...(await pageSnapshot(page)),
    });
  }

  await context.close();
  return {
    id: site.id,
    requestedUrl: site.url,
    status: response ? response.status() : null,
    consent,
    initial,
    states,
    targets,
    events,
  };
}

(async () => {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: false,
    args: [
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--ignore-gpu-blocklist",
      "--enable-webgl",
      "--use-angle=d3d11",
    ],
  });
  const results = [];
  try {
    for (const site of sites.filter((item) => !siteFilter.length || siteFilter.includes(item.id))) {
      try {
        results.push(await collectSite(browser, site));
      } catch (error) {
        results.push({ id: site.id, requestedUrl: site.url, error: String(error), stack: error.stack });
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(
    path.join(outputDir, `live-research-${outputSuffix}.json`),
    JSON.stringify({ collectedAt: new Date().toISOString(), results }, null, 2),
  );
  for (const result of results) {
    console.log(
      JSON.stringify({
        id: result.id,
        status: result.status,
        error: result.error,
        title: result.initial && result.initial.title,
        finalUrl: result.initial && result.initial.url,
        states: result.states && result.states.length,
        screenshots: result.states && result.states.map((state) => state.screenshot),
      }),
    );
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
