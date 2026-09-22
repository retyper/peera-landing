// 내려받기용 PNG·PDF를 **페이지 HTML에서 읽어** 굽는다.
//
//   node tools/sheet.mjs prompts.html data/img/diary-prompts.png data/pdf/diary-prompts.pdf
//
// 왜 이렇게 만드나: 2026-09-22에 페이지 문구는 고쳤는데 내려받기 PNG에는 옛 문구
// (「쓸 게 없다는 아이에게」·「글감」)가 그대로 남아 있었다. grep이 이미지 속 글자를
// 못 보기 때문이다. ⇒ 제목·쓰는 법·질문 목록을 전부 페이지에서 파싱해 굽는다.
// 페이지를 고치고 이 스크립트를 다시 돌리면 이미지가 따라온다.
//
// 구울 때마다 재료(제목·리드·쓰는 법·질문 목록)의 해시를 data/생성-기록.json에 남긴다.
// 🟥 그 해시를 `peera-growth/운영/검사/문구-냉장고시험.mjs`가 읽어 「페이지는 고쳤는데
//    자료를 안 구웠다」를 잡는다. **추출 규칙을 고치면 그 검사도 같이 고쳐야 한다** —
//    한쪽만 고치면 검사가 전부 「낡았다」고 거짓말을 한다.
//    추출·해시 규칙 자체는 `tools/lib/prompts-parse.mjs` 한 곳에 있다(fridge.mjs와 공유).
//
// playwright는 본품(dearmydiary)의 것을 빌려 쓴다(shoot.mjs와 같은 방식).
import { createRequire } from "node:module";
import { writeFileSync, unlinkSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { 읽기, 기록하기 } from "./lib/prompts-parse.mjs";

const FROM = process.env.PLAYWRIGHT_FROM
  || "C:/Users/YunCheolShin/Desktop/flutter/dearmydiary/package.json";
const chromium = createRequire(FROM)("playwright").chromium;

const [src, outPng, outPdf] = process.argv.slice(2);
if (!src || !outPng) {
  console.error("사용법: node tools/sheet.mjs <페이지.html> <출력.png> [출력.pdf]");
  process.exit(1);
}

const { 제목, 리드, 쓰는법, 섹션, 총개수, 재료해시 } = 읽기(src);

const 주소 = "retyper.github.io/peera-landing/" + path.basename(src);
const 시트 = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="${pathToFileURL(path.resolve("assets/peera.css")).href}">
<style>
  @page { size: A4; margin: 14mm 13mm; }
  *{box-sizing:border-box}
  body{margin:0;width:1080px;background:#fff;color:var(--slate-12);
       font-family:var(--font-sans);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{padding:54px 58px 40px}
  h1{font-size:40px;line-height:1.28;font-weight:800;letter-spacing:-.02em;margin:0 0 14px}
  h1 b{color:var(--teal-11)}
  .lede{font-size:17px;line-height:1.6;margin:0 0 4px}
  .src{font-size:15px;margin:6px 0 0;color:var(--teal-12);font-weight:600}
  .how{background:var(--teal-2);border-left:4px solid var(--teal-9);border-radius:0 12px 12px 0;
       padding:16px 20px;margin:24px 0 8px;font-size:16px;line-height:1.65}
  .how b{color:var(--teal-11)}
  h2{font-size:20px;color:var(--teal-11);margin:30px 0 4px;padding-bottom:8px;
     border-bottom:2px solid var(--teal-6);break-after:avoid}
  .note{font-size:15px;margin:10px 0 0}
  ol{list-style:none;margin:6px 0 0;padding:0}
  li{display:flex;gap:16px;align-items:baseline;padding:11px 2px;
     border-bottom:1px solid var(--slate-4);font-size:18px;line-height:1.5;break-inside:avoid}
  li .n{flex:0 0 34px;color:var(--teal-11);font-weight:800;font-size:16px}
  footer{margin-top:28px;padding-top:14px;border-top:2px solid var(--slate-6);
         font-size:14px;line-height:1.6}
</style></head><body><div class="sheet">
<h1>${제목}</h1>
<p class="lede">${리드}</p>
<p class="src">${주소}</p>
<div class="how">${쓰는법}</div>
${섹션.map(s => `<h2>${s.제목}</h2>${s.안내 ? `<p class="note">${s.안내}</p>` : ""}
<ol>${s.줄.map(q => `<li><span class="n">${q.n}</span><span>${q.t}</span></li>`).join("")}</ol>`).join("\n")}
<footer>만든 곳: 피어라(1인 개발) · 질문은 어떤 효과도 약속하지 않습니다. 아이가 말문을 여는 자리를 만들 뿐입니다.</footer>
</div></body></html>`;

const 임시 = path.resolve("tools/_sheet.tmp.html");
writeFileSync(임시, 시트, "utf8");

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1400 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(임시).href);
await page.waitForLoadState("networkidle");
try { await page.evaluate(() => document.fonts.ready); } catch {}
await page.waitForTimeout(900);
await page.screenshot({ path: path.resolve(outPng), fullPage: true });

// PDF는 A4 안쪽 폭(≈780px)으로 줄여서 굽는다. 1080px 그대로 구우면 오른쪽이 잘린다.
if (outPdf) {
  await page.setViewportSize({ width: 820, height: 1400 });
  await page.evaluate(() => { document.body.style.width = "780px"; });
  await page.waitForTimeout(400);
  if (process.env.SHEET_PDF_PREVIEW)
    await page.screenshot({ path: path.resolve(process.env.SHEET_PDF_PREVIEW), fullPage: true });
  await page.pdf({ path: path.resolve(outPdf), format: "A4", printBackground: true,
                   margin: { top: "14mm", bottom: "14mm", left: "13mm", right: "13mm" } });
}
await browser.close();
unlinkSync(임시);
기록하기([outPng, outPdf], {
  출처: path.basename(src),
  재료해시,
  제목: 제목.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  개수: 총개수,
});

console.log(`구움: ${outPng}${outPdf ? " · " + outPdf : ""} — 질문 ${총개수}개 · 섹션 ${섹션.length}개`);
