// 냉장고에 붙이는 **A4 1장** 인쇄물을 굽는다.
//
//   node tools/fridge.mjs
//
// 🟥 2026-09-22 사장님 지시로 다시 만든 것이다:
//   *"라이티가 윙크하며 손들고있는 원본라이티도 어딘가 넣으면서 진짜 냉장고 붙이고 싶게
//     귀엽게 만들고 한장크기로 만들어야하고 제목이 심플해야하며 웹주소같은건 아무의미가 없어
//     QR코드면 모를까. 그리고 텍스트 빽빽 한거보고싶겠나."*
//
// 그래서 34개 전체 자료(tools/sheet.mjs)와 **다른 물건**이다:
//   · 34개 → 12개. 종이 한 장에 34개를 넣으면 빽빽해지고, 빽빽하면 아무도 안 본다.
//   · 마음을 묻는 질문 25~34번은 **뺐다.** 페이지가 「아이가 답하고 싶을 때만 읽어 주세요」라고
//     말하는 질문인데, 냉장고에 붙은 종이는 아이가 원하든 말든 매일 보인다. QR로만 닿게 둔다.
//   · 주소를 글자로 적지 않는다. QR 하나. (등록: peera-growth/콘텐츠/UTM-링크표.md)
//
// 문장은 **prompts.html이 원본**이다(번호로 꺼내 온다). 페이지 문구를 고치면 인쇄물이 따라온다.
// 안 구우면 peera-growth/운영/검사/문구-냉장고시험.mjs가 재료해시 불일치로 잡는다.
import { createRequire } from "node:module";
import { writeFileSync, unlinkSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { 읽기, 번호로, 기록하기 } from "./lib/prompts-parse.mjs";

const require = createRequire(import.meta.url);
const QR = require("qrcode");
const FROM = process.env.PLAYWRIGHT_FROM
  || "C:/Users/YunCheolShin/Desktop/flutter/dearmydiary/package.json";
const chromium = createRequire(FROM)("playwright").chromium;

const 원본 = "prompts.html";
const outPdf = "data/pdf/냉장고-질문12.pdf";
const outPng = "data/img/냉장고-질문12.png";

// 고른 12개 — 손으로 골랐다. 기준: ①아이가 눈·귀·코로 겪은 구체적인 것 ②감각을 골고루
// ③마지막은 내일로 끝낸다. 25~34(마음을 묻는 질문)과 9·24(속상·무서웠던)는 넣지 않는다.
const 고른번호 = [1, 4, 3, 7, 16, 10, 11, 15, 21, 17, 18, 12];

// 🟥 콘텐츠/UTM-링크표.md 209행(2026-09-22 신설)에 등록된 링크. 표에 없는 링크는 쓰지 않는다.
const QR주소 = "https://retyper.github.io/peera-landing/prompts.html"
  + "?utm_source=print&utm_medium=qr&utm_campaign=peera_prompts";

const 재료 = 읽기(원본);
const 질문 = 번호로(재료, 고른번호);
const qrSvg = await QR.toString(QR주소, {
  type: "svg", margin: 1, errorCorrectionLevel: "M",
  color: { dark: "#000000", light: "#ffffff" },
});
const 라이티 = pathToFileURL(path.resolve("assets/writy-wink-cut.png")).href;  // 배경 지운 컷아웃 — tools/cutout.mjs

// A4(210×297mm) - 좌우 13mm - 상하 13mm = 184×271mm.
// 96dpi에서 1px = 0.2646mm 이므로 안쪽은 정확히 695×1024px. 690px으로 짓는다.
// 글자 크기 환산: 1px ≈ 0.75pt. 질문 24px ≈ 18pt(인쇄해서 읽기 충분).
const 시트 = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<!-- 🟥 title은 장식이 아니다. page.pdf가 이 글자를 PDF 문서 제목으로 박는다.
     없으면 사장님이 PDF를 열 때 뷰어 상단에 「_fridge.tmp.html」이 뜬다(실제로 봤다). -->
<title>오늘 뭐 물어볼까?</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
  @page { size: A4; margin: 13mm; }
  :root{
    --ink:#1c2024; --teal:#008573; --teal9:#12a594; --teal6:#b8eae0;
    --teal2:#f3fbf9; --teal1:#fafefd;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{width:690px;background:#fff;color:var(--ink);
       font-family:"Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif;
       -webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{width:690px;border:3px dashed var(--teal6);border-radius:26px;padding:22px 24px 18px}

  header{position:relative;height:172px;margin:0 0 10px}
  .say{padding:4px 150px 0 0}
  .bubble{position:relative;display:inline-block;background:var(--teal2);
          border:2.5px solid var(--teal6);border-radius:22px;padding:12px 24px 14px}
  h1{margin:0;font-size:46px;line-height:1.15;font-weight:800;letter-spacing:-.03em;color:var(--teal)}
  .bubble:after{content:"";position:absolute;right:38px;bottom:-15px;width:22px;height:22px;
                background:var(--teal2);border-right:2.5px solid var(--teal6);
                border-bottom:2.5px solid var(--teal6);transform:rotate(45deg) skew(-6deg,-6deg)}
  .sub{margin:14px 0 0;font-size:19px;line-height:1.55;font-weight:600}
  /* 🟥 원본이 256px짜리 PNG뿐이다(벡터 없음). 132px(≈35mm)로 넣으면 인쇄 해상도가
     179px÷35mm ≈ 130dpi다. 더 키우면 100dpi 아래로 떨어져 인쇄에서 뭉갠다.
     같은 포즈의 고해상도·벡터 원본이 생기면 키울 수 있다. */
  .writy{position:absolute;right:6px;top:22px;width:132px;height:auto}

  ol{list-style:none;margin:0;padding:0}
  li{display:flex;align-items:center;gap:15px;border-radius:14px;
     padding:8px 16px;margin:0 0 3px;break-inside:avoid}
  li:nth-child(odd){background:var(--teal1)}
  li:nth-child(even){background:var(--teal2)}
  .n{flex:0 0 34px;height:34px;border-radius:50%;background:var(--teal9);color:#fff;
     font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center}
  .q{font-size:24px;line-height:1.3;font-weight:600}

  footer{display:flex;align-items:center;gap:18px;margin:12px 0 0;
         padding-top:14px;border-top:2.5px dashed var(--teal6)}
  .qr{flex:0 0 116px;width:116px;height:116px}
  .qr svg{width:116px;height:116px;display:block}
  .more{font-size:22px;font-weight:800;line-height:1.35;color:var(--teal)}
  .fine{font-size:16px;font-weight:500;line-height:1.5;margin:7px 0 0;color:var(--ink)}
</style></head><body><div class="sheet">

<header>
  <div class="say">
    <div class="bubble"><h1>${제목()}</h1></div>
    <p class="sub">하루에 하나만 골라서 물어봐 주세요.<br>답이 한 줄이어도 괜찮아요.</p>
  </div>
  <img class="writy" src="${라이티}" alt="라이티">
</header>

<ol>${질문.map((q, i) => `<li><span class="n">${i + 1}</span><span class="q">${q.t}</span></li>`).join("")}</ol>

<footer>
  <div class="qr">${qrSvg}</div>
  <div>
    <div class="more">폰으로 찍으면<br>질문이 ${재료.총개수}개 다 있어요</div>
    <p class="fine">피어라가 만들었습니다</p>
  </div>
</footer>

</div></body></html>`;

// 제목은 페이지에서 가져오지 않는다 — 페이지 제목(34개 목록)과 이 종이의 제목은 다른 물건이다.
// 🟥 냉장고 시험: 주어가 아이의 결핍이 아니라 **부모가 하는 일**이어야 한다.
function 제목() { return "오늘 뭐 물어볼까?"; }

const 임시 = path.resolve("tools/_fridge.tmp.html");
writeFileSync(임시, 시트, "utf8");

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 690, height: 1024 }, deviceScaleFactor: 2 });
const page = await context.newPage();
await page.goto(pathToFileURL(임시).href);
await page.waitForLoadState("networkidle");
try { await page.evaluate(() => document.fonts.ready); } catch {}
await page.waitForTimeout(900);

// 🟥 높이를 먼저 잰다. 1024px(A4 안쪽 271mm)을 넘으면 2페이지가 된다 —
//    구운 다음에 페이지 수를 세면 늦고, 여기서 숫자로 남겨야 왜 넘쳤는지 보인다.
const 잰값 = await page.evaluate(() => {
  const s = document.querySelector(".sheet");
  const r = s.getBoundingClientRect();
  return { 시트높이: Math.round(r.height), 본문높이: document.body.scrollHeight,
           질문칸: [...document.querySelectorAll("li")].map(l => Math.round(l.getBoundingClientRect().height)) };
});
console.log(`잰 높이: 시트 ${잰값.시트높이}px / A4 안쪽 1024px · 질문칸 ${잰값.질문칸.join(",")}`);

// 🟥 「웹주소같은건 아무의미가 없어」 — 보이는 글자에 주소가 하나도 없어야 한다.
//    QR SVG와 폰트 CDN <link>는 글자가 아니라 통과. innerText만 본다.
//    빨개지는 조건: 누가 다시 footer에 주소를 적어 넣을 때.
{
  const 보이는글 = await page.evaluate(() => document.body.innerText);
  const 주소흔적 = 보이는글.match(/https?:|:\/\/|github\.io|\.html|www\./g);
  console.log(`보이는 글자 ${보이는글.replace(/\s+/g, " ").length}자 · 주소 흔적 ${주소흔적 ? 주소흔적.join(",") : "0건"}`);
  if (주소흔적) { console.error(`🟥 인쇄물에 주소가 글자로 적혀 있다: ${주소흔적.join(",")}`); process.exit(1); }
}
await page.screenshot({ path: path.resolve(outPng), clip: { x: 0, y: 0, width: 690, height: 1024 } });
await page.pdf({ path: path.resolve(outPdf), format: "A4", printBackground: true,
                 margin: { top: "13mm", bottom: "13mm", left: "13mm", right: "13mm" } });
await browser.close();
unlinkSync(임시);

const 쪽수 = (readFileSync(path.resolve(outPdf), "latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
// 🟥 QR을 **다시 읽어** 확인한다. 그려 놓은 것만 보면 ①주소가 틀렸는지 ②너무 작아
//    폰이 못 읽는지를 둘 다 못 본다. 구운 PNG를 디코딩해서 등록된 주소와 글자로 대조한다.
//    빨개지는 조건: QR 크기를 줄이거나 QR주소 상수를 고쳤는데 다시 안 구웠을 때.
{
  const { PNG } = require("pngjs");
  const jsQR = require("jsqr").default ?? require("jsqr");
  const img = PNG.sync.read(readFileSync(path.resolve(outPng)));
  const 읽힌것 = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
  console.log(`QR 디코딩: ${읽힌것 ? 읽힌것.data : "실패(못 읽었다)"}`);
  if (!읽힌것 || 읽힌것.data !== QR주소) {
    console.error(`🟥 QR이 등록된 주소와 다르다\n  기대: ${QR주소}\n  읽힘: ${읽힌것 ? 읽힌것.data : "없음"}`);
    process.exit(1);
  }
}
기록하기([outPng, outPdf], {
  출처: 원본, 재료해시: 재료.재료해시, 제목: 제목(),
  개수: 질문.length, 고른번호, QR주소, 쪽수,
});
console.log(`구움: ${outPng} · ${outPdf} — 질문 ${질문.length}개 · ${쪽수}쪽 · 시트 ${잰값.시트높이}px`);
if (쪽수 !== 1) { console.error(`🟥 ${쪽수}쪽이다. 한 장이 아니다.`); process.exit(1); }
