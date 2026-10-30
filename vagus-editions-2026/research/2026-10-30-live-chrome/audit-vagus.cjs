const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  "C:/Program Files/WindowsApps/OpenAI.Codex_26.1027.3384.0_x64__2p2nqsd0c76g0/app/resources/cua_node/bin/node_modules/playwright",
);

const root = __dirname;
const out = path.join(root, "vagus-audit");
fs.mkdirSync(out, { recursive: true });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: false,
    args: ["--disable-background-timer-throttling", "--ignore-gpu-blocklist"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "zh-CN",
  });
  const page = await context.newPage();
  const events = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) {
      events.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => events.push({ type: "pageerror", text: String(error) }));
  await page.goto("http://127.0.0.1:4184/", { waitUntil: "networkidle", timeout: 60_000 });
  await pause(2000);

  const records = [];
  const targetSelectors = [
    "#home",
    "#ai",
    "#ai-reading",
    "#start",
    "#start-reading",
    "#hug",
    "#hug-reading",
    "#xiaohongshu",
    "#podcast",
    "#literature",
    "#visual",
    "#about",
  ];
  for (const selector of targetSelectors) {
    const selectorExists = await page.locator(selector).count();
    const locator = selectorExists ? page.locator(selector).first() : null;
    if (!locator) {
      const chapter = page.locator(`[data-chapter="${selector.replace("#", "")}"]`).first();
      if (!(await chapter.count())) continue;
      await chapter.scrollIntoViewIfNeeded();
    } else {
      await locator.scrollIntoViewIfNeeded();
    }
    await pause(900);
    const state = await page.evaluate(() => {
      const section =
        document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest(
          "section,.scene-track,.collection-art,.case-hero",
        ) || document.body;
      const rect = section.getBoundingClientRect();
      return {
        scrollY,
        bodyClass: document.body.className,
        section: {
          tag: section.tagName.toLowerCase(),
          id: section.id,
          className: typeof section.className === "string" ? section.className : "",
          top: Math.round(rect.top + scrollY),
          height: Math.round(rect.height),
        },
        headings: Array.from(document.querySelectorAll("h1,h2,h3"))
          .filter((element) => {
            const r = element.getBoundingClientRect();
            return r.bottom > 0 && r.top < innerHeight && getComputedStyle(element).visibility !== "hidden";
          })
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180),
            fontFamily: getComputedStyle(element).fontFamily,
            fontSize: getComputedStyle(element).fontSize,
          })),
      };
    });
    const file = path.join(out, `${selector.replace("#", "")}.png`);
    await page.screenshot({ path: file, fullPage: false });
    records.push({ selector, screenshot: file, ...state });
  }
  fs.writeFileSync(path.join(root, "vagus-audit.json"), JSON.stringify({ records, events }, null, 2));
  console.log(JSON.stringify({ frames: records.map((record) => record.screenshot), events }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
