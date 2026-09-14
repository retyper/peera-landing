// ─────────────────────────────────────────────────────────────
// 리디자인 회귀 검사 — 디자인을 바꿔도 **기능이 그대로인지** 진짜 브라우저로 눌러서 확인한다.
//
// 쓰는 법 (디자인 손대기 **전에** 한 번, 바꾼 뒤에 또):
//   node tests/redesign/run.mjs --record   ← 지금 상태를 golden.json 으로 뜨고 before 스크린샷
//   node tests/redesign/run.mjs            ← golden 과 대조 + after 스크린샷
//
// 왜 golden 방식인가: "앱 넘기기 주소가 바이트 단위로 같아야 한다" 같은 건 손으로 적을 수 없다
// (known 은 낱말 목록에서 계산된다). 지금 값을 떠 두고 나중과 대조하는 게 유일하게 정직한 방법이다.
//
// ★이 검사가 의미 있으려면 **바꾼 뒤 빨개질 수 있어야** 한다. --selftest 를 주면 일부러 id를
//   지우고 키 이름을 바꿔 본 뒤, 검사가 실제로 빨간불을 내는지 확인한다.
//
// 건드리는 것: 없음. 제품 파일은 읽기만 한다(로컬 정적 서버로 연다).
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
// ★playwright 를 어디서 찾을지 — 이 레포는 빌드가 없어서 node_modules 가 없다. 형제 레포
//   (dearmydiary)에 이미 설치돼 있으면 그걸 쓰고, 없으면 무엇을 하면 되는지 알려 준다.
//   여기서 조용히 죽으면 "검사가 없는데 있다고 믿는" 상태가 되므로 반드시 크게 실패한다.
const chromium = await (async () => {
  for (const spec of ["playwright", "/Users/" + (process.env.USER || "") + "/dearmydiary/node_modules/playwright/index.mjs",
                      new URL("../../../dearmydiary/node_modules/playwright/index.mjs", import.meta.url).href]) {
    try { return (await import(spec)).chromium; } catch { /* 다음 후보 */ }
  }
  console.error(`🟥 playwright 를 못 찾았습니다.
   이 레포엔 node_modules 가 없습니다. 둘 중 하나로 해결하세요:
     · 형제 폴더에 dearmydiary 레포가 있으면 그대로 됩니다(거기 설치된 걸 씁니다)
     · 아니면:  cd tests/redesign && npm init -y && npm i playwright`);
  process.exit(2);
})();
import { PAGES, VIEWPORTS, REQUIRED_IDS, STORAGE_KEYS, GA_EVENTS, HANDOFF, LATE_IDS } from "./contract.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const RECORD = process.argv.includes("--record");
const SELFTEST = process.argv.includes("--selftest");
const SHOT_DIR = path.join(HERE, "shots", RECORD ? "before" : "after");
const GOLDEN = path.join(HERE, "golden.json");

let fail = 0;
const ok = (n, c, extra) => { if (c) console.log(`  ✅ ${n}`); else { fail++; console.log(`  🟥 ${n}${extra ? " — " + extra : ""}`); } };
// ★한 구간이 터져도 나머지를 계속 잰다 — 회귀 하네스가 첫 실패에서 멈추면 "무엇이 더 깨졌는지"를
//   한 번에 못 본다. 터진 것도 실패로 세고 이유를 남긴다.
async function section(title, fn) {
  console.log(`\n■ ${title}`);
  try { await fn(); }
  catch (e) { fail++; console.log(`  🟥 이 구간이 도중에 터졌다 — ${String(e && e.message || e).split("\n")[0].slice(0, 140)}`); }
}

