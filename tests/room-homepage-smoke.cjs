const { chromium } = require('playwright');
const fs = require('node:fs');
fs.mkdirSync('artifacts', { recursive: true });
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const errors = [];
  const consoleErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    const response = await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, 'homepage should load');

    await page.waitForFunction(() => document.querySelector('.ehx-site')?.dataset.ehxReady === '1', null, { timeout: 15000 });
    await page.waitForTimeout(1800);

    const desktop = await page.evaluate(() => {
      const room = document.querySelector('.ehx-room-canvas');
      const cssLink = document.querySelector('link[href*="story.css"]');
      const style = getComputedStyle(document.querySelector('.ehx-configurator'));
      const materialColumnStyle = getComputedStyle(document.querySelector('.ehx-material-column'));
      const viewer = document.querySelector('.ehx-viewer');
      const panel = document.querySelector('.ehx-configurator');
      return {
        room: !!room && room.width > 0 && room.height > 0,
        cssUrl: cssLink?.getAttribute('href') || '',
        configuratorMaxWidth: document.querySelector('.ehx-configurator')?.getBoundingClientRect().width || 0,
        configuratorDisplay: style.display,
        materialColumnDisplay: materialColumnStyle.display,
        materialColumnGridTemplate: materialColumnStyle.gridTemplateColumns,
        viewerWidth: viewer?.getBoundingClientRect().width || 0,
        panelWidth: panel?.getBoundingClientRect().width || 0,
        paletteColumn: !!document.querySelector('.ehx-palette-column'),
        imageHero: !!document.querySelector('.ehx-material-room-image'),
        story: !!document.querySelector('.ehx-journey .ehx-canvas'),
        chapters: document.querySelectorAll('.ehx-journey .ehx-chapter[data-chapter]').length,
        project: !!document.querySelector('#ehx-project'),
        services: !!document.querySelector('#ehx-services'),
        pricing: !!document.querySelector('#ehx-pricing'),
        contact: !!document.querySelector('#ehx-contact'),
        tabs: document.querySelectorAll('.ehx-tab').length
      };
    });
    assert.equal(desktop.room, true, 'room canvas should initialise');
    assert.ok(desktop.cssUrl.includes('story.css?v=1.0.1'), 'stylesheet cache key must be fresh');
    assert.ok(desktop.configuratorMaxWidth <= 465.5, 'material panel must stay under 466px on desktop');
    assert.equal(desktop.configuratorDisplay, 'block', 'compact configurator must use the expected display mode');
    assert.equal(desktop.materialColumnDisplay, 'grid', 'surface controls must use the compact inline grid');
    assert.match(desktop.materialColumnGridTemplate, /78px/, 'surface label column should stay narrow');
    assert.ok(desktop.viewerWidth > 400, 'room should have a substantial visual area');
    assert.ok(desktop.panelWidth > 0 && desktop.panelWidth < desktop.viewerWidth * 0.75, 'material controls should stay compact');
    assert.equal(desktop.paletteColumn, false, 'large palette column must be removed');
    assert.equal(desktop.imageHero, false, 'hero must use the actual procedural 3D room, not the old scene images');
    assert.equal(desktop.story, true, 'original particle story canvas must remain');
    assert.equal(desktop.chapters, 5, 'all five original story chapters must remain');
    assert.equal(desktop.project, true);
    assert.equal(desktop.services, true);
    assert.equal(desktop.pricing, true);
    assert.equal(desktop.contact, true);
    assert.equal(desktop.tabs, 4, 'all editable surface types must remain available');

    await page.locator('[data-cat="cabinetry"]').click();
    await page.locator('.ehx-options .ehx-option').nth(1).click();
    await page.waitForFunction(() => document.querySelector('.ehx-selection-note')?.textContent.includes('Smoked walnut'));
    await page.locator('[data-cat="walls"]').click();
    await page.locator('.ehx-options .ehx-option').nth(2).click();
    await page.locator('[data-cat="cabinetry"]').click();
    const independent = await page.evaluate(() => ({
      selectedCabinet: !!document.querySelector('.ehx-options .ehx-option.active') && document.querySelector('.ehx-selection-note').textContent.includes('Smoked walnut'),
    }));
    assert.equal(independent.selectedCabinet, true, 'cabinet material choice must persist after changing a wall');

    await page.locator('.ehx-reset-materials').click();
    await page.waitForFunction(() => document.querySelector('.ehx-selection-note')?.textContent.includes('Natural oak'));
    await page.screenshot({ path: 'artifacts/desktop-homepage.png', fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const mobile = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      room: document.querySelector('.ehx-room-canvas')?.getBoundingClientRect().width || 0,
      panel: document.querySelector('.ehx-configurator')?.getBoundingClientRect().width || 0
    }));
    assert.ok(mobile.document <= mobile.viewport + 1, 'mobile page should not overflow horizontally');
    assert.ok(mobile.room > 0 && mobile.panel > 0, 'mobile room and material controls should remain visible');
    await page.screenshot({ path: 'artifacts/mobile-homepage.png', fullPage: true });
    assert.deepEqual(errors, [], 'no unhandled browser JavaScript errors');
    assert.deepEqual(consoleErrors.filter(e => !e.includes('favicon')), [], 'no browser console errors');
    console.log(JSON.stringify({ desktop, independent, mobile, pageErrors: errors, consoleErrors }, null, 2));
  } finally {
    await browser.close();
  }
})();
