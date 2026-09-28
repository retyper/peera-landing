// ─────────────────────────────────────────────────────────────
// 복습 페이지 첫 화면 피어라 안내 + 채널 표식 이어붙이기 검사
//
// 왜: 스레드 프로필 1번 링크가 review.html인데, 첫 방문자가 보는 s-none·s-intro 화면엔
//     「피어라」라는 글자도 신청 버튼도 없었다(9/26 감사 [1]/[7]/[14]/[20]). 끝 화면까지 간 사람만 봤다.
//     그리고 check·review·oneline·prompts·words 다섯 페이지는 CTA를 누를 때 원래 들어온 채널(utm_source=threads)을
//     버려서 시트 유입경로가 전부 「check / page / …」로 뭉개졌다(감사 [5]/[12]/[13]/[21]). koreanN·korean-review에만 있던
//     PEERA_SRC_SUFFIX 블록을 다섯 페이지에 넣고, index.html이 utm_content까지 시트에 싣게 한다.
//
// 이 검사가 빨개지는 경우:
//   [A] review/korean-review 빈 저장소(s-none)에서 위쪽 피어라 안내(#appTop)가 안 보이거나 「피어라」가 없다
//   [B] 기록이 있어 s-intro로 들어갔을 때 #appTop이 안 보인다 · 시작하기를 누른 뒤(s-card)에도 보인다
//   [C] ?utm_source=threads 로 들어왔는데 CTA 주소에 utm_content=src_threads 가 안 붙는다 (7 페이지)
//   [D] utm_source 없이 들어오면 주소가 그대로여야 한다 (src_ 가 붙으면 안 된다)
//   [E] index.html 이 utm_content 를 유입경로 칸에 안 싣는다
//   [F] 영어 브라우저에서 index.html?utm_… 이 en.html 로 넘어갈 때 ?utm_… 을 떨어뜨린다
//
// 쓰는 법: node tests/cta-top.mjs
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
const chromium = await (async () => {
  for (const spec of ["playwright", "/Users/" + (process.env.USER || "") + "/dearmydiary/node_modules/playwright/index.mjs",
                      new URL("../../dearmydiary/node_modules/playwright/index.mjs", import.meta.url).href,
                      new URL("../../emotion_cards/node_modules/playwright/index.mjs", import.meta.url).href]) {
    try { return (await import(spec)).chromium; } catch { /* 다음 후보 */ }
  }
  console.error("🟥 playwright 를 못 찾았습니다 (tests/redesign/run.mjs 머리말 참고)");
  process.exit(2);
})();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("no"); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let fail = 0;
const ok = (n, c, extra) => { if (c) console.log(`  ✅ ${n}`); else { fail++; console.log(`  🟥 ${n}${extra ? " — " + extra : ""}`); } };

const ALLCAP = {}; for (let c = 65; c <= 90; c++) ALLCAP[String.fromCharCode(c)] = 1;
const CHO = {}; for (const c of "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ") CHO[c] = 1;
const SEED = {
  "review.html": { check800_v1: JSON.stringify({ apple: 1, book: 1, cat: 1 }), check800_done_v1: JSON.stringify(ALLCAP),
                   review800_v1: JSON.stringify({ about: [2, 1] }), review800_size_v1: "20" },
  "korean-review.html": { korean1_v1: JSON.stringify({ "가게": 1, "가족": 1 }), korean1_done_v1: JSON.stringify(CHO),
                          "korean_review_v1": JSON.stringify({ "가을": [2, 1] }), korean_review_size_v1: "20" },
};

const browser = await chromium.launch();
const vis = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.classList.contains("hide") && e.offsetParent !== null; }, sel);
const hrefOf = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? e.getAttribute("href") : null; }, sel);

