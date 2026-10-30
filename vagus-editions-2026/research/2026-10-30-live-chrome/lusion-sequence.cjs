const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  "C:/Program Files/WindowsApps/OpenAI.Codex_26.1027.3384.0_x64__2p2nqsd0c76g0/app/resources/cua_node/bin/node_modules/playwright",
);

const root = __dirname;
const screenshots = path.join(root, "lusion-sequence");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
fs.mkdirSync(screenshots, { recursive: true });
const waitMs = Number(process.env.INITIAL_WAIT_MS || 20_000);
const targets = (process.env.TARGETS || "home,about")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const outputSuffix = targets.length ? targets.join("-") : "all";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function state(page) {
  return page.evaluate(() => {
    const visibleText = Array.from(
      document.querySelectorAll("h1,h2,h3,p,a,button,[aria-label]"),
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.bottom > 0 &&
          rect.top < innerHeight &&
          rect.right > 0 &&
          rect.left < innerWidth &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number(style.opacity) > 0.05
        );
      })
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: typeof element.className === "string" ? element.className : "",
        text: (element.textContent || element.getAttribute("aria-label") || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 220),
        rect: (() => {
          const rect = element.getBoundingClientRect();
          return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })(),
        transform: getComputedStyle(element).transform,
        opacity: getComputedStyle(element).opacity,
      }))
      .filter((item) => item.text)
      .slice(0, 100);
    return {
      title: document.title,
      url: location.href,
      scrollY,
      innerHeight,
      bodyHeight: document.body.scrollHeight,
      htmlHeight: document.documentElement.scrollHeight,
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className,
      canvases: Array.from(document.querySelectorAll("canvas")).map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        const style = getComputedStyle(canvas);
        return {
          id: canvas.id,
          className: typeof canvas.className === "string" ? canvas.className : "",
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          position: style.position,
          opacity: style.opacity,
          zIndex: style.zIndex,
        };
      }),
      visibleText,
    };
  });
}

async function runPage(page, id, steps) {
  const records = [];
  for (let index = 0; index <= steps; index += 1) {
    if (index > 0) {
      await page.mouse.move(720, 450);
      await page.mouse.wheel(0, 700);
      await pause(1200);
    }
    const file = path.join(screenshots, `${id}-${String(index).padStart(2, "0")}.png`);
    await page.screenshot({ path: file, fullPage: false });
    records.push({ step: index, screenshot: file, ...(await state(page)) });
    const signature = records[records.length - 1].visibleText.map((item) => item.text).join("|");
    console.log(`${id} ${index} ${signature.slice(0, 180)}`);
  }
  return records;
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
    for (const target of [
      { id: "home", url: "https://v2.lusion.co/", steps: 11 },
      { id: "about", url: "https://v2.lusion.co/about/", steps: 15 },
    ].filter((item) => targets.includes(item.id))) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        locale: "en-US",
        colorScheme: "dark",
      });
      const page = await context.newPage();
      await page.bringToFront();
      const response = await page.goto(target.url, {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });
      await pause(waitMs);
      // Lusion v2 intermittently leaves an empty preloader canvas in the
      // compositor after its DOM wrapper has already finished. Hide only that
      // finished canvas so the already-loaded WebGL scene can be observed.
      await page.evaluate(() => {
        const preloader = document.querySelector("#preloader-canvas");
        if (preloader) preloader.style.display = "none";
        for (const element of document.querySelectorAll(
          "#preloader,.preloader,.preloader-screen,[data-preloader]",
        )) {
          const rect = element.getBoundingClientRect();
          if (getComputedStyle(element).display === "none" || rect.width === 0 || rect.height === 0) {
            element.style.display = "none";
          }
        }
      });
      await pause(5000);
      const initial = await state(page);
      const records = await runPage(page, target.id, target.steps);
      results.push({
        id: target.id,
        requestedUrl: target.url,
        status: response ? response.status() : null,
        initial,
        records,
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(
    path.join(root, `lusion-sequence-${outputSuffix}.json`),
    JSON.stringify({ collectedAt: new Date().toISOString(), results }, null, 2),
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