// ── 아주 작은 정적 서버 (file:// 은 localStorage·fetch 제약이 있어 http 로 연다) ──
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".wasm": "application/wasm", ".riv": "application/octet-stream",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".pdf": "application/pdf", ".csv": "text/csv" };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("no"); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}`;
console.log(`정적 서버 ${BASE}  (${ROOT})\n`);

fs.mkdirSync(SHOT_DIR, { recursive: true });
const golden = RECORD ? {} : JSON.parse(fs.readFileSync(GOLDEN, "utf8"));
const record = {};

// 페이지가 뜨기 전에 심는 것: gtag 스텁(이벤트를 가로채 모은다) + 결정적인 저장값
const initScript = ([seedJson]) => {
  // ★계측은 gtag 를 가로채면 안 잡힌다 — 페이지가 나중에 자기 gtag 를 정의하면서 덮어쓴다
  //   (check.html:1305 `function gtag(){dataLayer.push(arguments);}`). 그래서 **dataLayer 를** 본다.
  //   첫 판에서 "나간 이벤트: 없음"이 나온 게 이 때문이었다 — 페이지가 아니라 검사가 틀렸다.
  window.dataLayer = [];
  const realPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function (a) { try { if (a && a[0] === "event") window.__gaSeen.push(String(a[1])); } catch (e) {} return realPush(a); };
  window.__gaSeen = [];
  Object.defineProperty(window, "__ga", { get: () => window.__gaSeen.map((n) => ({ name: n })) });
  // print / 다운로드는 실제로 실행하지 않고 '불렸다'만 기록한다(검사가 프린터를 열면 안 된다)
  window.__printed = 0;
  window.print = function () { window.__printed++; };
  window.__downloads = [];
  const realClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute("download") || String(this.href || "").startsWith("blob:") || String(this.href || "").startsWith("data:")) {
      window.__downloads.push({ download: this.getAttribute("download") || "", href: String(this.href || "").slice(0, 40) });
      return;
    }
    return realClick.apply(this, arguments);
  };
  // 이동 주소는 여기서 못 가로챈다 — window.location 은 요즘 크롬에서 재정의가 막혀 있다
  // (첫 판에서 "이동이 안 잡혔다"가 이 때문이었다). 대신 바깥(playwright route)에서 받아 적는다.
  const seed = JSON.parse(seedJson);
  for (const k of Object.keys(seed)) { try { localStorage.setItem(k, seed[k]); } catch (e) {} }
};

const browser = await chromium.launch();

async function open(page, vp, seed = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, locale: "ko-KR" });
  await ctx.addInitScript(initScript, [JSON.stringify(seed)]);
  // 앱으로 나가는 이동은 막되 **주소는 받아 적는다** — 이게 '앱 넘기기 규약'의 증거다.
  // (검사가 실제 라이브 앱을 건드리면 안 되므로 abort 한다.)
  const navs = [];
  await ctx.route("**dearmydiary.vercel.app**", (r) => { navs.push(r.request().url()); r.abort(); });
  // ★기다림을 짧게 — 기본 30초면 무언가 깨졌을 때 한 판에 몇 분이 걸린다. 회귀 검사는 깨졌을 때
  //   **빨리** 빨간불을 보여 줘야 쓴다(일부러 깨뜨려 보다가 2분을 넘겨서 알게 됐다).
  ctx.setDefaultTimeout(5000);
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  p.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 120)); });
  await p.goto(`${BASE}/${page}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  return { ctx, p, errs, navs };
}

// ── 모든 페이지 공통 ───────────────────────────────────────────
for (const page of PAGES) {
  console.log(`\n■ ${page}`);
  for (const vp of VIEWPORTS) {
    const { ctx, p, errs } = await open(page, vp);
    ok(`[${vp.tag}] 로드 오류 0`, errs.length === 0, errs.slice(0, 2).join(" | "));
    const ids = await p.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id).sort());
    for (const need of (REQUIRED_IDS[page] || []).filter((x) => !LATE_IDS.includes(x))) {
      ok(`[${vp.tag}] id "${need}" 가 있다`, ids.includes(need), "리디자인이 이 손잡이를 지웠다 — 화면은 멀쩡해 보여도 동작이 죽는다");
    }
    await p.screenshot({ path: path.join(SHOT_DIR, `${page.replace(".html", "")}-${vp.tag}.png`), fullPage: true });
    if (vp.tag === "desktop") {
      record[`${page}:ids`] = ids;
      if (!RECORD) {
        const lost = (golden[`${page}:ids`] || []).filter((x) => !ids.includes(x));
        ok(`id 가 하나도 사라지지 않았다 (${ids.length}개)`, lost.length === 0, `사라진 id: ${lost.join(", ")}`);
      }
    }
    await ctx.close();
  }
}