// [A]·[B] 복습 페이지 두 개 — 빈 상태 / 시작 화면 / 카드 화면
for (const file of ["review.html", "korean-review.html"]) {
  console.log(`\n[A] ${file} — 빈 저장소(첫 방문)`);
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/${file}`); await page.waitForTimeout(250);
    ok("s-none 화면이다", await vis(page, "#s-none"));
    ok("#appTop 이 보인다", await vis(page, "#appTop"));
    const txt = await page.evaluate(() => (document.querySelector("#appTop") || {}).textContent || "");
    ok("안내에 「피어라」가 있다", /피어라/.test(txt), txt.slice(0, 60));
    ok("신청 버튼이 있고 목적지가 랜딩 폼이다", /peera-landing\/\?utm_source=/.test(await hrefOf(page, "#appTop a[href]") || ""));
    ok("[D] utm_source 없이 들어오면 src_ 가 안 붙는다", !/utm_content=src_/.test(await hrefOf(page, "#appTop a[href]") || ""));
    await ctx.close();
  }
  console.log(`[B] ${file} — 기록 있음(시작 화면 → 카드)`);
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((seed) => { for (const k in seed) localStorage.setItem(k, seed[k]); }, SEED[file]);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/${file}`); await page.waitForTimeout(250);
    ok("s-intro 화면이다", await vis(page, "#s-intro"));
    ok("#appTop 이 보인다", await vis(page, "#appTop"));
    await page.click("#bStart"); await page.waitForTimeout(200);
    ok("시작하기 뒤 s-card 화면이다", await vis(page, "#s-card"));
    ok("카드 푸는 중엔 #appTop 이 숨는다", !(await vis(page, "#appTop")));
    await ctx.close();
  }
}

// [C] 채널 표식 이어붙이기 — 7 페이지
console.log("\n[C] ?utm_source=threads 로 들어온 뒤 CTA 주소에 utm_content=src_threads");
const CTA = {
  "check.html": 'a[href*="utm_campaign=peera_check"]',
  "review.html": 'a[href*="utm_campaign=peera_review"]',
  "korean-review.html": 'a[href*="utm_campaign=peera_korean"]',
  "korean1.html": 'a[href*="utm_campaign=peera_korean"]',
  "oneline.html": 'a[href*="utm_campaign=peera_oneline"]',
  "prompts.html": 'a[href*="utm_campaign=peera_prompts"]',
  "words.html": 'a[href*="utm_campaign=peera_vocab"]',
};
for (const [file, sel] of Object.entries(CTA)) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${file}?utm_source=threads&utm_medium=post&utm_campaign=peera_science`); await page.waitForTimeout(250);
  const hs = await page.evaluate((s) => Array.from(document.querySelectorAll(s)).map((a) => a.getAttribute("href")), sel);
  ok(`${file}: CTA ${hs.length}개 전부 src_threads`, hs.length > 0 && hs.every((h) => /utm_content=src_threads/.test(h)), JSON.stringify(hs).slice(0, 160));
  // 같은 탭 안에서 다른 페이지로 옮겨도(주소에 utm 없음) 표식이 남는다
  await page.goto(`${BASE}/${file}`); await page.waitForTimeout(250);
  const hs2 = await page.evaluate((s) => Array.from(document.querySelectorAll(s)).map((a) => a.getAttribute("href")), sel);
  ok(`${file}: 같은 탭에서 utm 없이 다시 열어도 src_threads 유지`, hs2.length > 0 && hs2.every((h) => /utm_content=src_threads/.test(h)));
  await ctx.close();
}

// [E] index.html 이 utm_content 를 유입경로 칸에 싣는다
console.log("\n[E] index.html 유입경로 칸");
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ko-KR" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html?utm_source=review&utm_medium=page&utm_campaign=peera_review&utm_content=src_threads`); await page.waitForTimeout(300);
  const v = await page.evaluate(() => Array.from(document.querySelectorAll('input[data-source-field]')).map((e) => e.value));
  ok("유입경로 = review / page / peera_review / src_threads", v.length > 0 && v.every((x) => x === "review / page / peera_review / src_threads"), JSON.stringify(v));
  await page.goto(`${BASE}/index.html?utm_source=review&utm_medium=page&utm_campaign=peera_review`); await page.waitForTimeout(300);
  const v2 = await page.evaluate(() => Array.from(document.querySelectorAll('input[data-source-field]')).map((e) => e.value));
  ok("utm_content 없으면 예전 그대로 세 토막", v2.every((x) => x === "review / page / peera_review"), JSON.stringify(v2));
  await ctx.close();
}

// [F] 영어 브라우저 → en.html 로 넘어갈 때 ?utm 유지
console.log("\n[F] 언어 넘김이 주소 뒤를 지키는가");
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html?utm_source=review&utm_medium=page&utm_campaign=peera_review&utm_content=src_threads`); await page.waitForTimeout(600);
  ok("en.html 로 넘어갔다", /\/en\.html/.test(page.url()), page.url());
  ok("?utm_… 이 그대로 붙어 있다", /utm_content=src_threads/.test(page.url()), page.url());
  await ctx.close();
}

await browser.close(); server.close();
console.log(fail ? `\n🟥 실패 ${fail}` : "\n🟩 전부 통과");
process.exit(fail ? 1 : 0);
