const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

(async () => {
  fs.mkdirSync("artifacts", { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--enable-webgl", "--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const loading = document.querySelector(".ehx-loading");
    return loading && loading.classList.contains("hidden");
  }, null, { timeout: 30000 });

  const desktop = await page.evaluate(() => {
    const root = document.querySelector(".ehx-site");
    const canvas = root.querySelector(".ehx-room-canvas");
    const columns = getComputedStyle(root.querySelector(".ehx-config-grid")).gridTemplateColumns.split(" ").length;
    return {
      title: document.title,
      canvas: !!canvas && canvas.width > 0 && canvas.height > 0,
      gridColumns: columns,
      status: root.querySelector(".ehx-current-palette").textContent.trim(),
      canvasPixels: canvas ? canvas.toDataURL().length : 0
    };
  });
  assert.equal(desktop.canvas, true, "3D canvas should initialise");
  assert.equal(desktop.gridColumns, 2, "desktop configurator should use two columns");
  assert.ok(desktop.canvasPixels > 1000, "canvas should render pixels");

  await page.locator('.ehx-tab[data-cat="cabinetry"]').click();
  await page.locator(".ehx-option").filter({ hasText: "Smoked walnut" }).click();
  await page.locator('.ehx-tab[data-cat="walls"]').click();
  await page.locator(".ehx-option").filter({ hasText: "Clay plaster" }).click();
  assert.match(await page.locator(".ehx-selection-note").innerText(), /Walls.*Clay plaster/);
  await page.locator('.ehx-tab[data-cat="cabinetry"]').click();
  assert.match(await page.locator(".ehx-selection-note").innerText(), /Cabinetry.*Smoked walnut/);
  assert.equal(await page.locator(".ehx-current-palette").innerText(), "YOUR MIX");

  await page.locator('.ehx-preset[data-preset="contrast"]').click();
  assert.equal(await page.locator(".ehx-current-palette").innerText(), "MODERN CONTRAST");
  await page.locator(".ehx-reset-materials").click();
  assert.equal(await page.locator(".ehx-current-palette").innerText(), "WARM MINIMAL");
  await page.screenshot({ path: "artifacts/ehx-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on("pageerror", error => pageErrors.push(error.message));
  await mobile.goto("http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded" });
  await mobile.waitForFunction(() => {
    const loading = document.querySelector(".ehx-loading");
    return loading && loading.classList.contains("hidden");
  }, null, { timeout: 30000 });
  const mobileLayout = await mobile.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    rootWidth: Math.round(document.querySelector(".ehx-site").getBoundingClientRect().width),
    columns: getComputedStyle(document.querySelector(".ehx-config-grid")).gridTemplateColumns.split(" ").length
  }));
  assert.ok(mobileLayout.scrollWidth <= mobileLayout.width + 1, "mobile should not overflow horizontally");
  assert.equal(mobileLayout.columns, 1, "mobile configurator should stack cleanly");
  await mobile.screenshot({ path: "artifacts/ehx-mobile.png", fullPage: true });
  assert.deepEqual(pageErrors, [], "there should be no JavaScript page errors");
  console.log(JSON.stringify({ desktop, mobileLayout, pageErrors }, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
