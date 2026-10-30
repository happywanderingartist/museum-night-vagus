const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  "C:/Program Files/WindowsApps/OpenAI.Codex_26.1027.3384.0_x64__2p2nqsd0c76g0/app/resources/cua_node/bin/node_modules/playwright",
);

const out = __dirname;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: false,
    args: ["--ignore-gpu-blocklist", "--enable-webgl", "--use-angle=d3d11"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("https://v2.lusion.co/", { waitUntil: "domcontentloaded", timeout: 90_000 });
  await pause(Number(process.env.INITIAL_WAIT_MS || 30_000));
  const ancestry = await page.evaluate(() => {
    const canvas = document.querySelector("#preloader-canvas");
    const result = [];
    for (let element = canvas; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      result.push({
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: typeof element.className === "string" ? element.className : "",
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        position: style.position,
        zIndex: style.zIndex,
        backgroundColor: style.backgroundColor,
        pointerEvents: style.pointerEvents,
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      });
      if (element === document.body) break;
    }
    return result;
  });
  await page.screenshot({ path: path.join(out, "lusion-preloader-before-hide.png") });
  await page.evaluate(() => {
    const preloader = document.querySelector("#preloader-canvas");
    if (preloader) preloader.style.display = "none";
    for (const selector of [".preloader", ".preloader-screen", "[data-preloader]"]) {
      for (const element of document.querySelectorAll(selector)) {
        element.style.display = "none";
      }
    }
  });
  await pause(1000);
  await page.screenshot({ path: path.join(out, "lusion-preloader-after-hide.png") });
  fs.writeFileSync(
    path.join(out, "lusion-preloader-inspection.json"),
    JSON.stringify({ ancestry, url: page.url() }, null, 2),
  );
  console.log(JSON.stringify({ ancestry, url: page.url() }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
