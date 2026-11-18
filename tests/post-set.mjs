// ─────────────────────────────────────────────────────────────
// 스레드 연재 글 → 체크 페이지 「글에 나온 낱말」 묶음 검사 (2026-11-18 출시·과금 위원회 결정 5)
//
// 왜: 11/14 c·g 글은 프로필 방문 543명을 만들었지만, 둘째 칸 링크로 온 사람은 800개 A~Z 목록 맨 앞(a, about…)을 만났다.
//     글에서 본 ou·ow 낱말을 찾으려면 직접 내려가야 했다. 예약된 글의 링크는 바꾸지 않고(이미 예약됨),
//     utm_source(threads_1119_1·threads_1124_1·threads_1128_1)로 어느 글에서 왔는지 알아 그 글의 낱말을 맨 위에 모은다.
//
// 이 검사가 빨개지는 경우:
//   [0] 로드 직후 페이지 오류가 있다
//   [1] utm_source 없이(또는 연재 글이 아닌 threads_1114_1로) 들어왔는데 묶음이 보인다
//   [2] 연재 글 주소로 들어왔는데 묶음이 없거나, 낱말 수가 글의 그림과 다르거나, 800개 목록에 없는 낱말이 있다
//   [3] 묶음에서 누른 낱말이 본 목록·저장소(check800_v1)에 반영되지 않는다 / 본 목록에서 누른 것이 묶음에 안 보인다
//   [4] 새로 고친 뒤 눌렀던 낱말이 묶음에서 꺼져 있다
//   [5] 닫기를 눌러도 묶음이 남아 있다
//
// 낱말 수의 근거(그림 원본):
//   oo  : peera-growth/콘텐츠/_패스/2026-11-19-스레드-oo/그림/_틀.mjs — 길게 13 + 짧게 11 + 다르게 4 = 28
//   ouow: peera-growth/콘텐츠/_패스/2026-11-24-스레드-ouow/그림/_틀.mjs — ou 12 + ow 20 = 32
//   y끝 : peera-growth/콘텐츠/_패스/2026-11-28-스레드-y끝/그림/_틀.mjs — 이 39 + 아이 8 = 47 (「비교」 줄은 중복이라 뺌)
// 저장 키 check800_v1: check.html 스크립트 `var KEY='check800_v1'`
//
// 쓰는 법: node tests/post-set.mjs
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
const chromium = await (async () => {
  for (const spec of ["playwright",
                      new URL("../../dearmydiary/node_modules/playwright/index.mjs", import.meta.url).href,
                      new URL("../../emotion_cards/node_modules/playwright/index.mjs", import.meta.url).href]) {
    try { return (await import(spec)).chromium; } catch { /* 다음 후보 */ }
  }
  console.error("🟥 playwright 를 못 찾았습니다"); process.exit(2);
})();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".riv": "application/octet-stream", ".wasm": "application/wasm" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("no"); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/check.html`;
const Q = s => `${BASE}?utm_source=${s}&utm_medium=post&utm_campaign=peera_check`;

let fail = 0;
const ok = (c, m) => { console.log(`  ${c ? "✅" : "🟥"} ${m}`); if (!c) fail++; };

const browser = await chromium.launch();
async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.route(/googletagmanager|google-analytics/, r => r.abort());
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  return { ctx, page, errs };
}
const bandInfo = page => page.evaluate(() => {
  const b = document.getElementById("postSet");
  if (!b || b.hidden || b.offsetParent === null) return { shown: false };
  const ws = [...b.querySelectorAll("[data-pw]")].map(x => x.dataset.pw);
  const main = new Set([...document.querySelectorAll(".grp .w")].map(x => x.dataset.w));
  return { shown: true, n: ws.length, missing: ws.filter(w => !main.has(w)), first: ws.slice(0, 4), heads: [...b.querySelectorAll("h3")].map(h => h.innerText.replace(/\s+/g, " ")) };
});

// [0][1] 일반 방문
{
  const { ctx, page, errs } = await fresh();
  console.log("[0][1] utm 없음 · 연재 아닌 글");
  await page.goto(BASE); await page.waitForTimeout(400);
  ok(errs.length === 0, `로드 직후 오류 0건 — 지금 ${JSON.stringify(errs)}`);
  let i = await bandInfo(page); ok(!i.shown, `utm 없이 묶음 안 보임 — 지금 ${JSON.stringify(i)}`);
  await page.goto(Q("threads_1114_1")); await page.waitForTimeout(400);
  i = await bandInfo(page); ok(!i.shown, `threads_1114_1 묶음 안 보임 — 지금 ${JSON.stringify(i)}`);
  await ctx.close();
}

// [2] 세 편
for (const [src, n] of [["threads_1119_1", 28], ["threads_1124_1", 32], ["threads_1128_1", 47]]) {
  const { ctx, page, errs } = await fresh();
  console.log(`[2] ${src}`);
  await page.goto(Q(src)); await page.waitForTimeout(400);
  const i = await bandInfo(page);
  ok(errs.length === 0, `오류 0건 — 지금 ${JSON.stringify(errs)}`);
  ok(i.shown && i.n === n, `묶음 낱말 ${n}개 — 지금 ${i.n} · 앞 넷 ${JSON.stringify(i.first)} · 제목 ${JSON.stringify(i.heads)}`);
  ok(i.shown && i.missing.length === 0, `800개 목록에 없는 낱말 0 — 지금 ${JSON.stringify(i.missing)}`);
  const top = await page.evaluate(() => { const b = document.getElementById("postSet"); return b ? Math.round(b.getBoundingClientRect().top) : -1; });
  ok(top >= 0 && top < 844, `첫 화면 안에서 묶음이 시작 — top ${top}px`);
  await page.screenshot({ path: path.join(ROOT, "tests", `post-set-${src}.png`) });
  await ctx.close();
}

// [3][4][5] 누르기·새로 고침·닫기 (ouow)
{
  const { ctx, page, errs } = await fresh();
  console.log("[3][4][5] threads_1124_1 누르기");
  await page.goto(Q("threads_1124_1")); await page.waitForTimeout(400);
  await page.click('#postSet [data-pw="house"]');
  let s = await page.evaluate(() => ({ main: document.querySelector('.grp .w[data-w="house"]').classList.contains("on"),
    band: document.querySelector('#postSet [data-pw="house"]').classList.contains("on"),
    store: JSON.parse(localStorage.getItem("check800_v1") || "{}").house }));
  ok(s.main && s.band && !!s.store, `묶음에서 house → 본 목록 on·묶음 on·저장 — 지금 ${JSON.stringify(s)}`);
  // 푸터 약속 「어떤 낱말을 눌렀는지는 밖으로 나가지 않는다」 — GA로 가는 이벤트에 낱말이 실리면 빨강 (11/18 감사 1-c)
  const leak = await page.evaluate(() => JSON.stringify((window.dataLayer || []).map(a => [...a]).filter(a => a[0] === "event")));
  ok(!/house/.test(leak), `GA 이벤트에 누른 낱말 없음 — 지금 ${leak.slice(0, 160)}`);
  await page.evaluate(() => document.querySelector('.grp .w[data-w="cloud"]').click());
  s = await page.evaluate(() => document.querySelector('#postSet [data-pw="cloud"]').classList.contains("on"));
  ok(s, `본 목록에서 cloud → 묶음 on — 지금 ${s}`);
  await page.click('#postSet [data-pw="house"]');
  s = await page.evaluate(() => ({ main: document.querySelector('.grp .w[data-w="house"]').classList.contains("on"), band: document.querySelector('#postSet [data-pw="house"]').classList.contains("on") }));
  ok(!s.main && !s.band, `house 다시 누르면 둘 다 꺼짐 — 지금 ${JSON.stringify(s)}`);
  await page.reload(); await page.waitForTimeout(400);
  s = await page.evaluate(() => document.querySelector('#postSet [data-pw="cloud"]')?.classList.contains("on"));
  ok(s === true, `새로 고친 뒤 cloud 켜져 있음 — 지금 ${s}`);
  await page.click("#postSetClose"); await page.waitForTimeout(200);
  const i = await bandInfo(page);
  ok(!i.shown, `닫기 → 묶음 사라짐 — 지금 ${JSON.stringify(i.shown)}`);
  ok(errs.length === 0, `오류 0건 — 지금 ${JSON.stringify(errs)}`);
  await ctx.close();
}

await browser.close(); server.close();
console.log(fail ? `\n🟥 실패 ${fail}건` : "\n✅ 전부 통과");
process.exit(fail ? 1 : 0);