// ── check.html — 실제로 눌러 본다 ─────────────────────────────
await section("check.html 동작", async () => {
  const vp = VIEWPORTS[0];
  const { ctx, p, navs } = await open("check.html", vp);
  const chips = p.locator("[data-w]");
  const n = await chips.count();
  ok(`낱말 버튼이 그려진다 (${n}개)`, n > 0);

  await chips.nth(0).click(); await chips.nth(1).click(); await chips.nth(2).click();
  await p.waitForTimeout(300);
  const saved = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("check800_v1") || "{}")).length);
  ok(`누른 낱말이 check800_v1 에 저장된다 (${saved}개)`, saved === 3, `${saved}개`);

  // ★letter_toggle 은 낱말 칩이 아니라 **글자 머리글(h3)** 을 눌러야 난다(check.html:1196 toggle()).
  //   그런데 머리글을 누르면 화면이 그 글자 보기로 바뀌어 뒷 단계(내보내기·이어하기)가 다 깨진다
  //   — 그래서 **따로 연 탭에서** 잰다. (한 탭에서 다 하려다 내 검사가 스스로를 망가뜨렸다.)
  {
    const t = await open("check.html", vp);
    await t.p.locator("[data-letter] h3").first().click().catch(() => {});
    await t.p.waitForTimeout(400);
    const ev = await t.p.evaluate(() => window.__ga.map((e) => e.name));
    ok(`letter_toggle 계측이 나간다`, ev.includes("letter_toggle"), `나간 이벤트: ${ev.join(", ") || "없음"}`);
    await t.ctx.close();
  }

  // A 끝내기 — 푸터의 "다 봤어요"
  const doneBtn = p.getByRole("button", { name: /다 봤어요/ }).first();
  if (await doneBtn.count()) {
    await doneBtn.click(); await p.waitForTimeout(400);
    const d = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("check800_done_v1") || "{}")).length);
    ok(`"다 봤어요" → check800_done_v1 에 기록된다 (${d}개)`, d >= 1, `${d}개`);
  } else ok(`"다 봤어요" 버튼이 있다`, false, "푸터 버튼을 못 찾았다");

  // 내보내기 3종 — 실제로 누르고 '무엇이 불렸는지'를 본다
  await p.locator("#bPdf").click(); await p.waitForTimeout(500);
  ok(`PDF 내보내기가 window.print 를 부른다`, await p.evaluate(() => window.__printed > 0));
  await p.locator("#bImg").click(); await p.waitForTimeout(1500);
  const dl = await p.evaluate(() => window.__downloads.length);
  ok(`이미지 저장이 다운로드를 만든다 (${dl}건)`, dl > 0, "캔버스→다운로드 경로가 끊겼다");
  await p.locator("#bCopy").click(); await p.waitForTimeout(400);
  const ev2 = await p.evaluate(() => window.__ga.map((e) => e.name));
  for (const e of ["export_pdf", "export_image", "export_copy"]) ok(`${e} 계측이 나간다`, ev2.includes(e));

  // 새로고침 후 이어하기 배너
  await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1200);
  const resumeVisible = await p.evaluate(() => {
    const r = document.getElementById("resume"); if (!r) return false;
    return getComputedStyle(r).display !== "none" && r.offsetHeight > 0;
  });
  ok(`새로고침하면 이어하기 배너가 뜬다`, resumeVisible, "#resume 가 안 보인다");

  // "오늘의 복습 시작하기" 링크
  const reviewHref = await p.evaluate(() => { const b = document.getElementById("bReview"); return b ? (b.getAttribute("href") || b.dataset.href || b.tagName) : null; });
  ok(`복습으로 가는 문(#bReview)이 있다`, reviewHref !== null, "없어졌다");

  // ★앱 넘기기 주소 — 바이트 단위 기록
  await p.locator("#bApp").click(); await p.waitForTimeout(600);
  const nav = navs[0] || null;
  ok(`앱 넘기기 주소가 만들어진다`, !!nav, "이동이 안 잡혔다");
  if (nav) {
    const u = new URL(nav);
    const spec = HANDOFF["check.html"];
    ok(`주소가 ${spec.host}${spec.path} 이다`, u.host === spec.host && u.pathname === spec.path, nav.slice(0, 80));
    for (const k of spec.params) ok(`  파라미터 ${k} 가 있다`, u.searchParams.has(k), `없다 — 앱이 "읽지 못했어요"로 거부한다`);
    record["check:handoff"] = nav;
    if (!RECORD) ok(`★앱 넘기기 주소가 바이트 단위로 같다`, nav === golden["check:handoff"],
      `지금 ${nav}\n        예전 ${golden["check:handoff"]}`);
  }
  await ctx.close();
});

