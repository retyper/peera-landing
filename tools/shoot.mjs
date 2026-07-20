// OG 카드(1200×630) HTML을 PNG로 굽는다.
//
//   node tools/shoot.mjs tools/og-card.html    peera-og.png
//   node tools/shoot.mjs tools/og-card-en.html peera-og-en.png
//
// 이 저장소엔 node_modules가 없다(정적 페이지라 의존성이 없다). playwright는
// 본품(dearmydiary)의 것을 빌려 쓴다. 경로가 다르면 PLAYWRIGHT_FROM 으로 지정한다:
//   PLAYWRIGHT_FROM=/path/to/some-project/package.json node tools/shoot.mjs ...
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const FROM = process.env.PLAYWRIGHT_FROM
  || "C:/Users/YunCheolShin/Desktop/flutter/dearmydiary/package.json";

let chromium;
try {
  chromium = createRequire(FROM)("playwright").chromium;
} catch {
  try {
    chromium = (await import("playwright")).chromium;         // 전역 설치돼 있으면
  } catch {
    console.error(
      "playwright를 찾지 못했습니다.\n" +
      "  · 본품 경로가 다르면: PLAYWRIGHT_FROM=<프로젝트>/package.json 을 지정하세요\n" +
      "  · 또는: npm i -D playwright && npx playwright install chrome"
    );
    process.exit(1);
  }
}

const [html, out] = process.argv.slice(2);
if (!html || !out) {
  console.error("사용법: node tools/shoot.mjs <카드.html> <출력.png>");
  process.exit(1);
}

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,     // OG는 1200×630 실측이어야 한다 — 2배로 구우면 규격이 깨진다
});
await page.goto(pathToFileURL(path.resolve(html)).href);
await page.waitForLoadState("networkidle");
try { await page.evaluate(() => document.fonts.ready); } catch {}
await page.waitForTimeout(800);              // 웹폰트가 실제로 그려질 때까지
await page.screenshot({ path: path.resolve(out) });
await browser.close();

console.log("saved:", path.resolve(out));