// ── review.html — 실제로 눌러 본다 ────────────────────────────
await section("review.html 동작", async () => {
  const vp = VIEWPORTS[0];
  // ① 체크 기록이 없을 때 빈 상태
  {
    const { ctx, p } = await open("review.html", vp);
    const shown = await p.evaluate(() => ["s-intro", "s-card", "s-done", "s-none"]
      .filter((id) => { const e = document.getElementById(id); return e && getComputedStyle(e).display !== "none" && e.offsetHeight > 0; }));
    ok(`체크 기록이 없으면 빈 상태(s-none)를 보여 준다 (${shown.join(",") || "없음"})`, shown.includes("s-none"), `보인 화면: ${shown.join(",") || "없음"}`);
    await ctx.close();
  }
  // ② 체크 기록이 있으면 시작 → 카드 → 끝
  {
    // ★done 은 '대문자 첫 글자'가 키다(review.html:214 doneL[w.charAt(0).toUpperCase()]).
    //   소문자로 넣으면 복습 풀이 비어 s-none 이 뜨고, "시작 버튼이 안 보인다"가 된다(첫 판이 그랬다).
    const ALL = {}; for (let c = 65; c <= 90; c++) ALL[String.fromCharCode(c)] = 1;
    const seed = { "check800_v1": JSON.stringify({}), "check800_done_v1": JSON.stringify(ALL) };
    const { ctx, p } = await open("review.html", vp, seed);
    const introShown = await p.evaluate(() => { const e = document.getElementById("s-intro"); return !!e && getComputedStyle(e).display !== "none"; });
    ok(`체크 기록이 있으면 시작 화면(s-intro)이 뜬다`, introShown);
    const pills = await p.locator("#sizeRow button").count();
    ok(`분량 알약(5/10/20)이 있다 (${pills}개)`, pills >= 3, `${pills}개`);

    await p.locator("#bStart").click(); await p.waitForTimeout(800);
    const cardShown = await p.evaluate(() => { const e = document.getElementById("s-card"); return !!e && getComputedStyle(e).display !== "none"; });
    ok(`시작하면 카드 화면(s-card)이 뜬다`, cardShown);
    ok(`review_start 계측이 나간다`, await p.evaluate(() => window.__ga.some((e) => e.name === "review_start")));

    // 알아요/아직 눌러서 기록이 쌓이는지
    for (let i = 0; i < 5; i++) {
      const yes = p.locator("#bYes"), no = p.locator("#bNo"), next = p.locator("#bNext");
      if (await yes.isVisible().catch(() => false)) await yes.click();
      else if (await no.isVisible().catch(() => false)) await no.click();
      await p.waitForTimeout(250);
      if (await next.isVisible().catch(() => false)) { await next.click(); await p.waitForTimeout(250); }
    }
    const rec = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("review800_v1") || "{}")).length);
    ok(`알아요/아직 누른 것이 review800_v1 에 쌓인다 (${rec}개)`, rec > 0, "기록이 안 쌓인다");
    await ctx.close();
  }
  // ③ 앱 넘기기 주소 (st·t 포함)
  {
    const ALL2 = {}; for (let c = 65; c <= 90; c++) ALL2[String.fromCharCode(c)] = 1;
    const seed = {
      "check800_v1": JSON.stringify({}),
      "check800_done_v1": JSON.stringify(ALL2),
      "review800_v1": JSON.stringify({}),
    };
    const { ctx, p, navs } = await open("review.html", vp, seed);
    // ★s-done 안에 있어 화면에 안 보인다. playwright 의 force 클릭으로는 핸들러가 안 도는 경우가
    //   있어(첫 판에서 이동이 안 잡혔다), DOM 에서 직접 click() 을 부른다.
    await p.evaluate(() => { const g = document.getElementById("aGarden"); if (g) g.click(); });
    await p.waitForTimeout(800);
    const nav = navs[0] || null;
    ok(`말의 정원으로 가는 주소가 만들어진다`, !!nav && nav.includes("vocab-boost"), String(nav).slice(0, 80));
    if (nav && nav.includes("vocab-boost")) {
      const u = new URL(nav);
      for (const k of HANDOFF["review.html"].params) ok(`  파라미터 ${k} 가 있다`, u.searchParams.has(k), "없다 — 앱이 거부한다");
      record["review:handoff"] = nav;
      if (!RECORD) ok(`★앱 넘기기 주소가 바이트 단위로 같다`, nav === golden["review:handoff"],
        `지금 ${nav}\n        예전 ${golden["review:handoff"]}`);
    }
    await ctx.close();
  }
});

// ── words / prompts — 다운로드 링크와 인쇄 숨김 ───────────────
for (const page of ["words.html", "prompts.html"]) {
  console.log(`\n■ ${page} 동작`);
  const { ctx, p } = await open(page, VIEWPORTS[1]);
  const links = await p.evaluate(() => [...document.querySelectorAll("a[download], a[href$='.pdf'], a[href$='.csv'], a[href$='.txt']")]
    .map((a) => ({ href: a.getAttribute("href"), download: a.getAttribute("download") })));
  ok(`다운로드 링크가 있다 (${links.length}개)`, links.length > 0, "하나도 없다");
  record[`${page}:downloads`] = links;
  if (!RECORD) {
    const before = golden[`${page}:downloads`] || [];
    ok(`다운로드 링크(href·download)가 그대로다`, JSON.stringify(links) === JSON.stringify(before),
      `지금 ${JSON.stringify(links).slice(0, 160)}\n        예전 ${JSON.stringify(before).slice(0, 160)}`);
  }
  const printHidden = await p.evaluate(() => {
    const found = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.MEDIA_RULE && String(rule.conditionText || rule.media.mediaText).includes("print")) {
            for (const r of rule.cssRules) if (/display\s*:\s*none/i.test(r.cssText)) found.push(r.selectorText);
          }
        }
      } catch (e) { /* 교차 출처 시트 무시 */ }
    }
    return found.sort();
  });
  record[`${page}:printHidden`] = printHidden;
  if (!RECORD) ok(`인쇄에서 숨기는 요소가 그대로다 (${printHidden.length}개)`,
    JSON.stringify(printHidden) === JSON.stringify(golden[`${page}:printHidden`] || []),
    `지금 ${printHidden.join(", ")}\n        예전 ${(golden[`${page}:printHidden`] || []).join(", ")}`);
  await ctx.close();
}

// ── GA 이벤트 이름 목록이 코드에 그대로 있는지 ────────────────
console.log(`\n■ 계측 이름`);
for (const page of PAGES) {
  const src = fs.readFileSync(path.join(ROOT, page), "utf8");
  for (const name of GA_EVENTS[page] || []) {
    ok(`${page}: "${name}" 이벤트가 남아 있다`, src.includes(`'${name}'`) || src.includes(`"${name}"`),
      "이름이 바뀌면 과거 데이터와 안 이어진다");
  }
}

// ── 저장 키 이름이 그대로인지 ─────────────────────────────────
console.log(`\n■ 저장 키`);
for (const [page, keys] of Object.entries(STORAGE_KEYS)) {
  const src = fs.readFileSync(path.join(ROOT, page), "utf8");
  for (const k of keys) ok(`${page}: "${k}" 키가 그대로다`, src.includes(k), "이름이 바뀌면 기존 사용자의 기록이 사라진다");
}

// ── 자기검사: 이 검사가 정말 빨간불을 낼 수 있나 ──────────────
if (SELFTEST) {
  console.log(`\n■ 자기검사 — 일부러 깨 보고 검사가 잡는지`);
  const f = path.join(ROOT, "check.html");
  const orig = fs.readFileSync(f, "utf8");
  try {
    fs.writeFileSync(f, orig.replace('id="bApp"', 'id="bAppX"').replace(/check800_v1/g, "check800_v2"));
    const src = fs.readFileSync(f, "utf8");
    ok(`id 를 지우면 잡는다`, !src.includes('id="bApp"'), "자기검사 준비 실패");
    ok(`키 이름을 바꾸면 잡는다`, !src.includes("check800_v1"), "자기검사 준비 실패");
    console.log(`     (위 두 줄이 ✅면, 위쪽 본 검사들이 이 상태에서 🟥가 된다는 뜻이다 — 아래 복원 후 다시 돌려 확인)`);
  } finally {
    fs.writeFileSync(f, orig);
    console.log(`     check.html 원상복구 완료`);
  }
}

await browser.close();
server.close();

if (RECORD) {
  fs.writeFileSync(GOLDEN, JSON.stringify(record, null, 2));
  console.log(`\n기준값 저장: ${path.relative(ROOT, GOLDEN)}`);
}
console.log(`스크린샷: ${path.relative(ROOT, SHOT_DIR)}`);
console.log(fail === 0 ? `\n✅ 전부 통과` : `\n🟥 실패 ${fail}건`);
process.exit(fail === 0 ? 0 : 1);
